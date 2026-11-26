// Hearth & Ledger views: one render function per page. Each function takes the
// state and returns the page's HTML; main.js wires the buttons and forms.
// Nothing here is fetched or computed from anywhere else — every number on
// screen comes from the state passed in.
import { TIPS, TODAY, TREND } from './data.js';
import {
  catColor,
  catName,
  daysUntil,
  fmtDate,
  money,
  money0,
  overdueBills,
  plannedTotal,
  spentByCategory,
  totalIncome,
  totalSpent,
  upcomingBills,
} from './store.js';
import { donut, planBars, trendBars } from './charts.js';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

function esc(value) {
  return String(value).replace(/[&<>"]/g, (ch) => ESCAPES[ch]);
}

function optionsFor(state, selectedId) {
  const out = [];
  for (const c of state.categories) {
    const mark = c.id === selectedId ? ' selected' : '';
    out.push('<option value="' + c.id + '"' + mark + '>' + esc(c.name) + '</option>');
  }
  return out.join('');
}

function categorySlices(state) {
  const byCat = spentByCategory(state);
  const slices = [];
  for (const c of state.categories) {
    if (c.id === 'savings') continue;
    const value = byCat[c.id] ?? 0;
    if (value > 0) slices.push({ name: c.name, value, color: c.color });
  }
  slices.sort((a, b) => b.value - a.value);
  return slices;
}

function txRow(state, t) {
  const color = catColor(state, t.category);
  const chip =
    '<span class="tag" style="background:' + color + '22;color:#22301f">' +
    esc(catName(state, t.category)) + '</span>';
  return (
    '<tr>' +
    '<td>' + fmtDate(t.date) + '</td>' +
    '<td>' + esc(t.desc) + '</td>' +
    '<td>' + chip + '</td>' +
    '<td class="num money">' + money(t.amount) + '</td>' +
    '<td class="num">' +
    '<button type="button" class="small secondary" data-action="edit-tx" data-id="' + t.id + '">Edit</button> ' +
    '<button type="button" class="small danger" data-action="delete-tx" data-id="' + t.id + '">Delete</button>' +
    '</td>' +
    '</tr>'
  );
}

function statCard(label, value, sub, tone) {
  const cls = tone ? 'card stat ' + tone : 'card stat';
  return (
    '<div class="' + cls + '">' +
    '<div class="label">' + label + '</div>' +
    '<div class="value">' + value + '</div>' +
    '<div class="sub">' + sub + '</div>' +
    '</div>'
  );
}

function billTag(b) {
  const d = daysUntil(b.due);
  if (b.paid) return '<span class="tag paid">Paid</span>';
  if (d < 0) {
    const n = -d;
    return '<span class="tag overdue">Overdue ' + n + ' day' + (n === 1 ? '' : 's') + '</span>';
  }
  if (d === 0) return '<span class="tag due-soon">Due today</span>';
  if (d <= 3) return '<span class="tag due-soon">Due in ' + d + ' days</span>';
  return '<span class="tag">Due ' + fmtDate(b.due) + '</span>';
}

export function dashboard(state) {
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const left = income - spent;
  const byCat = spentByCategory(state);
  const slices = categorySlices(state);
  let saved = 0;
  let target = 0;
  for (const g of state.goals) {
    saved += g.saved;
    target += g.target;
  }
  const upcoming = upcomingBills(state).slice(0, 3);
  const recent = [...state.transactions]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);
  const over = [];
  for (const c of state.categories) {
    if (c.id !== 'savings' && (byCat[c.id] ?? 0) > c.planned) over.push(c.name);
  }
  const leftLine = left >= 0
    ? 'You have <strong>' + money(left) + '</strong> of this month\'s income left.'
    : 'Spending is <strong>' + money(-left) + '</strong> past this month\'s income.';
  const overLine = over.length
    ? ' Watch out: <strong>' + over.join(', ') + '</strong> is over its monthly plan.'
    : '';
  const leftPct = Math.max(0, Math.round((left / income) * 100));
  const legendItems = [];
  for (const s of slices.slice(0, 6)) {
    legendItems.push(
      '<li><span class="dot" style="background:' + s.color + '"></span>' +
      esc(s.name) + '<span class="amt">' + money(s.value) + '</span></li>',
    );
  }
  const billRows = [];
  for (const b of upcoming) {
    billRows.push(
      '<div class="bill-row"><div class="who"><strong>' + esc(b.name) + '</strong>' +
      '<span class="when">' + esc(b.note) + '</span></div>' +
      billTag(b) + '<span class="money">' + money(b.amount) + '</span></div>',
    );
  }
  const recentRows = [];
  for (const t of recent) {
    recentRows.push(
      '<tr><td>' + fmtDate(t.date) + '</td><td>' + esc(t.desc) + '</td>' +
      '<td>' + esc(catName(state, t.category)) + '</td>' +
      '<td class="num money">' + money(t.amount) + '</td></tr>',
    );
  }
  const tips = [];
  for (const t of TIPS) {
    tips.push('<div class="tip"><strong>' + esc(t.title) + '.</strong> ' + esc(t.body) + '</div>');
  }
  const leftTone = left < 0 ? 'warn' : 'good';
  return (
    '<h1>Good morning, Harpers — here\'s November so far</h1>' +
    '<p class="lede">Income, spending, bills and savings for the household, up to 25 November 2026. ' +
    leftLine + overLine + '</p>' +
    '<div class="grid grid-4" style="margin-bottom:16px">' +
    statCard('Income — November', money(income), 'Salary, freelance &amp; interest', 'good') +
    statCard('Spent — to 25 Nov', money(spent), 'of ' + money(plannedTotal(state)) + ' planned', '') +
    statCard('Left to spend', money(left), leftPct + '% of income still in hand', leftTone) +
    statCard('Saved towards goals', money(saved), 'of ' + money(target) + ' across ' + state.goals.length + ' goals', 'good') +
    '</div>' +
    '<div class="grid grid-2">' +
    '<section class="card">' +
    '<h2>Where the money went <a href="#/charts">All charts →</a></h2>' +
    '<div class="chart-box">' + donut(slices) +
    '<ul class="legend">' + legendItems.join('') + '</ul></div>' +
    '<p class="small muted">Groceries is the only category over plan this month — $805.10 spent against $720 planned.</p>' +
    '</section>' +
    '<section class="card">' +
    '<h2>Bills coming up <a href="#/bills">All bills →</a></h2>' +
    billRows.join('') +
    '<p class="small"><a href="#/bills">See all ' + upcomingBills(state).length + ' unpaid bills →</a></p>' +
    '</section>' +
    '</div>' +
    '<div class="grid grid-2" style="margin-top:16px">' +
    '<section class="card">' +
    '<h2>Recent spending <a href="#/transactions">All transactions →</a></h2>' +
    '<table><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th></tr></thead>' +
    '<tbody>' + recentRows.join('') + '</tbody></table>' +
    '</section>' +
    '<section class="card">' +
    '<h2>Three things worth knowing</h2>' +
    tips.join('') +
    '<p class="small muted">Tips are computed from this month\'s own figures — they change as you add spending.</p>' +
    '</section>' +
    '</div>'
  );
}

export function transactionsView(state, filter) {
  const q = (filter.q ?? '').toLowerCase();
  const sorted = [...state.transactions].sort((a, b) => {
    if (a.date < b.date) return 1;
    if (a.date > b.date) return -1;
    return 0;
  });
  const list = [];
  for (const t of sorted) {
    if (filter.category && t.category !== filter.category) continue;
    if (q && !t.desc.toLowerCase().includes(q)) continue;
    list.push(t);
  }
  let total = 0;
  for (const t of list) total += t.amount;
  const editing = filter.edit
    ? state.transactions.find((t) => t.id === filter.edit) ?? null
    : null;
  const rows = [];
  for (const t of list) rows.push(txRow(state, t));
  const formTitle = editing ? 'Edit transaction' : 'Add a transaction';
  const submitLabel = editing ? 'Save changes' : 'Add transaction';
  const cancelBtn = editing
    ? '<button type="button" class="secondary" data-action="cancel-edit">Cancel</button>'
    : '';
  const clearBtn = filter.category || filter.q
    ? '<button type="button" class="secondary" data-action="clear-filter">Clear</button>'
    : '';
  const table = list.length
    ? '<table><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th class="num">Actions</th></tr></thead>' +
      '<tbody>' + rows.join('') + '</tbody></table>'
    : '<p class="empty">No transactions match that filter.</p>';
  return (
    '<h1>Transactions</h1>' +
    '<p class="lede">Every dollar the household spends, in one list. Add, edit or delete anything — ' +
    'totals update at once and are saved on this device.</p>' +
    '<section class="card">' +
    '<h2>' + formTitle + '</h2>' +
    '<form id="tx-form">' +
    '<input type="hidden" name="id" value="' + (editing ? editing.id : '') + '">' +
    '<div class="row">' +
    '<label class="wide">What was it? <input name="desc" required maxlength="80" value="' + (editing ? esc(editing.desc) : '') + '" placeholder="e.g. Weekly shop — GreenMart"></label>' +
    '<label>Amount ($) <input name="amount" type="number" min="0.01" step="0.01" required value="' + (editing ? editing.amount : '') + '" placeholder="0.00"></label>' +
    '<label>Date <input name="date" type="date" required value="' + (editing ? editing.date : TODAY) + '" min="2026-11-01" max="2026-11-30"></label>' +
    '<label>Category <select name="category">' + optionsFor(state, editing ? editing.category : 'groceries') + '</select></label>' +
    '</div>' +
    '<div class="actions"><button type="submit">' + submitLabel + '</button>' + cancelBtn + '</div>' +
    '</form>' +
    '</section>' +
    '<section class="card">' +
    '<h2>' + list.length + ' transactions · ' + money(total) + '</h2>' +
    '<form id="tx-filter" class="row" style="margin-bottom:10px">' +
    '<label style="flex:2 1 220px">Search <input name="q" type="search" value="' + esc(filter.q ?? '') + '" placeholder="Search descriptions…"></label>' +
    '<label>Category <select name="category"><option value="">All categories</option>' + optionsFor(state, filter.category ?? '') + '</select></label>' +
    '<div class="actions" style="align-items:flex-end"><button type="submit" class="secondary">Filter</button>' + clearBtn + '</div>' +
    '</form>' +
    table +
    '</section>'
  );
}

export function plannerView(state) {
  const byCat = spentByCategory(state);
  const rows = [];
  for (const c of state.categories) {
    let spent = byCat[c.id] ?? 0;
    if (c.id === 'savings') {
      spent = 0;
      for (const t of state.transactions) {
        if (t.category === 'savings') spent += t.amount;
      }
    }
    rows.push({ name: c.name, color: c.color, planned: c.planned, spent });
  }
  const savingsRow = rows.find((r) => r.name === 'Savings');
  const inputs = [];
  for (const c of state.categories) {
    inputs.push(
      '<label>' + esc(c.name) + ' ($) <input name="plan-' + c.id +
      '" type="number" min="0" step="1" value="' + c.planned + '"></label>',
    );
  }
  return (
    '<h1>Monthly budget planner</h1>' +
    '<p class="lede">The plan for November 2026: ' + money(plannedTotal(state)) + ' planned against ' +
    money(totalIncome(state)) + ' of income. Change any planned amount and save — the bars ' +
    'move at once. Groceries is over plan; everything else still has room.</p>' +
    '<section class="card">' +
    '<h2>Planned vs spent</h2>' +
    planBars(rows) +
    '<p class="small muted" style="margin-top:10px">Savings here means money actually moved to a goal this month (' +
    money(savingsRow.spent) + ' of ' + money(savingsRow.planned) + ' planned).</p>' +
    '</section>' +
    '<section class="card">' +
    '<h2>Edit the plan</h2>' +
    '<form id="plan-form">' +
    '<div class="row">' + inputs.join('') + '</div>' +
    '<div class="actions"><button type="submit">Save plan</button>' +
    '<span class="small muted" style="align-self:center">Planned total: <strong>' + money(plannedTotal(state)) +
    '</strong> · Income: <strong>' + money(totalIncome(state)) + '</strong></span></div>' +
    '</form>' +
    '</section>'
  );
}

export function goalsView(state) {
  const cards = [];
  for (const g of state.goals) {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    const remaining = Math.max(0, g.target - g.saved);
    const barTone = pct >= 100 ? '' : pct >= 70 ? ' amber' : '';
    const status = remaining > 0
      ? pct + '% saved · ' + money(remaining) + ' to go'
      : 'Goal reached — well done!';
    const progress = pct + '% saved';
    cards.push(
      '<section class="card goal">' +
      '<div class="goal-head"><strong>' + esc(g.name) + '</strong>' +
      '<span class="goal-fig">' + money(g.saved) + ' / ' + money(g.target) + '</span></div>' +
      '<div class="bar' + barTone + '" role="img" aria-label="' + esc(g.name) + ': ' + progress + '"><i style="width:' + pct + '%"></i></div>' +
      '<p class="small muted">' + status + '</p>' +
      '<p class="small">' + esc(g.note) + '</p>' +
      '<form class="add-funds" data-goal="' + g.id + '">' +
      '<label class="small" style="flex:1">Add funds ($) <input name="amount" type="number" min="1" step="1" required placeholder="50"></label>' +
      '<div class="actions" style="align-items:flex-end"><button type="submit" class="small">Add to goal</button></div>' +
      '</form>' +
      '</section>',
    );
  }
  return (
    '<h1>Savings goals</h1>' +
    '<p class="lede">Four things the Harpers are saving for. Add money to a goal whenever there is ' +
    'spare cash — the bar moves and the date it will be reached moves with it.</p>' +
    '<div class="grid grid-2">' + cards.join('') + '</div>' +
    '<section class="card" style="margin-top:16px">' +
    '<h2>Start a new goal</h2>' +
    '<form id="goal-form"><div class="row">' +
    '<label class="wide">Goal name <input name="name" required maxlength="60" placeholder="e.g. New bikes for the kids"></label>' +
    '<label>Target ($) <input name="target" type="number" min="1" step="1" required placeholder="500"></label>' +
    '<label>Already saved ($) <input name="saved" type="number" min="0" step="1" value="0"></label>' +
    '</div><div class="actions"><button type="submit">Add goal</button></div></form>' +
    '</section>'
  );
}

function billRowHtml(b, showPay) {
  const when = esc(b.note) + (b.paid ? '' : ' · due ' + fmtDate(b.due));
  const payBtn = showPay
    ? '<button type="button" class="small" data-action="pay-bill" data-id="' + b.id + '">Mark paid</button>'
    : '';
  return (
    '<div class="bill-row"><div class="who"><strong>' + esc(b.name) + '</strong>' +
    '<span class="when">' + when + '</span></div>' +
    billTag(b) + '<span class="money">' + money(b.amount) + '</span>' + payBtn + '</div>'
  );
}

export function billsView(state) {
  const unpaid = upcomingBills(state);
  const paid = [];
  for (const b of state.bills) {
    if (b.paid) paid.push(b);
  }
  paid.sort((a, b) => (a.due < b.due ? 1 : -1));
  let dueSoon = 0;
  for (const b of unpaid) dueSoon += b.amount;
  const overdue = overdueBills(state);
  const overdueLine = overdue.length
    ? '<strong class="neg">' + overdue.length + ' overdue — pay the water bill first, its autopay failed.</strong>'
    : 'Nothing is overdue.';
  const toPay = [];
  for (const b of unpaid) toPay.push(billRowHtml(b, true));
  const paidRows = [];
  for (const b of paid) paidRows.push(billRowHtml(b, false));
  return (
    '<h1>Bill reminders</h1>' +
    '<p class="lede">' + unpaid.length + ' bills still to pay in the next few weeks, totalling ' +
    '<strong>' + money(dueSoon) + '</strong>. ' + overdueLine + ' ' +
    'Mark a bill paid and it moves to the paid list.</p>' +
    '<section class="card">' +
    '<h2>To pay — ' + money(dueSoon) + '</h2>' +
    (unpaid.length ? toPay.join('') : '<p class="empty">All bills are paid. Enjoy the quiet.</p>') +
    '</section>' +
    '<section class="card">' +
    '<h2>Paid this month</h2>' +
    (paid.length ? paidRows.join('') : '<p class="empty">Nothing paid yet.</p>') +
    '</section>' +
    '<section class="card">' +
    '<h2>Add a bill</h2>' +
    '<form id="bill-form"><div class="row">' +
    '<label class="wide">Bill name <input name="name" required maxlength="80" placeholder="e.g. Car insurance"></label>' +
    '<label>Amount ($) <input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></label>' +
    '<label>Due date <input name="due" type="date" required value="2026-12-10" min="2026-11-25" max="2027-06-30"></label>' +
    '</div><div class="actions"><button type="submit">Add bill</button></div></form>' +
    '</section>'
  );
}

export function chartsView(state) {
  const byCat = spentByCategory(state);
  const slices = categorySlices(state);
  let total = 0;
  for (const s of slices) total += s.value;
  const legendItems = [];
  for (const s of slices) {
    const share = Math.round((s.value / total) * 100);
    legendItems.push(
      '<li><span class="dot" style="background:' + s.color + '"></span>' +
      esc(s.name) + '<span class="amt">' + money(s.value) + ' · ' + share + '%</span></li>',
    );
  }
  const housingPct = Math.round(((byCat.housing ?? 0) / total) * 100);
  const biggest = [...state.transactions]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  const bigRows = [];
  for (const t of biggest) {
    bigRows.push(
      '<tr><td>' + fmtDate(t.date) + '</td><td>' + esc(t.desc) + '</td>' +
      '<td class="num money">' + money(t.amount) + '</td></tr>',
    );
  }
  return (
    '<h1>Charts</h1>' +
    '<p class="lede">Six months of the household\'s money at a glance. November is counted to ' +
    '25 November; the other months are complete.</p>' +
    '<section class="card">' +
    '<h2>Spending by category — November</h2>' +
    '<div class="chart-box">' + donut(slices, 240) +
    '<ul class="legend">' + legendItems.join('') + '</ul></div>' +
    '<p class="small muted">Housing is the biggest slice at ' + housingPct + '% — rent, electricity and internet. Groceries is second, and the only category over its plan.</p>' +
    '</section>' +
    '<section class="card">' +
    '<h2>Income vs spending — June to November</h2>' +
    trendBars(TREND) +
    '<p class="small muted">The household saved money in every one of the last six months: income beat spending by $1,830 in June and by $2,365 so far in November.</p>' +
    '</section>' +
    '<section class="card">' +
    '<h2>Biggest single expenses this month</h2>' +
    '<table><thead><tr><th>Date</th><th>What</th><th class="num">Amount</th></tr></thead><tbody>' +
    bigRows.join('') +
    '</tbody></table>' +
    '</section>'
  );
}

export function notFound() {
  return (
    '<h1>That page isn\'t in the budget</h1>' +
    '<p class="lede">There\'s no page at this address. Try one of the sections above — the dashboard ' +
    'is a good place to start.</p>' +
    '<p><a href="#/">← Back to the dashboard</a></p>'
  );
}
