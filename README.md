# PortfolioLens v2 — MVC Refactor

CFA-grade portfolio intelligence, rebuilt with a clean **Model-View-Controller** architecture.

---

## Architecture

```
portfoliolens/
├── backend/                       ← Flask (Python)
│   ├── app.py                     ← Application factory & CORS
│   ├── requirements.txt
│   ├── models/
│   │   ├── stock_model.py         ← MODEL: yfinance data fetching & processing
│   │   └── portfolio_model.py     ← MODEL: Sharpe, efficient frontier, analytics
│   └── controllers/
│       ├── stock_controller.py    ← CONTROLLER: /api/stock/* routes
│       └── portfolio_controller.py← CONTROLLER: /api/portfolio/* routes
│
└── frontend/                      ← React + Vite
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx               ← React entry point
        ├── App.jsx                ← Root component (frontend controller / router)
        ├── services/
        │   └── api.js             ← HTTP client — all fetch() calls live here
        ├── utils/
        │   ├── theme.js           ← Dark/light theme tokens
        │   ├── i18n.js            ← EN/ZH translations
        │   └── analytics.js       ← Lightweight client utils (slice/downsample)
        └── components/            ← VIEW layer
            ├── Shared.jsx         ← Badge, StatCard, Spinner, TTip, PeriodSelector
            ├── TickerSearch.jsx   ← Live ticker search dropdown
            ├── ReturnChart.jsx    ← Stacked area chart (price + dividends)
            ├── DeepAnalysis.jsx   ← Ratios, valuation, quality, revenue, DuPont
            ├── EfficientFrontier.jsx ← Monte-Carlo scatter plot
            ├── PortfolioAI.jsx    ← AI chat → POST /api/portfolio/optimize
            ├── FeedbackWidget.jsx ← Star-rating feedback form
            ├── HomeScreen.jsx     ← Landing page
            ├── TickerScreen.jsx   ← Single-asset view
            ├── PortfolioScreen.jsx← Portfolio dashboard
            └── AddToPortfolioModal.jsx
```

---

## MVC Responsibilities

| Layer | Where | What it does |
|---|---|---|
| **Model** | `backend/models/` | Fetches yfinance data; computes Sharpe, frontier, weights. No Flask imports. |
| **Controller** | `backend/controllers/` | Flask Blueprints; validates requests, calls Models, returns JSON. |
| **View** | `frontend/src/components/` | Pure React components; receive props, render UI, call `api.js`. |
| **API Service** | `frontend/src/services/api.js` | Single source of truth for all HTTP calls. |

---

## API Endpoints

### Stock
| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/search?q=<query>` | Search tickers via yfinance |
| `GET` | `/api/stock/<symbol>` | Quote + key stats (cached 5 min) |
| `GET` | `/api/stock/<symbol>/full` | Full data: quote + 10Y history + financials |
| `GET` | `/api/stock/<symbol>/history?period=5y` | History only |
| `POST` | `/api/stocks/batch` | `{ symbols: [...] }` → map of quotes |

### Portfolio
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/portfolio/analytics` | Combined return, Sharpe, beta, health score, sectors |
| `POST` | `/api/portfolio/frontier` | Efficient frontier points + max-Sharpe / min-vol / max-ret |
| `POST` | `/api/portfolio/optimize` | `{ holdings, objective }` → suggested weights |

---

## Quick Start

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
# → Flask running on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local  # set VITE_API_URL if Flask isn't on :5000
npm install
npm run dev
# → Vite running on http://localhost:5173
```

---

## Key Changes from v1

| v1 (monolithic JSX) | v2 (MVC) |
|---|---|
| yfinance via CORS proxy in browser | **Flask backend** fetches yfinance server-side |
| All analytics in React state | **Portfolio Model** handles Sharpe / frontier math |
| Single 1800-line JSX file | **11 focused components** + services + utils |
| Simulated fallback data everywhere | Real yfinance data; graceful error handling |
| No separation of concerns | Clean **Model → Controller → API → View** pipeline |
