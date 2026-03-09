"""
PortfolioLens — Portfolio Controller (C in MVC)
Exposes REST endpoints for portfolio analytics. Delegates to PortfolioModel.
"""

from flask import Blueprint, jsonify, request
from models.portfolio_model import PortfolioModel

portfolio_bp = Blueprint("portfolio", __name__, url_prefix="/api/portfolio")


@portfolio_bp.route("/analytics", methods=["POST"])
def analytics():
    """
    POST /api/portfolio/analytics
    Body: { "holdings": [ { symbol, weight, stockInfo } ] }
    Returns combined time-series, Sharpe, beta, health score, sectors.
    """
    body     = request.get_json(force=True) or {}
    holdings = body.get("holdings", [])

    if not holdings:
        return jsonify({"error": "No holdings provided"}), 400

    result = PortfolioModel.compute_analytics(holdings)
    if result is None:
        return jsonify({"error": "Insufficient history data"}), 422

    return jsonify(result)


@portfolio_bp.route("/frontier", methods=["POST"])
def frontier():
    """
    POST /api/portfolio/frontier
    Body: { "holdings": [ { symbol, weight, stockInfo } ] }
    Returns efficient frontier points + key scenarios.
    """
    body     = request.get_json(force=True) or {}
    holdings = body.get("holdings", [])

    if len(holdings) < 2:
        return jsonify({"error": "Need at least 2 holdings for frontier"}), 400

    result = PortfolioModel.compute_frontier(holdings)
    if result is None:
        return jsonify({"error": "Could not compute frontier"}), 422

    return jsonify(result)


@portfolio_bp.route("/optimize", methods=["POST"])
def optimize():
    """
    POST /api/portfolio/optimize
    Body: { "holdings": [...], "objective": "sharpe"|"income"|"growth"|"risk" }
    Returns [ { symbol, current, suggested, reason } ]
    """
    body      = request.get_json(force=True) or {}
    holdings  = body.get("holdings", [])
    objective = body.get("objective", "sharpe")

    if not holdings:
        return jsonify({"error": "No holdings provided"}), 400

    result = PortfolioModel.optimize_weights(holdings, objective=objective)
    return jsonify(result)
