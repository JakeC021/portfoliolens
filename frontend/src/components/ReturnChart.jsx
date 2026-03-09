import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TTip, PeriodSelector } from "./Shared";
import { sliceByPeriod, formatDateForPeriod } from "../utils/analytics";

export default function ReturnChart({ T, L, history, title, subtitle, totalRet, priceRet }) {
  const [period, setPeriod] = useState("5Y");
  const [displayMode, setDisplayMode] = useState("pct");

  const raw  = useMemo(() => sliceByPeriod(history, period), [history, period]);
  const data = useMemo(() => {
    if (!raw.length) return [];
    const bp = raw[0].price, bd = raw[0].divPortion || 0;
    if (displayMode === "pct") {
      return raw.map(d => ({
        ...d,
        label:     formatDateForPeriod(d.date, period),
        priceGain: +((d.price / bp - 1) * 100).toFixed(2),
        divGain:   +((d.divPortion - bd) / bp * 100).toFixed(2),
        totalGain: +((d.total / bp - 1) * 100).toFixed(2),
      }));
    }
    return raw.map(d => ({
      ...d,
      label:     formatDateForPeriod(d.date, period),
      priceGain: +(d.price - bp).toFixed(2),
      divGain:   +(d.divPortion - bd).toFixed(2),
      totalGain: +(d.total - bp).toFixed(2),
    }));
  }, [raw, displayMode, period]);

  const fmt = v => displayMode === "pct" ? `${v?.toFixed(1)}%` : `$${v?.toFixed(0)}`;
  const tickInterval = Math.max(0, Math.floor(data.length / Math.min(7, data.length)) - 1);

  return (
    <div style={{ background: T.sur, border: `1px solid ${T.bdr}`, borderRadius: 16, padding: 26 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <div>
          <h3 style={{ fontFamily: T.disp, fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 3 }}>{title}</h3>
          <p style={{ fontFamily: T.body, fontSize: 12, color: T.dim }}>{subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 18 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.acc }}>{L.totalReturn}</div>
            <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 600, color: T.acc }}>+{totalRet}%</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: T.mono, fontSize: 11, color: T.dim }}>{L.priceOnly}</div>
            <div style={{ fontFamily: T.mono, fontSize: 18, fontWeight: 600, color: T.dim }}>+{priceRet}%</div>
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 14 }}>
        <PeriodSelector T={T} period={period} onPeriod={setPeriod} displayMode={displayMode} onDisplayMode={setDisplayMode} />
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={T.acc} stopOpacity={0.25} />
              <stop offset="95%" stopColor={T.acc} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gD" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={T.amb} stopOpacity={0.3} />
              <stop offset="95%" stopColor={T.amb} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={T.bdr} strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontFamily: T.mono, fontSize: 10, fill: T.dim }} tickLine={false} interval={tickInterval} />
          <YAxis tick={{ fontFamily: T.mono, fontSize: 10, fill: T.dim }} tickLine={false} axisLine={false}
            tickFormatter={fmt} domain={displayMode === "$" ? ["dataMin","dataMax"] : [0,"auto"]} />
          <Tooltip content={<TTip />} formatter={v => fmt(v)} labelFormatter={(l,p) => p?.[0]?.payload?.date || l} />
          <Area type="monotone" dataKey="priceGain" stackId="1" stroke={T.acc} fill="url(#gP)" strokeWidth={2} name={L.priceAppreciation} dot={false} />
          <Area type="monotone" dataKey="divGain"   stackId="1" stroke={T.amb} fill="url(#gD)" strokeWidth={1.5} name={L.reinvestStack} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 18, marginTop: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {[{c:T.acc, l:L.priceAppreciation},{c:T.amb, l:L.reinvestStack}].map((item,i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 18, height: 2, background: item.c }} />
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.dim }}>{item.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
