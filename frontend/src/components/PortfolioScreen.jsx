/**
 * PortfolioScreen — View component
 * Fetches analytics from /api/portfolio/analytics via the API layer.
 */
import { useState, useEffect, useRef } from "react";
import { getPortfolioAnalytics, getBatchQuotes } from "../services/api";
import ReturnChart from "./ReturnChart";
import EfficientFrontier from "./EfficientFrontier";
import PortfolioAI from "./PortfolioAI";
import TickerSearch from "./TickerSearch";
import { StatCard, Badge, Spinner } from "./Shared";
import { computeNewWeights } from "../utils/analytics";

function HealthMeter({ T, L, score }) {
  const color = score >= 75 ? T.grn : score >= 55 ? T.amb : T.red;
  const label = score >= 75 ? L.strong : score >= 55 ? L.moderate : L.needsAttention;
  return (
    <div style={{ background: T.sur, border: `1px solid ${T.bdr}`, borderRadius: 12, padding: "18px 22px" }}>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, textTransform: "uppercase",
        letterSpacing: "0.08em", marginBottom: 10 }}>{L.healthScore}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ fontFamily: T.disp, fontSize: 40, fontWeight: 800, color }}>{score}</div>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 12, color, marginBottom: 4 }}>{label}</div>
          <div style={{ width: 120, height: 6, background: T.surB, borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 3, transition: "width .6s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortfolioScreen({ T, L, portfolio, setPortfolio, onBack, onTickerClick }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(false);
  const [editingName, setEditing] = useState(false);
  const [tempName, setTempName]   = useState(portfolio.name);
  const [showAdd, setShowAdd]     = useState(false);
  const nameRef = useRef();

  useEffect(() => { if (editingName && nameRef.current) nameRef.current.focus(); }, [editingName]);

  useEffect(() => {
    if (!portfolio.holdings.length) return;
    setLoading(true);
    getPortfolioAnalytics(portfolio.holdings)
      .then(setAnalytics)
      .catch(() => setAnalytics(null))
      .finally(() => setLoading(false));
  }, [portfolio.holdings.length, portfolio.holdings.map(h => h.weight).join(",")]);

  const saveName = () => {
    if (tempName.trim()) setPortfolio(p => ({ ...p, name: tempName.trim() }));
    else setTempName(portfolio.name);
    setEditing(false);
  };

  const applyWeights = (adjustments) => {
    setPortfolio(p => ({
      ...p,
      holdings: p.holdings.map(h => {
        const match = adjustments.find(a => a.symbol === h.symbol);
        return match ? { ...h, weight: match.suggested } : h;
      }),
    }));
  };

  const handleAddTicker = async (tickerMeta) => {
    if (portfolio.holdings.find(h => h.symbol === tickerMeta.symbol)) return;
    const quotes = await getBatchQuotes([tickerMeta.symbol]);
    const stockInfo = quotes[tickerMeta.symbol] || { ...tickerMeta, history: [], hasRealData: false };
    const newWeights = computeNewWeights(portfolio.holdings, tickerMeta.symbol);
    setPortfolio(p => ({
      ...p,
      holdings: [
        ...p.holdings.map(h => ({ ...h, weight: newWeights[h.symbol] ?? h.weight })),
        { symbol: tickerMeta.symbol, weight: newWeights[tickerMeta.symbol], stockInfo },
      ],
    }));
    setShowAdd(false);
  };

  const typeColor = { stock: T.acc, etf: T.grn, fund: T.teal, crypto: T.vio, commodity: T.amb };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 22px" }}>
      <button onClick={onBack} style={{ fontFamily: T.mono, fontSize: 12, color: T.dim, background: "none",
        border: "none", cursor: "pointer", marginBottom: 20 }}>
        ← {L.back}
      </button>

      {/* Portfolio name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        {editingName ? (
          <input ref={nameRef} value={tempName} onChange={e => setTempName(e.target.value)}
            onBlur={saveName} onKeyDown={e => e.key === "Enter" && saveName()}
            style={{ fontFamily: T.disp, fontSize: 26, fontWeight: 800, color: T.text,
              background: "transparent", border: `1px solid ${T.acc}`, borderRadius: 6,
              padding: "2px 8px", outline: "none" }} />
        ) : (
          <h1 title={L.editName} onClick={() => setEditing(true)}
            style={{ fontFamily: T.disp, fontSize: 26, fontWeight: 800, color: T.text,
              cursor: "pointer", borderBottom: `1px dashed ${T.bdr}` }}>
            {portfolio.name}
          </h1>
        )}
        <button onClick={() => setShowAdd(s => !s)}
          style={{ fontFamily: T.mono, fontSize: 11, color: T.grn, background: T.grnD,
            border: `1px solid ${T.grn}30`, borderRadius: 6, padding: "6px 13px", cursor: "pointer" }}>
          {L.addTicker}
        </button>
      </div>

      {showAdd && (
        <div style={{ marginBottom: 20 }}>
          <TickerSearch T={T} onSelect={handleAddTicker} placeholder={L.searchToAdd} />
        </div>
      )}

      {loading && <div style={{ textAlign: "center", padding: 40 }}><Spinner T={T} /></div>}

      {analytics && (
        <>
          {/* Summary stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 20 }}>
            <StatCard T={T} label={L.totalReturn}    value={`+${analytics.totalRet}%`} color={T.grn} />
            <StatCard T={T} label={L.sharpeRatio}    value={analytics.sharpe}           color={parseFloat(analytics.sharpe) > 1 ? T.grn : T.amb} />
            <StatCard T={T} label={L.portfolioBeta}  value={analytics.wBeta} />
            <StatCard T={T} label={L.dividendIncome} value={`+${analytics.incomeRet}%`} color={T.amb} />
          </div>

          {/* Health meter */}
          <div style={{ marginBottom: 20 }}>
            <HealthMeter T={T} L={L} score={analytics.healthScore} />
          </div>

          {/* Combined return chart */}
          {analytics.combined?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <ReturnChart T={T} L={L} history={analytics.combined}
                title={L.portfolioTotalReturn} subtitle={L.portfolioSubtitle}
                totalRet={analytics.totalRet} priceRet={analytics.priceRet} />
            </div>
          )}

          {/* Holdings table */}
          <div style={{ background: T.sur, border: `1px solid ${T.bdr}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16 }}>{L.holdings}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 100px 80px", gap: "8px 0" }}>
              {[L.ticker, L.weight, L.price, L.return].map(h => (
                <div key={h} style={{ fontFamily: T.mono, fontSize: 10, color: T.faint,
                  textTransform: "uppercase", letterSpacing: "0.08em", paddingBottom: 8,
                  borderBottom: `1px solid ${T.bdr}` }}>{h}</div>
              ))}
              {portfolio.holdings.map(h => {
                const ret = parseFloat(h.stockInfo?.totalReturn || 0);
                return [
                  <button key={h.symbol + "s"} onClick={() => onTickerClick(h.stockInfo)}
                    style={{ background: "none", border: "none", cursor: "pointer", textAlign: "left",
                      fontFamily: T.mono, fontSize: 13, fontWeight: 600, color: typeColor[h.stockInfo?.type] || T.acc,
                      padding: "10px 0", borderBottom: `1px solid ${T.bdr}` }}>{h.symbol}</button>,
                  <div key={h.symbol + "w"} style={{ fontFamily: T.mono, fontSize: 13, color: T.text,
                    padding: "10px 0", borderBottom: `1px solid ${T.bdr}` }}>{h.weight}%</div>,
                  <div key={h.symbol + "p"} style={{ fontFamily: T.mono, fontSize: 13, color: T.text,
                    padding: "10px 0", borderBottom: `1px solid ${T.bdr}` }}>
                    ${h.stockInfo?.price?.toFixed(2) ?? "—"}
                  </div>,
                  <div key={h.symbol + "r"} style={{ fontFamily: T.mono, fontSize: 13,
                    color: ret >= 0 ? T.grn : T.red, padding: "10px 0", borderBottom: `1px solid ${T.bdr}` }}>
                    {ret >= 0 ? "+" : ""}{ret}%
                  </div>,
                ];
              })}
            </div>
          </div>

          {/* Sector chart */}
          {analytics.sectors?.length > 0 && (
            <div style={{ background: T.sur, border: `1px solid ${T.bdr}`, borderRadius: 16, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 14 }}>{L.sectorConcentration}</h3>
              {analytics.sectors.map((s, i) => {
                const colors = [T.acc, T.grn, T.vio, T.teal, T.amb, T.red];
                const c = colors[i % colors.length];
                return (
                  <div key={s.sector} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ fontFamily: T.mono, fontSize: 12, color: T.dim, width: 130, flexShrink: 0 }}>{s.sector}</div>
                    <div style={{ flex: 1, height: 6, background: T.surB, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${s.pct}%`, height: "100%", background: c, borderRadius: 3 }} />
                    </div>
                    <div style={{ fontFamily: T.mono, fontSize: 11, color: c, width: 44, textAlign: "right" }}>{s.pct}%</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Efficient Frontier */}
          <EfficientFrontier T={T} L={L} holdings={portfolio.holdings} />
        </>
      )}

      {/* AI Chat */}
      <PortfolioAI T={T} L={L} holdings={portfolio.holdings} onApplyWeights={applyWeights} />
    </div>
  );
}
