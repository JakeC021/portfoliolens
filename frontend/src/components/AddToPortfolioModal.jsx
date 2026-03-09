import { useState } from "react";
import { computeNewWeights } from "../utils/analytics";

export default function AddToPortfolioModal({ T, L, stock, portfolios, onConfirm, onClose }) {
  const [mode, setMode]       = useState(portfolios.length === 0 ? "new" : "choose");
  const [newName, setNewName] = useState("");
  const [selected, setSelected] = useState([]);

  const inp = { width: "100%", background: T.surB, border: `1px solid ${T.bdr}`, borderRadius: 8,
    padding: "10px 13px", fontFamily: T.mono, fontSize: 13, color: T.text, outline: "none" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: T.sur, border: `1px solid ${T.bdrM}`, borderRadius: 16, padding: 30, width: 420, maxWidth: "90vw" }}>
        <h3 style={{ fontFamily: T.disp, fontSize: 19, fontWeight: 700, color: T.text, marginBottom: 4 }}>
          {(L.addToPort || "Add {sym} to Portfolio").replace("{sym}", stock.symbol)}
        </h3>
        <p style={{ fontFamily: T.body, fontSize: 13, color: T.dim, marginBottom: 22 }}>{L.equalWeights}</p>

        {portfolios.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {["choose","new"].map(m => (
              <button key={m} onClick={() => setMode(m)}
                style={{ flex: 1, fontFamily: T.mono, fontSize: 12, padding: "8px",
                  background: mode === m ? T.accD : T.surB, color: mode === m ? T.acc : T.dim,
                  border: `1px solid ${mode === m ? T.acc + "40" : T.bdr}`, borderRadius: 6, cursor: "pointer" }}>
                {m === "choose" ? L.existingPort : L.newPort}
              </button>
            ))}
          </div>
        )}

        {mode === "new" ? (
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, letterSpacing: "0.08em",
              textTransform: "uppercase", display: "block", marginBottom: 7 }}>{L.portName}</label>
            <input value={newName} onChange={e => setNewName(e.target.value)}
              placeholder={L.portNamePlaceholder} style={inp} />
          </div>
        ) : (
          <div style={{ marginBottom: 22 }}>
            {portfolios.map(p => {
              const weights = computeNewWeights(p.holdings, stock.symbol);
              return (
                <div key={p.id} onClick={() => setSelected(s => s.includes(p.id) ? s.filter(x => x !== p.id) : [...s, p.id])}
                  style={{ padding: "10px 13px", marginBottom: 6, borderRadius: 8, cursor: "pointer",
                    background: selected.includes(p.id) ? T.accD : T.surB,
                    border: `1px solid ${selected.includes(p.id) ? T.acc + "40" : T.bdr}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: T.body, fontSize: 13, color: T.text }}>{p.name}</span>
                    <span style={{ fontFamily: T.mono, fontSize: 11, color: T.dim }}>{p.holdings.length} holdings</span>
                  </div>
                  {selected.includes(p.id) && (
                    <div style={{ fontFamily: T.mono, fontSize: 11, color: T.grn, marginTop: 5 }}>
                      → {stock.symbol} {weights[stock.symbol]}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose}
            style={{ flex: 1, fontFamily: T.disp, fontSize: 13, fontWeight: 700, color: T.dim,
              background: T.surB, border: `1px solid ${T.bdr}`, borderRadius: 8, padding: "11px", cursor: "pointer" }}>
            {L.cancel}
          </button>
          <button disabled={mode === "new" ? !newName : !selected.length}
            onClick={() => onConfirm({ mode, newName, selectedIds: selected })}
            style={{ flex: 2, fontFamily: T.disp, fontSize: 13, fontWeight: 700, color: "#fff", background: T.acc,
              border: "none", borderRadius: 8, padding: "11px", cursor: "pointer",
              opacity: (mode === "new" ? !newName : !selected.length) ? 0.5 : 1 }}>
            {L.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
