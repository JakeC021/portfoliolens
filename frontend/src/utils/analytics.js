/**
 * PortfolioLens — Client-side analytics helpers
 * Lightweight utilities that don't justify a server round-trip:
 *   - history slicing / downsampling
 *   - new-weight preview when adding a ticker
 *   - executive summary text generation
 */

export const PERIODS = ["1D","1W","1M","3M","6M","YTD","1Y","3Y","5Y","10Y","ALL"];

export function downsample(data, max) {
  if (data.length <= max) return data;
  const step = Math.ceil(data.length / max);
  const result = [data[0]];
  for (let i = step; i < data.length - 1; i += step) result.push(data[i]);
  result.push(data[data.length - 1]);
  return result;
}

export function sliceByPeriod(history, period) {
  const n = history.length;
  if (period === "ALL") return downsample(history, 200);
  if (period === "1D")  return history.slice(-2);
  if (period === "1W")  return history.slice(-5);
  if (period === "YTD") {
    const lastD = new Date(history[n - 1]?.date || Date.now());
    const jan1  = new Date(lastD.getFullYear(), 0, 1).toISOString().slice(0, 10);
    const idx   = history.findIndex(d => d.date >= jan1);
    return downsample(idx >= 0 ? history.slice(idx) : history.slice(-60), 120);
  }
  const dayMap = { "1M":22,"3M":65,"6M":130,"1Y":252,"3Y":756,"5Y":1260,"10Y":2520 };
  return downsample(history.slice(-Math.min(dayMap[period] || n, n)), 250);
}

export function computeNewWeights(existingHoldings, newSymbol) {
  const n = existingHoldings.length;
  if (n === 0) return { [newSymbol]: 100 };
  const newW  = +(100 / (n + 1)).toFixed(1);
  const scale = 1 - newW / 100;
  const weights = { [newSymbol]: newW };
  let used = newW;
  existingHoldings.forEach((h, i) => {
    if (i === existingHoldings.length - 1) {
      weights[h.symbol] = +Math.max(0, 100 - used).toFixed(1);
    } else {
      const w = +(h.weight * scale).toFixed(1);
      weights[h.symbol] = w;
      used += w;
    }
  });
  return weights;
}

export function formatDateForPeriod(dateStr, period) {
  if (!dateStr) return "";
  const [yr, mo, da] = dateStr.split("-").map(Number);
  const names = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  if (period === "1D" || period === "1W" || period === "1M" || period === "3M")
    return `${names[mo]} ${da}`;
  return `${names[mo]} '${String(yr).slice(2)}`;
}
