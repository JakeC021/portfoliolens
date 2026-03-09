import { useState } from "react";
import TickerSearch from "./TickerSearch";
import { Badge } from "./Shared";

export default function HomeScreen({ T, L, onTickerSelect, portfolios, onViewPortfolios, onCreatePortfolio }) {
  const [quickTickers, setQuickTickers] = useState([]);
  const [warn, setWarn]                 = useState(false);

  const handleAddQuick = t => {
    if (!quickTickers.find(x => x.symbol === t.symbol))
      setQuickTickers(p => [...p, t]);
  };

  const handleCreate = () => {
    if (quickTickers.length === 0) { setWarn(true); return; }
    setWarn(false);
    onCreatePortfolio(quickTickers);
  };

  const typeColor = { stock: T.acc, etf: T.grn, fund: T.teal, crypto: T.vio, commodity: T.amb };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "52px 22px" }}>
      {/* Hero */}
      <div className="fu" style={{ textAlign: "center", marginBottom: 56 }}>
        <div style={{ fontFamily: T.mono, fontSize: 11, color: T.acc, letterSpacing: "0.18em",
          textTransform: "uppercase", marginBottom: 20 }}>{L.appTagline}</div>
        <h1 style={{ fontFamily: T.disp, fontSize: "clamp(32px,5vw,58px)", fontWeight: 800,
          color: T.text, lineHeight: 1.1, marginBottom: 18 }}>
          {L.homeH1a}{" "}
          <span style={{ color: T.acc }}>{L.homeH1b}</span>{" "}
          {L.homeH1c}
        </h1>
        <p style={{ fontFamily: T.body, fontSize: 16, color: T.dim, maxWidth: 600, margin: "0 auto 36px", lineHeight: 1.7 }}>
          {L.homeSubtitle}
        </p>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          <TickerSearch T={T} onSelect={onTickerSelect} placeholder={L.searchAnother} />
        </div>
      </div>

      {/* Action cards */}
      <div className="fu1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
        {/* Research card */}
        <div style={{ background: T.sur, border: `1px solid ${T.bdr}`, borderRadius: 16, padding: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: T.accD, border: `1px solid ${T.acc}20`,
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.acc} strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: T.disp, fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 8 }}>{L.researchTitle}</h2>
          <p style={{ fontFamily: T.body, fontSize: 13, color: T.dim, lineHeight: 1.6, marginBottom: 20 }}>{L.researchDesc}</p>
          <TickerSearch T={T} onSelect={onTickerSelect} placeholder={L.searchAnother} />
        </div>

        {/* Build portfolio card */}
        <div style={{ background: T.sur, border: `1px solid ${T.bdr}`, borderRadius: 16, padding: 28 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: T.grnD, border: `1px solid ${T.grn}20`,
            display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.grn} strokeWidth="2">
              <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: T.disp, fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 8 }}>{L.buildTitle}</h2>
          <p style={{ fontFamily: T.body, fontSize: 13, color: T.dim, lineHeight: 1.6, marginBottom: 16 }}>{L.buildDesc}</p>
          <TickerSearch T={T} onSelect={handleAddQuick} placeholder="Add a ticker..." />
          {quickTickers.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
              {quickTickers.map(t => (
                <div key={t.symbol} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Badge color={typeColor[t.type] || T.acc} T={T}>{t.symbol}</Badge>
                  <button onClick={() => setQuickTickers(p => p.filter(x => x.symbol !== t.symbol))}
                    style={{ background: "none", border: "none", cursor: "pointer", color: T.faint, fontSize: 12 }}>×</button>
                </div>
              ))}
            </div>
          )}
          {warn && <p style={{ fontFamily: T.mono, fontSize: 11, color: T.amb, marginTop: 8 }}>{L.addTickerWarn}</p>}
          <button onClick={handleCreate}
            style={{ width: "100%", fontFamily: T.disp, fontSize: 13, fontWeight: 700, color: "#fff",
              background: T.grn, border: "none", borderRadius: 8, padding: "11px", cursor: "pointer",
              marginTop: 14, transition: "opacity .2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            {L.createBtn(quickTickers.length)}
          </button>
        </div>
      </div>

      {/* Existing portfolios */}
      {portfolios.length > 0 && (
        <div className="fu2">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {L.yourPortfolios}
            </span>
            <button onClick={() => onViewPortfolios()} style={{ fontFamily: T.mono, fontSize: 11, color: T.acc,
              background: "none", border: "none", cursor: "pointer" }}>{L.viewAll}</button>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {portfolios.slice(0, 3).map(p => (
              <div key={p.id} onClick={() => onViewPortfolios(p)}
                style={{ background: T.sur, border: `1px solid ${T.bdr}`, borderRadius: 12, padding: "16px 20px",
                  cursor: "pointer", transition: "border-color .2s", flex: "1 0 180px" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.acc}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.bdr}>
                <div style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 6 }}>{p.name}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {p.holdings.map(h => <Badge key={h.symbol} color={T.acc} T={T}>{h.symbol}</Badge>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
