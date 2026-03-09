import { useState } from "react";
import ReturnChart from "./ReturnChart";
import DeepAnalysis from "./DeepAnalysis";
import { StatCard, Badge, Spinner } from "./Shared";

export default function TickerScreen({ T, L, stock, portfolios, onAddToPortfolio, onBack }) {
  const [showDeep, setShowDeep] = useState(false);
  if (!stock) return null;

  const isUp = stock.changePct >= 0;
  const typeColor = { stock: T.acc, etf: T.grn, fund: T.teal, crypto: T.vio, commodity: T.amb };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 22px" }}>
      <button onClick={onBack} style={{ fontFamily: T.mono, fontSize: 12, color: T.dim, background: "none",
        border: "none", cursor: "pointer", marginBottom: 20, display: "flex", alignItems: "center", gap: 6 }}>
        ← {L.back}
      </button>

      {/* Header */}
      <div className="fu" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        flexWrap: "wrap", gap: 16, marginBottom: 22 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h1 style={{ fontFamily: T.disp, fontSize: 28, fontWeight: 800, color: T.text }}>{stock.symbol}</h1>
            <Badge color={typeColor[stock.type] || T.acc} T={T}>{stock.type || "stock"}</Badge>
            {stock.hasRealData && <Badge color={T.grn} T={T}>{L.realData}</Badge>}
          </div>
          <p style={{ fontFamily: T.body, fontSize: 14, color: T.dim, marginBottom: 8 }}>{stock.name}</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontFamily: T.mono, fontSize: 34, fontWeight: 700, color: T.text, letterSpacing: "-0.02em" }}>
              ${stock.price?.toFixed(2)}
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 14, color: isUp ? T.grn : T.red }}>
              {isUp ? "+" : ""}{stock.change?.toFixed(2)} ({isUp ? "+" : ""}{stock.changePct?.toFixed(2)}%)
            </span>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint, marginTop: 4 }}>
            {stock.hasRealData ? L.dataAsOfLabel(stock.dataAsOf) : `${stock.dataAsOf} · ${L.simData}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onAddToPortfolio(stock)}
            style={{ fontFamily: T.disp, fontSize: 13, fontWeight: 700, color: "#fff", background: T.acc,
              border: "none", borderRadius: 8, padding: "10px 18px", cursor: "pointer" }}>
            {L.addToPortfolio}
          </button>
          <button onClick={() => setShowDeep(d => !d)}
            style={{ fontFamily: T.disp, fontSize: 13, fontWeight: 700, color: T.amb, background: T.ambD,
              border: `1px solid ${T.amb}40`, borderRadius: 8, padding: "10px 18px", cursor: "pointer" }}>
            ⚡ {showDeep ? L.hideAnalysis : L.deepAnalysis}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="fu1" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
        {[
          { l: L.marketCap, v: stock.marketCap },
          { l: L.peRatio,   v: stock.pe },
          { l: L.pbRatio,   v: stock.pb },
          { l: L.eps,       v: `$${stock.eps}` },
          { l: L.divYield,  v: `${stock.dividendYield}%`, c: stock.dividendYield > 2 ? T.grn : T.text },
          { l: L.beta,      v: stock.beta, c: stock.beta > 1.5 ? T.red : stock.beta > 1.2 ? T.amb : stock.beta < 0.7 ? T.grn : T.text },
          { l: L.high52,    v: `$${stock.high52w}`, c: T.grn },
          { l: L.low52,     v: `$${stock.low52w}`, c: T.red },
        ].map(s => (
          <div key={s.l} style={{ flex: "1 0 110px" }}>
            <StatCard label={s.l} value={s.v} color={s.c} T={T} />
          </div>
        ))}
      </div>

      {/* Chart */}
      {stock.history?.length > 0 && (
        <div className="fu2" style={{ marginBottom: 20 }}>
          <ReturnChart T={T} L={L} history={stock.history}
            title={`${stock.symbol} ${L.totalReturn}`}
            subtitle={stock.hasRealData ? L.dataAsOfLabel(stock.dataAsOf) : `${stock.dataAsOf} · ${L.simData}`}
            totalRet={stock.totalReturn} priceRet={stock.priceReturn} />
        </div>
      )}

      {/* Secondary stats */}
      <div className="fu3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        <StatCard label={L.revenue}     value={stock.revenue}     T={T} />
        <StatCard label={L.grossMargin} value={stock.grossMargin} color={T.grn} T={T} />
        <StatCard label={L.roic}        value={`${stock.roic}%`}  color={T.acc} T={T} />
      </div>

      {showDeep && <DeepAnalysis T={T} L={L} stock={stock} />}
    </div>
  );
}
