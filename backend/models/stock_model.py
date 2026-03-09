"""
PortfolioLens — Stock Model (M in MVC)
Handles all data fetching and transformation via yfinance.
No Flask/routing concerns here — pure data logic only.
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from functools import lru_cache
import time


# --------------------------------------------------------------------------- #
#  Internal helpers
# --------------------------------------------------------------------------- #

def _fmt_market_cap(value: float) -> str:
    """Convert raw market-cap number to human-readable string."""
    if not value:
        return "N/A"
    if value >= 1e12:
        return f"${value / 1e12:.2f}T"
    if value >= 1e9:
        return f"${value / 1e9:.2f}B"
    if value >= 1e6:
        return f"${value / 1e6:.2f}M"
    return f"${value:,.0f}"


def _safe(value, default=0, fmt=None):
    """Return value or default; optionally apply format function."""
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return default
    return fmt(value) if fmt else value


def _pct(value, default=0) -> float:
    """Return a percentage float, defaulting gracefully."""
    v = _safe(value, default)
    return round(float(v) * 100, 2) if abs(float(v)) < 10 else round(float(v), 2)


# --------------------------------------------------------------------------- #
#  History builder
# --------------------------------------------------------------------------- #

def _build_history(hist_df: pd.DataFrame) -> list[dict]:
    """
    Convert a yfinance OHLCV DataFrame (with Dividends column) into the
    history format the frontend expects:
      {date, price, dividend, cumDiv, total, divPortion}
    """
    if hist_df is None or hist_df.empty:
        return []

    df = hist_df.copy()
    df.index = pd.to_datetime(df.index)

    # Ensure we have a Dividends column
    if "Dividends" not in df.columns:
        df["Dividends"] = 0.0

    records = []
    cum_div = 0.0

    for ts, row in df.iterrows():
        price = round(float(_safe(row.get("Close"), 0)), 2)
        div   = round(float(_safe(row.get("Dividends"), 0)), 4)
        cum_div = round(cum_div + div, 4)
        records.append({
            "date":       ts.strftime("%Y-%m-%d"),
            "price":      max(price, 0.01),
            "dividend":   div,
            "cumDiv":     cum_div,
            "total":      round(price + cum_div, 2),
            "divPortion": cum_div,
        })

    return records


# --------------------------------------------------------------------------- #
#  Revenue / financials helpers
# --------------------------------------------------------------------------- #

def _build_revenue_history(ticker_obj: yf.Ticker) -> list[dict]:
    """Pull 5-year annual income-statement data from yfinance."""
    try:
        inc = ticker_obj.income_stmt  # columns = fiscal year dates
        if inc is None or inc.empty:
            return []

        rev_row    = inc.loc["Total Revenue"]       if "Total Revenue"    in inc.index else None
        gp_row     = inc.loc["Gross Profit"]        if "Gross Profit"     in inc.index else None
        ni_row     = inc.loc["Net Income"]          if "Net Income"       in inc.index else None

        years = sorted(inc.columns)[-5:]  # last 5 fiscal years
        result = []
        for col in years:
            year_str = pd.Timestamp(col).strftime("%Y")
            rev = float(rev_row[col]) / 1e9 if rev_row is not None else 0
            gp  = float(gp_row[col])  / 1e9 if gp_row  is not None else 0
            ni  = float(ni_row[col])  / 1e9 if ni_row  is not None else 0
            result.append({
                "year":       year_str,
                "revenue":    round(rev, 2),
                "grossProfit": round(gp, 2),
                "netIncome":  round(ni, 2),
            })
        return result
    except Exception:
        return []


# --------------------------------------------------------------------------- #
#  DuPont decomposition
# --------------------------------------------------------------------------- #

def _dupont(info: dict) -> dict:
    roe           = _safe(info.get("returnOnEquity"),    0) * 100
    net_margin    = _safe(info.get("profitMargins"),     0) * 100
    asset_turnover = _safe(info.get("assetTurnover"),   1)
    leverage = roe / (net_margin * asset_turnover / 100) if (net_margin and asset_turnover) else 1
    return {
        "roe":          round(roe, 1),
        "netMargin":    round(net_margin, 2),
        "assetTurnover": round(asset_turnover, 2),
        "leverage":     round(leverage, 2),
    }


# --------------------------------------------------------------------------- #
#  Public API: StockModel
# --------------------------------------------------------------------------- #

class StockModel:
    """
    Model layer for individual stock/ETF/crypto data.
    All methods are stateless classmethods — think of this as a service object.
    """

    # Simple in-process cache: symbol -> (timestamp, data)
    _cache: dict = {}
    CACHE_TTL = 300  # seconds (5 min)

    # --------------------------------------------------------------------------
    @classmethod
    def _is_fresh(cls, symbol: str) -> bool:
        entry = cls._cache.get(symbol)
        return entry is not None and (time.time() - entry["ts"]) < cls.CACHE_TTL

    @classmethod
    def _store(cls, symbol: str, data: dict):
        cls._cache[symbol] = {"ts": time.time(), "data": data}

    @classmethod
    def _load(cls, symbol: str) -> dict | None:
        return cls._cache.get(symbol, {}).get("data")

    # --------------------------------------------------------------------------
    @classmethod
    def get_quote(cls, symbol: str) -> dict:
        """
        Return a lightweight quote object (price, change, key metrics).
        Used for ticker search results and quick stat cards.
        """
        if cls._is_fresh(symbol):
            return cls._load(symbol)

        try:
            tk   = yf.Ticker(symbol)
            info = tk.info or {}

            price      = _safe(info.get("currentPrice") or info.get("regularMarketPrice"), 0)
            prev_close = _safe(info.get("previousClose") or info.get("regularMarketPreviousClose"), price)
            change     = round(price - prev_close, 2)
            change_pct = round((change / prev_close * 100) if prev_close else 0, 2)

            result = {
                "symbol":        symbol.upper(),
                "name":          info.get("shortName") or info.get("longName") or symbol,
                "sector":        info.get("sector") or info.get("category") or "Other",
                "industry":      info.get("industry", ""),
                "type":          _infer_type(info),
                "price":         round(price, 2),
                "prevClose":     round(prev_close, 2),
                "change":        change,
                "changePct":     change_pct,
                "marketCap":     _fmt_market_cap(info.get("marketCap")),
                "pe":            round(_safe(info.get("trailingPE"), 0), 1),
                "pb":            round(_safe(info.get("priceToBook"), 0), 1),
                "eps":           round(_safe(info.get("trailingEps"), 0), 2),
                "dividendYield": _pct(info.get("dividendYield")),
                "beta":          round(_safe(info.get("beta"), 1.0), 2),
                "high52w":       round(_safe(info.get("fiftyTwoWeekHigh"), 0), 2),
                "low52w":        round(_safe(info.get("fiftyTwoWeekLow"), 0), 2),
                "grossMargin":   f"{_pct(info.get('grossMargins'))}%",
                "roic":          round(_pct(info.get("returnOnAssets")) * 1.5, 1),  # proxy
                "revenue":       _fmt_market_cap(info.get("totalRevenue")),
                "roe":           round(_pct(info.get("returnOnEquity")), 1),
                "debtEquity":    round(_safe(info.get("debtToEquity"), 0) / 100, 2),
                "debtRatio":     round(_safe(info.get("debtToEquity"), 0) / 200, 2),
                "currentRatio":  round(_safe(info.get("currentRatio"), 1), 2),
                "quickRatio":    round(_safe(info.get("quickRatio"), 1), 2),
                "interestCoverage": round(_safe(info.get("ebitdaMargins"), 0) * 10, 1),
                "dupont":        _dupont(info),
                "hasRealData":   price > 0,
                "dataAsOf":      datetime.now().strftime("%Y-%m-%d"),
            }

            cls._store(symbol, result)
            return result

        except Exception as exc:
            return {"symbol": symbol, "error": str(exc), "hasRealData": False}

    # --------------------------------------------------------------------------
    @classmethod
    def get_history(cls, symbol: str, period: str = "5y") -> list[dict]:
        """
        Return price + dividend history list for charts.
        period: yfinance period string — "1d","5d","1mo","3mo","6mo","1y","2y","5y","10y","ytd","max"
        """
        try:
            tk   = yf.Ticker(symbol)
            hist = tk.history(period=period, auto_adjust=True)
            return _build_history(hist)
        except Exception:
            return []

    # --------------------------------------------------------------------------
    @classmethod
    def get_full_data(cls, symbol: str) -> dict:
        """
        Return everything: quote + 10-year history + financials.
        This is the heavyweight call used when opening a TickerScreen.
        """
        quote = cls.get_quote(symbol)
        if quote.get("error"):
            return quote

        try:
            tk = yf.Ticker(symbol)

            # 10-year daily history (yfinance caps at "max" for free tier)
            hist_df  = tk.history(period="10y", auto_adjust=True)
            history  = _build_history(hist_df)

            # Revenue / income history
            rev_hist = _build_revenue_history(tk)

            # YTD return
            ytd_base  = _ytd_base_price(history)
            cur_price = quote["price"]
            ytd_pct   = round((cur_price - ytd_base) / ytd_base * 100, 1) if ytd_base else 0

            last_entry = history[-1] if history else {}
            total_return = round(
                ((last_entry.get("total", cur_price) - history[0]["price"]) / history[0]["price"] * 100), 1
            ) if history else 0
            price_return = round(
                ((cur_price - history[0]["price"]) / history[0]["price"] * 100), 1
            ) if history else 0

            # FCF metrics
            info = tk.info or {}
            fcf         = _safe(info.get("freeCashflow"), 0)
            market_cap  = _safe(info.get("marketCap"), 1)
            fcf_yield   = round(fcf / market_cap * 100, 2) if market_cap else 0
            net_income  = _safe(info.get("netIncomeToCommon"), 1)
            fcf_conv    = round(fcf / net_income * 100, 1) if net_income else 0
            accruals    = round((_safe(info.get("netIncomeToCommon"), 0) - fcf) / max(market_cap, 1) * 100, 2)

            return {
                **quote,
                "history":        history,
                "revenueHistory": rev_hist,
                "totalReturn":    str(ytd_pct),
                "priceReturn":    str(ytd_pct),
                "cumDiv":         last_entry.get("cumDiv", 0),
                "allTimeReturn":  str(total_return),
                "fcfYield":       fcf_yield,
                "fcfConversion":  fcf_conv,
                "accrualsRatio":  accruals,
            }

        except Exception as exc:
            return {**quote, "history": [], "revenueHistory": [], "error": str(exc)}

    # --------------------------------------------------------------------------
    @classmethod
    def search(cls, query: str, limit: int = 8) -> list[dict]:
        """
        Search for tickers matching a query string.
        Uses yfinance's search endpoint + falls back to static list.
        """
        try:
            results = yf.Search(query, max_results=limit)
            quotes  = results.quotes or []
            return [
                {
                    "symbol":  q.get("symbol", ""),
                    "name":    q.get("longname") or q.get("shortname") or q.get("symbol"),
                    "sector":  q.get("sector") or q.get("typeDisp") or "Other",
                    "type":    _infer_type_from_quote(q),
                    "exchange": q.get("exchange", ""),
                }
                for q in quotes
                if q.get("symbol")
            ][:limit]
        except Exception:
            return []


# --------------------------------------------------------------------------- #
#  Helpers
# --------------------------------------------------------------------------- #

def _infer_type(info: dict) -> str:
    qt = (info.get("quoteType") or "").upper()
    if qt in ("ETF", "MUTUALFUND"):
        return "etf" if qt == "ETF" else "fund"
    if qt == "CRYPTOCURRENCY":
        return "crypto"
    if qt == "FUTURE":
        return "commodity"
    return "stock"


def _infer_type_from_quote(q: dict) -> str:
    qt = (q.get("quoteType") or "").upper()
    if qt == "ETF":            return "etf"
    if qt == "MUTUALFUND":     return "fund"
    if qt == "CRYPTOCURRENCY": return "crypto"
    if qt == "FUTURE":         return "commodity"
    return "stock"


def _ytd_base_price(history: list[dict]) -> float:
    """Find the last closing price on or before Jan 1 of the current year."""
    year_str = f"{datetime.now().year}-01"
    for entry in history:
        if entry["date"] >= year_str:
            return entry["price"]
    return history[0]["price"] if history else 0
