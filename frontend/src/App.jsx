/**
 * PortfolioLens — Root App Component (Controller-View bridge)
 *
 * MVC Mapping:
 *   Models      → backend/models/  (Python, runs on Flask)
 *   Controllers → backend/controllers/  (Flask Blueprints)
 *   Views       → frontend/src/components/  (React)
 *   API glue    → frontend/src/services/api.js
 *
 * This file is the frontend "controller" — it holds top-level state,
 * routes between views, and coordinates API calls.
 */

import { useState, useEffect } from "react";
import { THEMES, injectFonts } from "./utils/theme";
import { STRINGS } from "./utils/i18n";
import { getStockFull, getBatchQuotes } from "./services/api";

import HomeScreen       from "./components/HomeScreen";
import TickerScreen     from "./components/TickerScreen";
import PortfolioScreen  from "./components/PortfolioScreen";
import FeedbackWidget   from "./components/FeedbackWidget";
import AddToPortfolioModal from "./components/AddToPortfolioModal";
import { Spinner }      from "./components/Shared";

injectFonts();

let nextId = 1;

export default function App() {
  const [themeKey, setThemeKey] = useState("dark");
  const [lang, setLang]         = useState("en");
  const [view, setView]         = useState("home");

  const [portfolios, setPortfolios] = useState([]);
  const [selPortfolio, setSelPortfolio] = useState(null);
  const [selTicker, setSelTicker]   = useState(null);

  const [fetching, setFetching]   = useState(false);
  const [fetchMsg, setFetchMsg]   = useState("");
  const [addModal, setAddModal]   = useState(null);

  const T = THEMES[themeKey];
  const L = STRINGS[lang];

  // Scroll-bar theme
  const scrollCss = themeKey === "light"
    ? "::-webkit-scrollbar-track{background:#f0f4ff}::-webkit-scrollbar-thumb{background:#b8caf0;border-radius:3px}"
    : "::-webkit-scrollbar-track{background:#0f1a2e}::-webkit-scrollbar-thumb{background:#2a3f63;border-radius:3px}";

  // ── Navigation handlers ────────────────────────────────────────────────── //

  const handleTickerSelect = async (tickerMeta) => {
    setFetching(true);
    setFetchMsg(L.loading(tickerMeta.symbol));
    setView("ticker");
    setSelTicker(null);
    try {
      const data = await getStockFull(tickerMeta.symbol);
      setSelTicker({ ...tickerMeta, ...data });
    } catch {
      // Fallback: show partial data from the search result
      setSelTicker({ ...tickerMeta, hasRealData: false, history: [], revenueHistory: [] });
    } finally {
      setFetching(false);
      setFetchMsg("");
    }
  };

  const handleCreatePortfolio = async (tickers) => {
    if (!tickers?.length) return;
    setFetching(true);
    setFetchMsg(L.fetchingData);

    const symbols = tickers.map(t => t.symbol);
    let quoteMap  = {};
    try { quoteMap = await getBatchQuotes(symbols); }
    catch {}

    const n = tickers.length;
    const holdings = tickers.map((t, i) => {
      const w = i === n - 1
        ? +(100 - Math.floor(100 / n) * (n - 1)).toFixed(1)
        : +Math.floor(100 / n).toFixed(1);
      return { symbol: t.symbol, weight: w, stockInfo: quoteMap[t.symbol] || t };
    });

    const p = { id: nextId++, name: `Portfolio ${portfolios.length + 1}`, holdings };
    setPortfolios(ps => [...ps, p]);
    setSelPortfolio(p);
    setView("portfolio");
    setFetching(false);
  };

  const updatePortfolio = (updater) => {
    setPortfolios(ps => ps.map(p =>
      p.id === selPortfolio.id ? (typeof updater === "function" ? updater(p) : updater) : p
    ));
    setSelPortfolio(p => typeof updater === "function" ? updater(p) : updater);
  };

  const handleConfirmAdd = async ({ mode, newName, selectedIds }) => {
    const stock = addModal;
    if (!stock) return;
    const quote = await getBatchQuotes([stock.symbol]).catch(() => ({}));
    const stockInfo = quote[stock.symbol] || stock;

    if (mode === "new") {
      const n = 1;
      const p = { id: nextId++, name: newName, holdings: [{ symbol: stock.symbol, weight: 100, stockInfo }] };
      setPortfolios(ps => [...ps, p]);
      setSelPortfolio(p);
      setView("portfolio");
    } else {
      setPortfolios(ps => ps.map(p => {
        if (!selectedIds.includes(p.id)) return p;
        const n = p.holdings.length + 1;
        const newW = +(100 / n).toFixed(1);
        const updated = p.holdings.map(h => ({ ...h, weight: +((h.weight * (1 - newW / 100))).toFixed(1) }));
        updated.push({ symbol: stock.symbol, weight: newW, stockInfo });
        return { ...p, holdings: updated };
      }));
    }
    setAddModal(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: T.body, color: T.text }}>
      <style>{scrollCss}</style>

      {/* ── Nav ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 50, background: `${T.bg}f0`,
        backdropFilter: "blur(12px)", borderBottom: `1px solid ${T.bdr}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 26px", height: 54 }}>
        <button onClick={() => setView("home")}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: T.accD, border: `1px solid ${T.acc}30`,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="2.5">
              <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
            </svg>
          </div>
          <span style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 800, color: T.text, letterSpacing: "-0.01em" }}>
            PortfolioLens
          </span>
        </button>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {portfolios.length > 0 && (
            <button onClick={() => setView("portfolios")}
              style={{ fontFamily: T.mono, fontSize: 11, color: view === "portfolios" ? T.acc : T.dim,
                background: view === "portfolios" ? T.accD : "none", border: `1px solid ${view === "portfolios" ? T.acc + "30" : "transparent"}`,
                borderRadius: 6, padding: "5px 13px", cursor: "pointer" }}>
              Portfolios ({portfolios.length})
            </button>
          )}

          {/* Lang toggle */}
          <div style={{ display: "flex", background: T.surB, border: `1px solid ${T.bdr}`, borderRadius: 7, overflow: "hidden" }}>
            {["en","zh"].map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ fontFamily: T.mono, fontSize: 11, padding: "5px 10px", cursor: "pointer",
                  background: lang === l ? T.accD : "transparent", color: lang === l ? T.acc : T.dim,
                  border: "none", borderRight: l === "en" ? `1px solid ${T.bdr}` : "none", transition: "all .15s" }}>
                {l === "en" ? "EN" : "中文"}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button onClick={() => setThemeKey(k => k === "dark" ? "light" : "dark")}
            style={{ background: T.surB, border: `1px solid ${T.bdr}`, borderRadius: 7, width: 32, height: 32,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: T.dim, fontSize: 16, transition: "all .2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.acc}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.bdr}>
            {themeKey === "dark" ? "☀" : "🌙"}
          </button>
        </div>
      </nav>

      {/* ── Views ── */}
      {view === "home" && (
        <HomeScreen T={T} L={L}
          onTickerSelect={handleTickerSelect}
          portfolios={portfolios}
          onViewPortfolios={p => { if (p?.id) { setSelPortfolio(p); setView("portfolio"); } else setView("portfolios"); }}
          onCreatePortfolio={handleCreatePortfolio} />
      )}

      {view === "ticker" && !selTicker && (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "80px 22px", textAlign: "center" }}>
          <Spinner T={T} />
          <p style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.text, margin: "20px 0 8px" }}>
            {L.fetchingData}
          </p>
          {fetchMsg && <p style={{ fontFamily: T.mono, fontSize: 11, color: T.dim }}>{fetchMsg}</p>}
        </div>
      )}

      {view === "ticker" && selTicker && (
        <TickerScreen T={T} L={L}
          stock={selTicker}
          portfolios={portfolios}
          onAddToPortfolio={s => setAddModal(s)}
          onBack={() => setView("home")}
          onNavigateTicker={s => handleTickerSelect(s)} />
      )}

      {view === "portfolios" && (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "38px 22px" }}>
          <h2 style={{ fontFamily: T.disp, fontSize: 24, fontWeight: 800, color: T.text, marginBottom: 22 }}>
            {L.yourPortfoliosTitle}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
            {portfolios.map(p => (
              <div key={p.id} onClick={() => { setSelPortfolio(p); setView("portfolio"); }}
                style={{ background: T.sur, border: `1px solid ${T.bdr}`, borderRadius: 13, padding: 22,
                  cursor: "pointer", transition: "border-color .2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.acc}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.bdr}>
                <h3 style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>{p.name}</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {p.holdings.map(h => (
                    <span key={h.symbol} style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, color: T.acc,
                      background: T.accD, border: `1px solid ${T.acc}30`, borderRadius: 4, padding: "2px 7px" }}>
                      {h.symbol}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "portfolio" && selPortfolio && (
        <PortfolioScreen T={T} L={L}
          portfolio={selPortfolio}
          setPortfolio={updatePortfolio}
          onBack={() => setView("portfolios")}
          onTickerClick={s => { setSelTicker(s); setView("ticker"); }} />
      )}

      {/* Modals */}
      {addModal && (
        <AddToPortfolioModal T={T} L={L}
          stock={addModal}
          portfolios={portfolios}
          onConfirm={handleConfirmAdd}
          onClose={() => setAddModal(null)} />
      )}

      {fetching && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999, backdropFilter: "blur(4px)" }}>
          <div style={{ background: T.sur, border: `1px solid ${T.bdr}`, borderRadius: 16,
            padding: "40px 50px", textAlign: "center", maxWidth: 420 }}>
            <Spinner T={T} />
            <p style={{ fontFamily: T.disp, fontSize: 15, fontWeight: 700, color: T.text, margin: "18px 0 8px" }}>
              {L.fetchingData}
            </p>
            {fetchMsg && <p style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, lineHeight: 1.6 }}>{fetchMsg}</p>}
          </div>
        </div>
      )}

      <FeedbackWidget T={T} L={L} />
    </div>
  );
}
