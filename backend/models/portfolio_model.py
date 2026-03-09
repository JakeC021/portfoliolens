"""
PortfolioLens — Portfolio Model (M in MVC)
Pure analytics logic: Sharpe ratio, efficient frontier, weight optimisation.
No Flask dependencies — just numpy & math.
"""

import numpy as np
from typing import Any


# --------------------------------------------------------------------------- #
#  Types (plain dicts for JSON-serialisability)
# --------------------------------------------------------------------------- #
# Holding: { symbol, weight (0-100), stockInfo: {...from StockModel...} }
# StockInfo must contain: beta, totalReturn (str pct), dividendYield (float),
#   history (list[{price, total, divPortion}])


# --------------------------------------------------------------------------- #
#  Portfolio Analytics
# --------------------------------------------------------------------------- #

class PortfolioModel:

    RFR_DAILY = 0.05 / 252          # 5% annual risk-free rate, daily

    # ---------------------------------------------------------------------- #
    @classmethod
    def compute_analytics(cls, holdings: list[dict]) -> dict | None:
        """
        Compute the combined time-series, returns, Sharpe, weighted beta,
        suggested Max-Sharpe weights, health score, and sector breakdown.
        """
        if not holdings:
            return None

        INIT = 10_000
        histories = [h["stockInfo"]["history"] for h in holdings]
        if not all(histories):
            return None

        hist_len = min(len(h) for h in histories)
        if hist_len < 2:
            return None

        # Downsample to ~250 points for performance
        step    = max(1, hist_len // 250)
        indices = list(range(0, hist_len - 1, step)) + [hist_len - 1]

        combined = []
        for i in indices:
            p_idx = t_idx = d_idx = 0.0
            for h in holdings:
                w    = h["weight"] / 100
                hist = h["stockInfo"]["history"]
                if i >= len(hist):
                    continue
                bp   = hist[0]["price"]
                p_idx += (hist[i]["price"]      / bp) * w
                t_idx += (hist[i]["total"]       / bp) * w
                d_idx += (hist[i]["divPortion"]  / bp) * w

            src = histories[0][i]
            combined.append({
                "date":      src["date"],
                "price":     round(INIT * p_idx, 2),
                "total":     round(INIT * t_idx, 2),
                "divPortion": round(INIT * d_idx, 2),
            })

        base = combined[0]
        last = combined[-1]

        total_ret  = round(((last["total"]  - base["price"]) / base["price"]) * 100, 1)
        price_ret  = round(((last["price"]  - base["price"]) / base["price"]) * 100, 1)
        income_ret = round((last["divPortion"] / base["price"]) * 100, 1)

        # Daily returns → Sharpe
        rets = [
            (combined[i]["total"] - combined[i - 1]["total"]) / combined[i - 1]["total"]
            for i in range(1, len(combined))
        ]
        avg  = np.mean(rets)
        std  = np.std(rets)
        periods_per_year = 252 / step
        sharpe = round(((avg - cls.RFR_DAILY) * np.sqrt(periods_per_year) / std), 2) if std > 0 else 0.0

        # Weighted beta
        w_beta = round(
            sum(h["weight"] / 100 * float(h["stockInfo"].get("beta", 1)) for h in holdings), 2
        )

        # Max-Sharpe suggested weights (simplified Markowitz proxy)
        suggested = cls._max_sharpe_weights(holdings)

        # Health score
        health = int(np.clip(
            round(sharpe * 12 + 50 - abs(w_beta - 1) * 8 + (8 if len(holdings) >= 4 else 0)),
            38, 99
        ))

        # Sector concentration
        sector_map: dict[str, float] = {}
        for h in holdings:
            s = h["stockInfo"].get("sector", "Other")
            sector_map[s] = sector_map.get(s, 0) + h["weight"]
        sectors = sorted(
            [{"sector": s, "pct": round(p, 1)} for s, p in sector_map.items()],
            key=lambda x: x["pct"], reverse=True
        )

        return {
            "combined":   combined,
            "totalRet":   str(total_ret),
            "priceRet":   str(price_ret),
            "incomeRet":  str(income_ret),
            "sharpe":     str(sharpe),
            "wBeta":      str(w_beta),
            "suggested":  suggested,
            "healthScore": health,
            "sectors":    sectors,
        }

    # ---------------------------------------------------------------------- #
    @classmethod
    def compute_frontier(cls, holdings: list[dict]) -> dict | None:
        """
        Monte-Carlo efficient frontier simulation.
        Returns {points, current, maxSharpe, minVol, maxRet}.
        """
        if len(holdings) < 2:
            return None

        assets = [
            {
                "ret":    float(h["stockInfo"].get("totalReturn", 0)) / 100,
                "vol":    max(0.05, float(h["stockInfo"].get("beta", 1)) * 0.18),
                "weight": h["weight"] / 100,
            }
            for h in holdings
        ]

        rng  = np.random.default_rng(seed=sum(ord(c) for h in holdings for c in h["symbol"]))
        n    = len(assets)

        cur_ret = sum(a["ret"] * a["weight"] for a in assets)
        cur_vol = np.sqrt(sum((a["vol"] * a["weight"]) ** 2 for a in assets) * 1.4)

        points = []
        for _ in range(180):
            raw = rng.random(n)
            w   = raw / raw.sum()
            ret = float(np.dot([a["ret"] for a in assets], w))
            vol = float(np.sqrt(np.dot([(a["vol"] * wi) ** 2 for a, wi in zip(assets, w)], np.ones(n)) * 1.4))
            sharpe = (ret - 0.05) / vol if vol > 0 else 0
            points.append({"x": round(vol * 100, 2), "y": round(ret * 100, 2), "sharpe": sharpe})

        max_sharpe = max(points, key=lambda p: p["sharpe"])
        min_vol    = min(points, key=lambda p: p["x"])
        max_ret    = max(points, key=lambda p: p["y"])

        return {
            "points":    points,
            "current":   {"x": round(cur_vol * 100, 2), "y": round(cur_ret * 100, 2)},
            "maxSharpe": max_sharpe,
            "minVol":    min_vol,
            "maxRet":    max_ret,
        }

    # ---------------------------------------------------------------------- #
    @classmethod
    def optimize_weights(cls, holdings: list[dict], objective: str = "sharpe") -> list[dict]:
        """
        Return a list of {symbol, current, suggested, reason} dicts.
        objective: 'sharpe' | 'income' | 'growth' | 'risk'
        """
        if not holdings:
            return []
        return cls._max_sharpe_weights(holdings) if objective == "sharpe" \
            else cls._rule_based_weights(holdings, objective)

    # ---------------------------------------------------------------------- #
    # Private helpers
    # ---------------------------------------------------------------------- #

    @classmethod
    def _max_sharpe_weights(cls, holdings: list[dict]) -> list[dict]:
        RFR = 5
        scores = [
            max(0.1, (float(h["stockInfo"].get("totalReturn", 0)) - RFR)
                / max(0.01, float(h["stockInfo"].get("beta", 1)) * 18))
            for h in holdings
        ]
        total  = sum(scores)
        rem    = 100.0
        result = []
        for i, h in enumerate(holdings):
            if i == len(holdings) - 1:
                w = round(rem, 1)
            else:
                w = round(scores[i] / total * 100, 1)
                rem -= w
            result.append({
                "symbol":    h["symbol"],
                "current":   h["weight"],
                "suggested": max(1, w),
                "reason":    f"Score:{scores[i]:.1f}",
            })
        return result

    @classmethod
    def _rule_based_weights(cls, holdings: list[dict], objective: str) -> list[dict]:
        """Income / growth / risk rule-based rebalancing."""
        key_map = {
            "income": ("dividendYield", True,  "High yield",    "Low yield"),
            "growth": ("totalReturn",   True,  "Strong return", "Lower return"),
            "risk":   ("beta",          False, "Low beta",      "High beta"),
        }
        field, desc, hi_reason, lo_reason = key_map.get(objective, ("beta", False, "", ""))
        n      = len(holdings)
        sorted_h = sorted(
            holdings, key=lambda h: float(h["stockInfo"].get(field, 0)), reverse=desc
        )
        rem = 100.0
        result = []
        for i, h in enumerate(sorted_h):
            half = n // 2
            delta = 8 if i < half else -8
            if i == n - 1:
                w = round(rem, 1)
            else:
                w = round(max(5, h["weight"] + delta), 1)
                rem -= w
            result.append({
                "symbol":    h["symbol"],
                "current":   h["weight"],
                "suggested": max(0, w),
                "reason":    hi_reason if i < half else lo_reason,
            })
        # Normalise to 100
        total = sum(r["suggested"] for r in result)
        if total > 0:
            result = [{**r, "suggested": round(r["suggested"] / total * 100, 1)} for r in result]
        return result
