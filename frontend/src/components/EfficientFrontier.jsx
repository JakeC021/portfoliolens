import { useState, useEffect } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getEfficientFrontier } from "../services/api";

export default function EfficientFrontier({ T, L, holdings }) {
  const [frontier, setFrontier] = useState(null);
  const [scenario, setScenario] = useState(null);
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (holdings.length < 2) return;
    setLoading(true);
    getEfficientFrontier(holdings)
      .then(setFrontier)
      .catch(() => setFrontier(null))
      .finally(() => setLoading(false));
  }, [holdings.length]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <div style={{ width: 28, height: 28, border: `2px solid ${T.bdr}`, borderTop: `2px solid ${T.acc}`,
        borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
    </div>
  );
  if (!frontier) return null;

  const { points, current, maxSharpe, minVol, maxRet } = frontier;
  const scenarios = [
    { key: "sharpe", label: L.maxSharpeLabel, color: T.grn, pt: maxSharpe, desc: L.maxSharpeDesc2 },
    { key: "vol",    label: L.minVolLabel,    color: T.teal, pt: minVol,    desc: L.minVolDesc },
    { key: "ret",    label: L.maxRetLabel,    color: T.vio,  pt: maxRet,    desc: L.maxRetDesc },
  ];

  return (
    <div style={{ background: T.sur, border: `1px solid ${T.bdr}`, borderRadius: 16, padding: 26, marginBottom: 20 }}>
      <h3 style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>{L.efficientFrontier}</h3>
      <p style={{ fontFamily: T.body, fontSize: 12, color: T.dim, lineHeight: 1.6, maxWidth: 680, marginBottom: 16 }}>
        {L.efDesc} <strong style={{ color: T.acc }}>{L.yourPortfolio}</strong> {L.efHighlighted}
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
          <CartesianGrid stroke={T.bdr} strokeDasharray="3 3" />
          <XAxis dataKey="x" name="Risk" type="number" domain={["auto","auto"]}
            tick={{ fontFamily: T.mono, fontSize: 10, fill: T.dim }} tickLine={false}
            label={{ value: `${L.risk} (%)`, position: "insideBottom", offset: -10,
              style: { fontFamily: T.mono, fontSize: 10, fill: T.dim } }} />
          <YAxis dataKey="y" name="Return" type="number" domain={["auto","auto"]}
            tick={{ fontFamily: T.mono, fontSize: 10, fill: T.dim }} tickLine={false} axisLine={false} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0]?.payload;
            return (
              <div style={{ background: T.surB, border: `1px solid ${T.bdrM}`, borderRadius: 8,
                padding: "8px 12px", fontFamily: T.mono, fontSize: 11 }}>
                <div style={{ color: T.dim }}>{L.risk}: {d?.x}% · {L.expected}: {d?.y}%</div>
              </div>
            );
          }} />
          <Scatter data={points}       fill={T.faint} opacity={0.5} />
          <Scatter data={[current]}    fill={T.acc}   r={7} />
          {scenarios.map(s => <Scatter key={s.key} data={[s.pt]} fill={s.color} r={6} />)}
        </ScatterChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.acc }} />
          <span style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>{L.yourPortfolio}</span>
        </div>
        {scenarios.map(s => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>{s.label}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 14 }}>
        {scenarios.map(s => (
          <div key={s.key} onClick={() => setScenario(scenario === s.key ? null : s.key)}
            style={{ background: scenario === s.key ? s.color + "20" : T.surB,
              border: `1px solid ${scenario === s.key ? s.color + "50" : T.bdr}`,
              borderRadius: 10, padding: "12px 14px", cursor: "pointer", transition: "all .2s" }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, color: s.color, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontFamily: T.body, fontSize: 11, color: T.dim, marginBottom: 8 }}>{s.desc}</div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.dim }}>
              {L.risk}: <b style={{ color: T.text }}>{s.pt.x}%</b>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
