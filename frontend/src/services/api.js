/**
 * PortfolioLens — API Service Layer
 * All HTTP communication with the Flask backend lives here.
 * Components never call fetch() directly — they go through this module.
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ---------- Stock endpoints ----------

/** Search tickers by query string */
export const searchTickers = (q, limit = 8) =>
  request(`/api/search?q=${encodeURIComponent(q)}&limit=${limit}`);

/** Lightweight quote (price + key stats, no history) */
export const getStockQuote = (symbol) =>
  request(`/api/stock/${symbol}`);

/** Full data: quote + 10-year history + financials */
export const getStockFull = (symbol) =>
  request(`/api/stock/${symbol}/full`);

/** Batch quotes for multiple symbols at once */
export const getBatchQuotes = (symbols) =>
  request("/api/stocks/batch", {
    method: "POST",
    body: JSON.stringify({ symbols }),
  });

// ---------- Portfolio endpoints ----------

/**
 * Compute combined time-series, Sharpe, beta, health score, sectors.
 * holdings: [{ symbol, weight, stockInfo }]
 */
export const getPortfolioAnalytics = (holdings) =>
  request("/api/portfolio/analytics", {
    method: "POST",
    body: JSON.stringify({ holdings }),
  });

/**
 * Compute efficient frontier points + max-Sharpe / min-vol / max-ret scenarios.
 */
export const getEfficientFrontier = (holdings) =>
  request("/api/portfolio/frontier", {
    method: "POST",
    body: JSON.stringify({ holdings }),
  });

/**
 * Optimise portfolio weights for a given objective.
 * objective: "sharpe" | "income" | "growth" | "risk"
 */
export const optimizePortfolio = (holdings, objective = "sharpe") =>
  request("/api/portfolio/optimize", {
    method: "POST",
    body: JSON.stringify({ holdings, objective }),
  });
