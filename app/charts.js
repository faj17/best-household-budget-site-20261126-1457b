// Small SVG charts, drawn from the household's own figures — no chart library,
// no network, just paths and bars computed here.
import { money0 } from './store.js';

const NS = 'http://www.w3.org/2000/svg';

// Donut of spending by category. slices: [{name, value, color}]
export function donut(slices, size = 220) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size / 2 - 8, inner = r * 0.62;
  let a0 = -Math.PI / 2;
  const parts = slices.map((s) => {
    const frac = s.value / total;
    const a1 = a0 + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const d = `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${cx} ${cy} Z`;
    a0 = a1;
    return `<path d="${d}" fill="${s.color}"><title>${s.name}: ${money0(s.value)}</title></path>`;
  });
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Spending by category chart">
    ${parts.join('')}
    <circle cx="${cx}" cy="${cy}" r="${inner}" fill="#fffdf8"/>
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="15" font-weight="700" fill="#22301f">${money0(total)}</text>
    <text x="${cx}" y="${cy + 16}" text-anchor="middle" font-size="11" fill="#5f6b5a">spent in November</text>
  </svg>`;
}

// Grouped bars: income vs spending per month. rows: [{month, income, spent}]
export function trendBars(rows, width = 520, height = 240) {
  const max = Math.max(...rows.map((r) => Math.max(r.income, r.spent))) * 1.08;
  const padL = 52, padB = 26, padT = 12;
  const plotW = width - padL - 8, plotH = height - padB - padT;
  const bw = plotW / rows.length;
  const y = (v) => padT + plotH - (v / max) * plotH;
  let out = `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="Monthly income and spending chart">`;
  for (let g = 0; g <= 4; g++) {
    const v = (max / 1.08 / 4) * g;
    const yy = y(v);
    out += `<line x1="${padL}" y1="${yy}" x2="${width - 8}" y2="${yy}" stroke="#e3dac7" stroke-width="1"/>
      <text x="${padL - 6}" y="${yy + 4}" text-anchor="end" font-size="11" fill="#5f6b5a">${money0(v)}</text>`;
  }
  rows.forEach((r, i) => {
    const x = padL + i * bw + bw * 0.14;
    const w = bw * 0.3;
    out += `<rect x="${x.toFixed(1)}" y="${y(r.income).toFixed(1)}" width="${w.toFixed(1)}" height="${(padT + plotH - y(r.income)).toFixed(1)}" fill="#2e7d4f" rx="2"><title>${r.month} income ${money0(r.income)}</title></rect>`;
    out += `<rect x="${(x + w + 3).toFixed(1)}" y="${y(r.spent).toFixed(1)}" width="${w.toFixed(1)}" height="${(padT + plotH - y(r.spent)).toFixed(1)}" fill="#e8a33d" rx="2"><title>${r.month} spent ${money0(r.spent)}</title></rect>`;
    out += `<text x="${(padL + i * bw + bw / 2).toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="12" fill="#22301f">${r.month}</text>`;
  });
  out += `<text x="${padL}" y="12" font-size="11" fill="#2e7d4f" font-weight="700">■ Income</text>
    <text x="${padL + 78}" y="12" font-size="11" fill="#b07d1e" font-weight="700">■ Spent</text></svg>`;
  return out;
}

// Horizontal bars: planned vs spent per category.
export function planBars(rows) {
  const max = Math.max(...rows.map((r) => Math.max(r.planned, r.spent)), 1);
  return rows.map((r) => {
    const pct = Math.min(100, (r.spent / r.planned) * 100);
    const over = r.spent > r.planned;
    return `<div class="budget-row">
      <span class="cat"><span class="dot" style="background:${r.color}"></span>${r.name}</span>
      <span class="bar${over ? ' over' : ''}" role="img" aria-label="${r.name}: spent ${money0(r.spent)} of ${money0(r.planned)} planned"><i style="width:${pct.toFixed(0)}%"></i></span>
      <span class="nums">${money0(r.spent)} / ${money0(r.planned)}${over ? ` <span class="over">+${money0(r.spent - r.planned)} over</span>` : ''}</span>
    </div>`;
  }).join('');
}
