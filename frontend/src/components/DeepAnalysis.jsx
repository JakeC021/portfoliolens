import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TTip, StatCard } from "./Shared";

function MetricRow({ label, value, color, T, note }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "9px 0", borderBottom: `1px solid ${T.bdr}` }}>
      <span style={{ fontFamily: T.body, fontSize: 12, color: T.dim }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 600, color: color || T.text }}>{value ?? "—"}</span>
        {note && <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>{note}</div>}
      </div>
    </div>
  );
}

export default function DeepAnalysis({ T, L, stock }) {
  const [tab, setTab] = useState("ratios");
  const tabs = [
    { key: "ratios",    label: L.ratiosTab    },
    { key: "valuation", label: L.valuationTab },
    { key: "quality",   label: L.qualityTab   },
    { key: "revenue",   label: L.revenueTab   },
    { key: "dupont",    label: L.dupontTab    },
  ];

  return (
    <div style={{ background: T.sur, border: `1px solid ${T.bdrM}`, borderRadius: 16, padding: 26, marginBottom: 20 }}>
      <h3 style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 16 }}>
        {L.deepAnalysisTitle}
      </h3>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ fontFamily: T.mono, fontSize: 11, padding: "6px 14px", cursor: "pointer",
              background: tab === t.key ? T.accD : T.surB, color: tab === t.key ? T.acc : T.dim,
              border: `1px solid ${tab === t.key ? T.acc + "40" : T.bdr}`, borderRadius: 6, transition: "all .15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "ratios" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.acc, textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: 10 }}>{L.leverageDebt}</div>
            <MetricRow T={T} label={L.debtEquity}       value={stock.debtEquity}       color={stock.debtEquity > 2 ? T.red : T.text} />
            <MetricRow T={T} label={L.debtRatio}        value={stock.debtRatio}        />
            <MetricRow T={T} label={L.interestCoverage} value={stock.interestCoverage} color={stock.interestCoverage > 3 ? T.grn : T.amb} />
          </div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.grn, textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: 10 }}>{L.liquidityReturns}</div>
            <MetricRow T={T} label={L.currentRatio} value={stock.currentRatio} color={stock.currentRatio >= 1.5 ? T.grn : T.amb} />
            <MetricRow T={T} label={L.quickRatio}   value={stock.quickRatio}   color={stock.quickRatio >= 1 ? T.grn : T.amb} />
            <MetricRow T={T} label={L.roe}          value={`${stock.roe}%`}   color={stock.roe > 15 ? T.grn : T.text} />
          </div>
        </div>
      )}

      {tab === "valuation" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(140px,1fr))", gap: 12, marginBottom: 20 }}>
            <StatCard T={T} label="P/E Ratio"   value={stock.pe}  color={stock.pe > 30 ? T.amb : T.text} />
            <StatCard T={T} label="P/B Ratio"   value={stock.pb}  color={stock.pb > 5  ? T.amb : T.text} />
            <StatCard T={T} label={L.eps}       value={`$${stock.eps}`} />
            <StatCard T={T} label={L.divYield}  value={`${stock.dividendYield}%`} color={stock.dividendYield > 2 ? T.grn : T.text} />
          </div>
        </div>
      )}

      {tab === "quality" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12 }}>
            <StatCard T={T} label={L.fcfYield}      value={`${stock.fcfYield ?? "—"}%`}     color={T.grn} />
            <StatCard T={T} label={L.fcfConversion}  value={`${stock.fcfConversion ?? "—"}%`} color={T.acc} />
            <StatCard T={T} label={L.accrualsRatio}  value={`${stock.accrualsRatio ?? "—"}%`} />
            <StatCard T={T} label={L.roic}           value={`${stock.roic}%`}                 color={stock.roic > 15 ? T.grn : T.text} />
          </div>
          {stock.roic > 15 && (
            <div style={{ background: T.grnD, border: `1px solid ${T.grn}30`, borderRadius: 8,
              padding: "10px 14px", marginTop: 16, fontFamily: T.body, fontSize: 12, color: T.grn }}>
              ✓ {L.roicMoat}
            </div>
          )}
        </div>
      )}

      {tab === "revenue" && stock.revenueHistory?.length > 0 && (
        <div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stock.revenueHistory} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={T.bdr} strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontFamily: T.mono, fontSize: 10, fill: T.dim }} tickLine={false} />
              <YAxis tick={{ fontFamily: T.mono, fontSize: 10, fill: T.dim }} tickLine={false} axisLine={false} />
              <Tooltip content={<TTip />} />
              <Bar dataKey="revenue"    name={L.revenueLabel}    fill={T.acc} radius={[4,4,0,0]} />
              <Bar dataKey="grossProfit" name={L.grossProfitLabel} fill={T.grn} radius={[4,4,0,0]} opacity={0.85} />
              <Bar dataKey="netIncome"  name={L.netIncomeLabel}  fill={T.amb} radius={[4,4,0,0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.dim, textTransform: "uppercase",
              letterSpacing: "0.08em", marginBottom: 10 }}>{L.yoyGrowth}</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {stock.revenueHistory.slice(1).map((y, i) => {
                const prev = stock.revenueHistory[i];
                const g = ((y.revenue - prev.revenue) / prev.revenue * 100).toFixed(1);
                const col = g > 0 ? T.grn : T.red;
                return (
                  <div key={y.year} style={{ background: T.surB, border: `1px solid ${col}30`,
                    borderRadius: 8, padding: "10px 14px", flex: 1, minWidth: 70, textAlign: "center" }}>
                    <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, marginBottom: 3 }}>{y.year}</div>
                    <div style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 600, color: col }}>
                      {g > 0 ? "+" : ""}{g}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "dupont" && stock.dupont && (
        <div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
            {[
              { l: L.netMargin,    v: `${stock.dupont.netMargin}%` },
              { l: "×" },
              { l: L.assetTurnover, v: `${stock.dupont.assetTurnover}×` },
              { l: "×" },
              { l: L.leverage,     v: `${stock.dupont.leverage}×` },
              { l: "=" },
              { l: "ROE",          v: `${stock.dupont.roe}%`, hi: true },
            ].map((item, i) =>
              !item.v ? (
                <span key={i} style={{ fontFamily: T.mono, fontSize: 18, color: T.faint }}>{item.l}</span>
              ) : (
                <div key={i} style={{ background: item.hi ? T.ambD : T.surB,
                  border: `1px solid ${item.hi ? T.amb + "40" : T.bdr}`,
                  borderRadius: 8, padding: "10px 16px", textAlign: "center" }}>
                  <div style={{ fontFamily: T.mono, fontSize: 10, color: T.dim, marginBottom: 4 }}>{item.l}</div>
                  <div style={{ fontFamily: T.mono, fontSize: 15, fontWeight: 600, color: item.hi ? T.amb : T.text }}>{item.v}</div>
                </div>
              )
            )}
          </div>
          <div style={{ background: T.surB, borderRadius: 8, padding: 14,
            fontFamily: T.body, fontSize: 12, color: T.dim, lineHeight: 1.6 }}>
            {L.dupontExplain}
          </div>
        </div>
      )}
    </div>
  );
}
