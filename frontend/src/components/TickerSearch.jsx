/**
 * TickerSearch — View component
 * Calls the /api/search endpoint via the api service layer.
 * No direct yfinance or fetch logic here.
 */
import { useState, useRef, useEffect, useMemo } from "react";
import { searchTickers } from "../services/api";
import { Badge } from "./Shared";

const TYPE_COLOR = (T) => ({
  stock: T.acc, etf: T.grn, fund: T.teal, crypto: T.vio, commodity: T.amb
});

export default function TickerSearch({ T, onSelect, compact, placeholder }) {
  const [query, setQuery]   = useState("");
  const [results, setRes]   = useState([]);
  const [open, setOpen]     = useState(false);
  const [loading, setLoad]  = useState(false);
  const ref = useRef();
  const tc  = TYPE_COLOR(T);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (query.length < 1) { setRes([]); return; }
    const timer = setTimeout(async () => {
      setLoad(true);
      try { setRes(await searchTickers(query)); }
      catch { setRes([]); }
      finally { setLoad(false); }
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const w = compact ? 260 : "100%";
  const maxW = compact ? 260 : 440;

  return (
    <div ref={ref} style={{ position: "relative", width: w, maxWidth: maxW, zIndex: 9999 }}>
      <div style={{ position: "relative" }}>
        <input
          value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || "Search ticker or company..."}
          style={{ width: "100%", background: T.sur, border: `1px solid ${open && results.length ? T.acc : T.bdr}`,
            borderRadius: open && results.length ? "8px 8px 0 0" : 8,
            padding: compact ? "9px 12px 9px 36px" : "13px 14px 13px 42px",
            fontFamily: T.mono, fontSize: compact ? 12 : 13, color: T.text, outline: "none" }} />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.dim} strokeWidth="2"
          style={{ position: "absolute", left: compact ? 11 : 13, top: "50%", transform: "translateY(-50%)" }}>
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        {loading && (
          <div style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)",
            width: 14, height: 14, border: `2px solid ${T.bdr}`, borderTop: `2px solid ${T.acc}`,
            borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
        )}
      </div>
      {open && results.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 99999,
          background: T.surB, border: `1px solid ${T.acc}`, borderTop: "none",
          borderRadius: "0 0 8px 8px", overflow: "hidden", boxShadow: `0 8px 32px ${T.shadow}` }}>
          {results.map((t, i) => (
            <div key={t.symbol} onClick={() => { onSelect(t); setQuery(""); setOpen(false); }}
              style={{ padding: "9px 13px", cursor: "pointer", display: "flex", justifyContent: "space-between",
                alignItems: "center", borderTop: i > 0 ? `1px solid ${T.bdr}` : "none", transition: "background .15s" }}
              onMouseEnter={e => e.currentTarget.style.background = T.accD}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div>
                <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 600,
                  color: tc[t.type] || T.acc }}>{t.symbol}</span>
                <span style={{ fontFamily: T.body, fontSize: 12, color: T.dim, marginLeft: 8 }}>{t.name}</span>
              </div>
              <Badge color={tc[t.type] || T.dim} T={T}>{t.type || t.sector || "—"}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
