import { useState } from "react";

export function Badge({ color, T, children }) {
  return (
    <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 600, color, background: color + "18",
      border: `1px solid ${color}30`, borderRadius: 4, padding: "2px 7px" }}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, color, T }) {
  return (
    <div style={{ background: T.surB, border: `1px solid ${T.bdr}`, borderRadius: 10, padding: "12px 16px" }}>
      <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      <div style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 600, color: color || T.text }}>{value ?? "—"}</div>
    </div>
  );
}

export function Spinner({ T }) {
  return (
    <div style={{ width: 36, height: 36, border: `3px solid ${T.bdr}`, borderTop: `3px solid ${T.acc}`,
      borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
  );
}

export function TTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(15,26,46,0.97)", border: "1px solid #243a5c", borderRadius: 8,
      padding: "9px 14px", fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>
      <div style={{ color: "#7a9ac0", marginBottom: 5 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <b>{typeof p.value === "number" ? p.value.toFixed(2) : p.value}</b>
        </div>
      ))}
    </div>
  );
}

export function PeriodSelector({ T, period, onPeriod, displayMode, onDisplayMode }) {
  const PERIODS = ["1D","1W","1M","3M","6M","YTD","1Y","3Y","5Y","10Y","ALL"];
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ display: "flex", background: T.surB, border: `1px solid ${T.bdr}`, borderRadius: 7, overflow: "hidden" }}>
        {PERIODS.map(p => (
          <button key={p} onClick={() => onPeriod(p)}
            style={{ fontFamily: T.mono, fontSize: 10, padding: "5px 9px", cursor: "pointer",
              background: period === p ? T.accD : "transparent", color: period === p ? T.acc : T.dim,
              border: "none", borderRight: `1px solid ${T.bdr}`, transition: "all .15s" }}>
            {p}
          </button>
        ))}
      </div>
      {onDisplayMode && (
        <div style={{ display: "flex", background: T.surB, border: `1px solid ${T.bdr}`, borderRadius: 7, overflow: "hidden" }}>
          {[["$","$"],["pct","%"]].map(([m,lbl]) => (
            <button key={m} onClick={() => onDisplayMode(m)}
              style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, padding: "5px 12px", cursor: "pointer",
                background: displayMode === m ? T.accD : "transparent", color: displayMode === m ? T.acc : T.dim,
                border: "none", borderRight: m === "$" ? `1px solid ${T.bdr}` : "none", transition: "all .15s" }}>
              {lbl}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
