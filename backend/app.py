"""
PortfolioLens — Flask Application Entry Point
MVC Pattern: app.py wires together controllers (routes) and starts the server.
"""

from flask import Flask
from flask_cors import CORS

from controllers.stock_controller import stock_bp
from controllers.portfolio_controller import portfolio_bp


def create_app():
    app = Flask(__name__)

    # Allow the React dev server (port 5173 / 3000) to call our API
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints (controllers)
    app.register_blueprint(stock_bp)
    app.register_blueprint(portfolio_bp)

    @app.route("/api/health")
    def health():
        return {"status": "ok", "service": "PortfolioLens API"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
