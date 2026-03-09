// PortfolioLens - Theme definitions (View utility)
export const DARK = {
  bg:"#0f1a2e", sur:"#172436", surB:"#1e304d", bdr:"#243a5c", bdrM:"#2e4a72",
  text:"#ddeaff", dim:"#7a9ac0", faint:"#3a5578",
  acc:"#4da6ff", accD:"rgba(77,166,255,0.13)",
  grn:"#1fc9a0", grnD:"rgba(31,201,160,0.1)",
  red:"#f06060", redD:"rgba(240,96,96,0.1)",
  amb:"#f5b740", ambD:"rgba(245,183,64,0.1)",
  vio:"#a07ef5", vioD:"rgba(160,126,245,0.13)",
  teal:"#38bdf8", tealD:"rgba(56,189,248,0.1)",
  shadow:"rgba(0,0,0,0.4)",
  mono:"JetBrains Mono,monospace", body:"Inter,sans-serif", disp:"Syne,sans-serif",
};
export const LIGHT = {
  bg:"#f0f4ff", sur:"#ffffff", surB:"#f5f7ff", bdr:"#d0dcf5", bdrM:"#b8caf0",
  text:"#1a2a4a", dim:"#5a7399", faint:"#a8bcd8",
  acc:"#2563eb", accD:"rgba(37,99,235,0.08)",
  grn:"#059669", grnD:"rgba(5,150,105,0.08)",
  red:"#dc2626", redD:"rgba(220,38,38,0.08)",
  amb:"#d97706", ambD:"rgba(217,119,6,0.08)",
  vio:"#7c3aed", vioD:"rgba(124,58,237,0.08)",
  teal:"#0891b2", tealD:"rgba(8,145,178,0.08)",
  shadow:"rgba(37,99,235,0.08)",
  mono:"JetBrains Mono,monospace", body:"Inter,sans-serif", disp:"Syne,sans-serif",
};
export const THEMES = { dark: DARK, light: LIGHT };
export const injectFonts = () => {
  if (document.getElementById("pfl-fonts")) return;
  const l = document.createElement("link");
  l.id = "pfl-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap";
  document.head.appendChild(l);
  const s = document.createElement("style");
  s.textContent = "*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:5px;height:5px}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}.fu{animation:fadeUp .38s ease both}.fu1{animation:fadeUp .38s .08s ease both}.fu2{animation:fadeUp .38s .16s ease both}.fu3{animation:fadeUp .38s .24s ease both}.slide{animation:slideIn .3s ease both}";
  document.head.appendChild(s);
};
