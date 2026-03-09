"""
PortfolioLens — Stock Controller (C in MVC)
Exposes REST endpoints for stock data. Delegates all logic to StockModel.
"""

from flask import Blueprint, jsonify, request
from models.stock_model import StockModel

stock_bp = Blueprint("stock", __name__, url_prefix="/api")


@stock_bp.route("/search")
def search():
    """
    GET /api/search?q=<query>&limit=<n>
    Returns a list of matching ticker objects for the search dropdown.
    """
    query = request.args.get("q", "").strip()
    limit = int(request.args.get("limit", 8))

    if len(query) < 1:
        return jsonify([])

    results = StockModel.search(query, limit=limit)
    return jsonify(results)


@stock_bp.route("/stock/<symbol>")
def get_stock(symbol: str):
    """
    GET /api/stock/<symbol>
    Returns lightweight quote + key stats (no full history).
    Used for stat cards and portfolio holdings list.
    """
    data = StockModel.get_quote(symbol.upper())
    if data.get("error") and not data.get("hasRealData"):
        return jsonify(data), 404
    return jsonify(data)


@stock_bp.route("/stock/<symbol>/full")
def get_stock_full(symbol: str):
    """
    GET /api/stock/<symbol>/full
    Returns everything: quote + 10-year history + financials.
    Called when a user opens a TickerScreen.
    """
    data = StockModel.get_full_data(symbol.upper())
    if data.get("error") and not data.get("hasRealData"):
        return jsonify(data), 404
    return jsonify(data)


@stock_bp.route("/stock/<symbol>/history")
def get_history(symbol: str):
    """
    GET /api/stock/<symbol>/history?period=5y
    Returns just the price/dividend history array.
    Useful if the frontend already has the quote and only needs to refresh history.
    """
    period  = request.args.get("period", "5y")
    history = StockModel.get_history(symbol.upper(), period=period)
    return jsonify(history)


@stock_bp.route("/stocks/batch", methods=["POST"])
def batch_quotes():
    """
    POST /api/stocks/batch
    Body: { "symbols": ["AAPL", "MSFT", ...] }
    Returns a map of symbol -> quote. Used when building a portfolio.
    """
    body    = request.get_json(force=True) or {}
    symbols = body.get("symbols", [])
    result  = {}
    for sym in symbols[:20]:  # cap at 20 to avoid abuse
        data = StockModel.get_quote(sym.upper())
        if data.get("hasRealData"):
            result[sym.upper()] = data
    return jsonify(result)
