// Hand-drawn SVG charts for Hearth & Ledger: a donut, grouped bars and plan
// bars, all computed from the household's own figures. No chart library and
// no network — just paths, rectangles and text placed by arithmetic.
import { money0 } from './store.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const TAU = Math.PI * 2;
const START_ANGLE = -Math.PI / 2;

function pointOnCircle(cx, cy, radius, angle) {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function arcSlicePath(cx, cy, radius, from, to) {
  const [x0, y0] = pointOnCircle(cx, cy, radius, from);
  const [x1, y1] = pointOnCircle(cx, cy, radius, to);
  const bigArc = to - from > Math.PI ? 1 : 0;
  return (
    'M ' + x0.toFixed(1) + ' ' + y0.toFixed(1) +
    ' A ' + radius + ' ' + radius + ' 0 ' + bigArc + ' 1 ' +
    x1.toFixed(1) + ' ' + y1.toFixed(1) +
    ' L ' + cx + ' ' + cy + ' Z'
  );
}

// Donut of spending by category. slices: [{name, value, color}]
export function donut(slices, size = 220) {
  let total = 0;
  for (const s of slices) total += s.value;
  if (!total) total = 1;
  const cx = size / 2;
  const cy = size / 2;
  const outer = size / 2 - 8;
  const inner = outer * 0.62;
  let angle = START_ANGLE;
  const paths = [];
  for (const s of slices) {
    const share = s.value / total;
    const next = angle + share * TAU;
    const d = arcSlicePath(cx, cy, outer, angle, next);
    paths.push(
      '<path d="' + d + '" fill="' + s.color + '"><title>' +
        s.name + ': ' + money0(s.value) + '</title></path>',
    );
    angle = next;
  }
  const label = money0(total);
  return (
    '<svg viewBox="0 0 ' + size + ' ' + size + '" width="' + size +
    '" height="' + size + '" role="img" aria-label="Spending by category chart">' +
    paths.join('') +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + inner + '" fill="#fffdf8"/>' +
    '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#22301f">' + label + '</text>' +
    '<text x="' + cx + '" y="' + (cy + 16) + '" text-anchor="middle" font-size="11" fill="#5f6b5a">spent in November</text>' +
    '</svg>'
  );
}

// Grouped bars: income vs spending per month. rows: [{month, income, spent}]
export function trendBars(rows, width = 520, height = 240) {
  let peak = 0;
  for (const r of rows) peak = Math.max(peak, r.income, r.spent);
  const ceiling = peak * 1.08;
  const leftPad = 52;
  const bottomPad = 26;
  const topPad = 12;
  const plotWidth = width - leftPad - 8;
  const plotHeight = height - bottomPad - topPad;
  const slot = plotWidth / rows.length;
  const yFor = (v) => topPad + plotHeight - (v / ceiling) * plotHeight;
  const parts = [];
  parts.push(
    '<svg viewBox="0 0 ' + width + ' ' + height +
    '" width="100%" role="img" aria-label="Monthly income and spending chart">',
  );
  for (let grid = 0; grid <= 4; grid++) {
    const value = (ceiling / 1.08 / 4) * grid;
    const yy = yFor(value);
    parts.push(
      '<line x1="' + leftPad + '" y1="' + yy + '" x2="' + (width - 8) +
      '" y2="' + yy + '" stroke="#e3dac7" stroke-width="1"/>' +
      '<text x="' + (leftPad - 6) + '" y="' + (yy + 4) +
      '" text-anchor="end" font-size="11" fill="#5f6b5a">' + money0(value) + '</text>',
    );
  }
  rows.forEach((row, i) => {
    const x = leftPad + i * slot + slot * 0.14;
    const w = slot * 0.3;
    const incomeTop = yFor(row.income);
    const spentTop = yFor(row.spent);
    const incomeH = topPad + plotHeight - incomeTop;
    const spentH = topPad + plotHeight - spentTop;
    const midX = leftPad + i * slot + slot / 2;
    parts.push(
      '<rect x="' + x.toFixed(1) + '" y="' + incomeTop.toFixed(1) +
      '" width="' + w.toFixed(1) + '" height="' + incomeH.toFixed(1) +
      '" fill="#2e7d4f" rx="2"><title>' + row.month + ' income ' + money0(row.income) + '</title></rect>',
    );
    parts.push(
      '<rect x="' + (x + w + 3).toFixed(1) + '" y="' + spentTop.toFixed(1) +
      '" width="' + w.toFixed(1) + '" height="' + spentH.toFixed(1) +
      '" fill="#e8a33d" rx="2"><title>' + row.month + ' spent ' + money0(row.spent) + '</title></rect>',
    );
    parts.push(
      '<text x="' + midX.toFixed(1) + '" y="' + (height - 8) +
      '" text-anchor="middle" font-size="12" fill="#22301f">' + row.month + '</text>',
    );
  });
  parts.push(
    '<text x="' + leftPad + '" y="12" font-size="11" fill="#2e7d4f" font-weight="700">■ Income</text>' +
    '<text x="' + (leftPad + 78) + '" y="12" font-size="11" fill="#b07d1e" font-weight="700">■ Spent</text></svg>',
  );
  return parts.join('');
}

// Horizontal bars: planned vs spent per category.
export function planBars(rows) {
  let scale = 1;
  for (const r of rows) scale = Math.max(scale, r.planned, r.spent);
  const out = [];
  for (const r of rows) {
    const pct = Math.min(100, (r.spent / r.planned) * 100);
    const over = r.spent > r.planned;
    const barClass = over ? 'bar over' : 'bar';
    const overNote = over
      ? ' <span class="over">+' + money0(r.spent - r.planned) + ' over</span>'
      : '';
    out.push(
      '<div class="budget-row">' +
      '<span class="cat"><span class="dot" style="background:' + r.color + '"></span>' + r.name + '</span>' +
      '<span class="' + barClass + '" role="img" aria-label="' + r.name + ': spent ' + money0(r.spent) + ' of ' + money0(r.planned) + ' planned"><i style="width:' + pct.toFixed(0) + '%"></i></span>' +
      '<span class="nums">' + money0(r.spent) + ' / ' + money0(r.planned) + overNote + '</span>' +
      '</div>',
    );
  }
  return out.join('');
}
