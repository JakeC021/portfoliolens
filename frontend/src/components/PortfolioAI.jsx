/**
 * PortfolioAI — Chat widget
 * Calls POST /api/portfolio/optimize for AI-suggested weight adjustments.
 */
import { useState, useRef, useEffect } from "react";
import { optimizePortfolio } from "../services/api";

const INTENT_MAP = {
  income: ["income","dividend","yield","分红","收益"],
  sharpe: ["sharpe","risk-adjusted","夏普"],
  growth: ["growth","return","增长","回报"],
  risk:   ["risk","safe","stable","风险","稳健"],
};

function detectIntent(lower) {
  for (const [intent, keywords] of Object.entries(INTENT_MAP)) {
    if (keywords.some(k => lower.includes(k))) return intent;
  }
  return null;
}

export default function PortfolioAI({ T, L, holdings, onApplyWeights }) {
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState([{ role: "ai", text: L.aiWelcome }]);
  const [input, setInput]     = useState("");
  const [pending, setPending] = useState(null);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMsgs(m => [...m, { role: "user", text: msg }]);
    setLoading(true);

    if (!holdings.length) {
      setMsgs(m => [...m, { role: "ai", text: L.aiEmptyPortfolio }]);
      setLoading(false);
      return;
    }

    const intent = detectIntent(msg.toLowerCase());
    if (!intent) {
      setMsgs(m => [...m, { role: "ai", text: L.aiUnknown }]);
      setLoading(false);
      return;
    }

    try {
      const adjustments = await optimizePortfolio(holdings, intent);
      setPending(adjustments);
      setMsgs(m => [...m, {
        role: "ai",
        text: L.aiAdjusted ? L.aiAdjusted(L.aiLabel[intent]) : `Adjusted for ${intent}.`,
        adjustments,
      }]);
    } catch {
      setMsgs(m => [...m, { role: "ai", text: "Sorry, I couldn't optimise the portfolio right now." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return (
    <button onClick={() => setOpen(true)}
      style={{ position: "fixed", bottom: 28, right: 28, zIndex: 200, width: 52, height: 52,
        borderRadius: "50%", background: T.vio, border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 4px 22px ${T.vio}50`, transition: "transform .2s" }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </button>
  );

  return (
    <div className="slide" style={{ position: "fixed", bottom: 20, right: 20, zIndex: 200, width: 360,
      maxHeight: 520, background: T.sur, border: `1px solid ${T.vio}50`, borderRadius: 16,
      display: "flex", flexDirection: "column", boxShadow: `0 8px 40px ${T.shadow}` }}>
      {/* Header */}
      <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.bdr}`,
        display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.vio, animation: "pulse 2s ease infinite" }} />
          <span style={{ fontFamily: T.disp, fontSize: 14, fontWeight: 700, color: T.text }}>{L.portfolioAI}</span>
        </div>
        <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.dim, fontSize: 18 }}>×</button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ maxWidth: "90%", background: m.role === "user" ? T.vioD : T.surB,
              border: `1px solid ${m.role === "user" ? T.vio + "40" : T.bdr}`, borderRadius: 10, padding: "9px 12px" }}>
              <p style={{ fontFamily: T.body, fontSize: 12, color: T.text, lineHeight: 1.5 }}>{m.text}</p>
              {m.adjustments && pending && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ background: T.bg, borderRadius: 7, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 2fr", padding: "5px 8px", borderBottom: `1px solid ${T.bdr}` }}>
                      {[L.ticker||"Ticker",L.current,"New",L.reason||"Reason"].map(h => (
                        <span key={h} style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, textTransform: "uppercase" }}>{h}</span>
                      ))}
                    </div>
                    {m.adjustments.map(a => {
                      const delta = a.suggested - a.current;
                      return (
                        <div key={a.symbol} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 2fr", padding: "5px 8px", borderBottom: `1px solid ${T.bdr}` }}>
                          <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, color: T.acc }}>{a.symbol}</span>
                          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>{a.current}%</span>
                          <span style={{ fontFamily: T.mono, fontSize: 10, color: delta > 0 ? T.grn : delta < 0 ? T.red : T.dim }}>
                            {a.suggested}%{delta > 0 ? " ↑" : delta < 0 ? " ↓" : ""}
                          </span>
                          <span style={{ fontFamily: T.body, fontSize: 9, color: T.dim }}>{a.reason}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => { onApplyWeights(pending); setPending(null); setMsgs(m => [...m, { role: "ai", text: L.aiApplied }]); }}
                      style={{ flex: 2, fontFamily: T.disp, fontSize: 11, fontWeight: 700, color: "#fff", background: T.vio,
                        border: "none", borderRadius: 6, padding: "7px", cursor: "pointer" }}>{L.apply}</button>
                    <button onClick={() => setPending(null)}
                      style={{ flex: 1, fontFamily: T.disp, fontSize: 11, color: T.dim, background: T.surB,
                        border: `1px solid ${T.bdr}`, borderRadius: 6, padding: "7px", cursor: "pointer" }}>{L.discard}</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 5, padding: "4px 0" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.vio,
                animation: `pulse 1.2s ${i * 0.2}s ease infinite` }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.bdr}`, display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSend()}
          placeholder={L.askPortfolio} disabled={loading}
          style={{ flex: 1, background: T.surB, border: `1px solid ${T.bdr}`, borderRadius: 8,
            padding: "9px 12px", fontFamily: T.body, fontSize: 12, color: T.text, outline: "none" }} />
        <button onClick={handleSend} disabled={loading || !input.trim()}
          style={{ width: 36, height: 36, borderRadius: 8, background: T.vioD, border: `1px solid ${T.vio}40`,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            opacity: loading || !input.trim() ? 0.4 : 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.vio} strokeWidth="2.5">
            <path d="m22 2-7 20-4-9-9-4z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
