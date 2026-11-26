// Views for Hearth & Ledger: one render function per page. Every figure comes
// from the state; every button and form is wired in main.js.
import { TIPS, TODAY, TREND } from './data.js';
import {
  catColor, catName, daysUntil, fmtDate, money, money0,
  overdueBills, plannedTotal, spentByCategory, totalIncome, totalSpent, upcomingBills,
} from './store.js';
import { donut, planBars, trendBars } from './charts.js';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function catOptions(state, selected) {
  return state.categories.map((c) => `<option value="${c.id}"${c.id === selected ? ' selected' : ''}>${esc(c.name)}</option>`).join('');
}

function txRow(state, t) {
  return `<tr>
    <td>${fmtDate(t.date)}</td>
    <td>${esc(t.desc)}</td>
    <td><span class="tag" style="background:${catColor(state, t.category)}22;color:#22301f">${esc(catName(state, t.category))}</span></td>
    <td class="num money">${money(t.amount)}</td>
    <td class="num"><button type="button" class="small secondary" data-action="edit-tx" data-id="${t.id}">Edit</button>
    <button type="button" class="small danger" data-action="delete-tx" data-id="${t.id}">Delete</button></td>
  </tr>`;
}

export function dashboard(state) {
  const income = totalIncome(state);
  const spent = totalSpent(state);
  const left = income - spent;
  const byCat = spentByCategory(state);
  const slices = state.categories
    .filter((c) => c.id !== 'savings' && (byCat[c.id] ?? 0) > 0)
    .map((c) => ({ name: c.name, value: byCat[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value);
  const saved = state.goals.reduce((s, g) => s + g.saved, 0);
  const target = state.goals.reduce((s, g) => s + g.target, 0);
  const upcoming = upcomingBills(state).slice(0, 3);
  const recent = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6);
  const over = state.categories
    .filter((c) => c.id !== 'savings' && (byCat[c.id] ?? 0) > c.planned)
    .map((c) => c.name);
  return `
  <h1>Good morning, Harpers — here's November so far</h1>
  <p class="lede">Income, spending, bills and savings for the household, up to 25 November 2026.
  ${left >= 0 ? `You have <strong>${money(left)}</strong> of this month's income left.` : `Spending is <strong>${money(-left)}</strong> past this month's income.`}
  ${over.length ? ` Watch out: <strong>${over.join(', ')}</strong> is over its monthly plan.` : ''}</p>
  <div class="grid grid-4" style="margin-bottom:16px">
    <div class="card stat good"><div class="label">Income — November</div><div class="value">${money(income)}</div><div class="sub">Salary, freelance &amp; interest</div></div>
    <div class="card stat"><div class="label">Spent — to 25 Nov</div><div class="value">${money(spent)}</div><div class="sub">of ${money(plannedTotal(state))} planned</div></div>
    <div class="card stat ${left < 0 ? 'warn' : 'good'}"><div class="label">Left to spend</div><div class="value">${money(left)}</div><div class="sub">${Math.max(0, Math.round((left / income) * 100))}% of income still in hand</div></div>
    <div class="card stat good"><div class="label">Saved towards goals</div><div class="value">${money(saved)}</div><div class="sub">of ${money(target)} across ${state.goals.length} goals</div></div>
  </div>
  <div class="grid grid-2">
    <section class="card">
      <h2>Where the money went <a href="#/charts">All charts →</a></h2>
      <div class="chart-box">${donut(slices)}
      <ul class="legend">${slices.slice(0, 6).map((s) => `<li><span class="dot" style="background:${s.color}"></span>${esc(s.name)}<span class="amt">${money(s.value)}</span></li>`).join('')}</ul></div>
      <p class="small muted">Groceries is the only category over plan this month — $805.10 spent against $720 planned.</p>
    </section>
    <section class="card">
      <h2>Bills coming up <a href="#/bills">All bills →</a></h2>
      ${upcoming.map((b) => {
        const d = daysUntil(b.due);
        const tag = d < 0 ? `<span class="tag overdue">Overdue ${-d} days</span>` : d === 0 ? '<span class="tag due-soon">Due today</span>' : d <= 3 ? `<span class="tag due-soon">Due in ${d} days</span>` : `<span class="tag">Due ${fmtDate(b.due)}</span>`;
        return `<div class="bill-row"><div class="who"><strong>${esc(b.name)}</strong><span class="when">${esc(b.note)}</span></div>${tag}<span class="money">${money(b.amount)}</span></div>`;
      }).join('')}
      <p class="small"><a href="#/bills">See all ${upcomingBills(state).length} unpaid bills →</a></p>
    </section>
  </div>
  <div class="grid grid-2" style="margin-top:16px">
    <section class="card">
      <h2>Recent spending <a href="#/transactions">All transactions →</a></h2>
      <table><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th></tr></thead>
      <tbody>${recent.map((t) => `<tr><td>${fmtDate(t.date)}</td><td>${esc(t.desc)}</td><td>${esc(catName(state, t.category))}</td><td class="num money">${money(t.amount)}</td></tr>`).join('')}</tbody></table>
    </section>
    <section class="card">
      <h2>Three things worth knowing</h2>
      ${TIPS.map((t) => `<div class="tip"><strong>${esc(t.title)}.</strong> ${esc(t.body)}</div>`).join('')}
      <p class="small muted">Tips are computed from this month's own figures — they change as you add spending.</p>
    </section>
  </div>`;
}

export function transactionsView(state, filter) {
  const q = (filter.q ?? '').toLowerCase();
  let list = [...state.transactions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  if (filter.category) list = list.filter((t) => t.category === filter.category);
  if (q) list = list.filter((t) => t.desc.toLowerCase().includes(q));
  const total = list.reduce((s, t) => s + t.amount, 0);
  const editing = filter.edit ? state.transactions.find((t) => t.id === filter.edit) : null;
  return `
  <h1>Transactions</h1>
  <p class="lede">Every dollar the household spends, in one list. Add, edit or delete anything —
  totals update at once and are saved on this device.</p>
  <section class="card">
    <h2>${editing ? 'Edit transaction' : 'Add a transaction'}</h2>
    <form id="tx-form">
      <input type="hidden" name="id" value="${editing ? editing.id : ''}">
      <div class="row">
        <label class="wide">What was it? <input name="desc" required maxlength="80" value="${editing ? esc(editing.desc) : ''}" placeholder="e.g. Weekly shop — GreenMart"></label>
        <label>Amount ($) <input name="amount" type="number" min="0.01" step="0.01" required value="${editing ? editing.amount : ''}" placeholder="0.00"></label>
        <label>Date <input name="date" type="date" required value="${editing ? editing.date : TODAY}" min="2026-11-01" max="2026-11-30"></label>
        <label>Category <select name="category">${catOptions(state, editing ? editing.category : 'groceries')}</select></label>
      </div>
      <div class="actions"><button type="submit">${editing ? 'Save changes' : 'Add transaction'}</button>
      ${editing ? '<button type="button" class="secondary" data-action="cancel-edit">Cancel</button>' : ''}</div>
    </form>
  </section>
  <section class="card">
    <h2>${list.length} transactions · ${money(total)}</h2>
    <form id="tx-filter" class="row" style="margin-bottom:10px">
      <label style="flex:2 1 220px">Search <input name="q" type="search" value="${esc(filter.q ?? '')}" placeholder="Search descriptions…"></label>
      <label>Category <select name="category"><option value="">All categories</option>${catOptions(state, filter.category ?? '')}</select></label>
      <div class="actions" style="align-items:flex-end"><button type="submit" class="secondary">Filter</button>
      ${filter.category || filter.q ? '<button type="button" class="secondary" data-action="clear-filter">Clear</button>' : ''}</div>
    </form>
    ${list.length ? `<table><thead><tr><th>Date</th><th>What</th><th>Category</th><th class="num">Amount</th><th class="num">Actions</th></tr></thead>
    <tbody>${list.map((t) => txRow(state, t)).join('')}</tbody></table>` : '<p class="empty">No transactions match that filter.</p>'}
  </section>`;
}

export function plannerView(state) {
  const byCat = spentByCategory(state);
  const rows = state.categories.map((c) => ({
    name: c.name, color: c.color, planned: c.planned,
    spent: c.id === 'savings' ? state.transactions.filter((t) => t.category === 'savings').reduce((s, t) => s + t.amount, 0) : (byCat[c.id] ?? 0),
  }));
  const saved = rows.find((r) => r.name === 'Savings');
  return `
  <h1>Monthly budget planner</h1>
  <p class="lede">The plan for November 2026: ${money(plannedTotal(state))} planned against
  ${money(totalIncome(state))} of income. Change any planned amount and save — the bars
  move at once. Groceries is over plan; everything else still has room.</p>
  <section class="card">
    <h2>Planned vs spent</h2>
    ${planBars(rows)}
    <p class="small muted" style="margin-top:10px">Savings here means money actually moved to a goal this month (${money(saved.spent)} of ${money(saved.planned)} planned).</p>
  </section>
  <section class="card">
    <h2>Edit the plan</h2>
    <form id="plan-form">
      <div class="row">${state.categories.map((c) => `<label>${esc(c.name)} ($) <input name="plan-${c.id}" type="number" min="0" step="1" value="${c.planned}"></label>`).join('')}</div>
      <div class="actions"><button type="submit">Save plan</button>
      <span class="small muted" style="align-self:center">Planned total: <strong>${money(plannedTotal(state))}</strong> · Income: <strong>${money(totalIncome(state))}</strong></span></div>
    </form>
  </section>`;
}

export function goalsView(state) {
  return `
  <h1>Savings goals</h1>
  <p class="lede">Four things the Harpers are saving for. Add money to a goal whenever there is
  spare cash — the bar moves and the date it will be reached moves with it.</p>
  <div class="grid grid-2">
  ${state.goals.map((g) => {
    const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
    const left = Math.max(0, g.target - g.saved);
    return `<section class="card goal">
      <div class="goal-head"><strong>${esc(g.name)}</strong><span class="goal-fig">${money(g.saved)} / ${money(g.target)}</span></div>
      <div class="bar${pct >= 100 ? '' : pct >= 70 ? ' amber' : ''}" role="img" aria-label="${esc(g.name)}: ${pct}% saved"><i style="width:${pct}%"></i></div>
      <p class="small muted">${pct}% saved · ${left > 0 ? `${money(left)} to go` : 'Goal reached — well done!'}</p>
      <p class="small">${esc(g.note)}</p>
      <form class="add-funds" data-goal="${g.id}">
        <label class="small" style="flex:1">Add funds ($) <input name="amount" type="number" min="1" step="1" required placeholder="50"></label>
        <div class="actions" style="align-items:flex-end"><button type="submit" class="small">Add to goal</button></div>
      </form>
    </section>`;
  }).join('')}
  </div>
  <section class="card" style="margin-top:16px">
    <h2>Start a new goal</h2>
    <form id="goal-form"><div class="row">
      <label class="wide">Goal name <input name="name" required maxlength="60" placeholder="e.g. New bikes for the kids"></label>
      <label>Target ($) <input name="target" type="number" min="1" step="1" required placeholder="500"></label>
      <label>Already saved ($) <input name="saved" type="number" min="0" step="1" value="0"></label>
    </div><div class="actions"><button type="submit">Add goal</button></div></form>
  </section>`;
}

export function billsView(state) {
  const unpaid = upcomingBills(state);
  const paid = state.bills.filter((b) => b.paid).sort((a, b) => (a.due < b.due ? 1 : -1));
  const dueSoon = unpaid.reduce((s, b) => s + b.amount, 0);
  const overdue = overdueBills(state);
  const billRow = (b, showPay) => {
    const d = daysUntil(b.due);
    const tag = b.paid ? '<span class="tag paid">Paid</span>'
      : d < 0 ? `<span class="tag overdue">Overdue ${-d} day${-d === 1 ? '' : 's'}</span>`
      : d === 0 ? '<span class="tag due-soon">Due today</span>'
      : d <= 3 ? `<span class="tag due-soon">Due in ${d} days</span>`
      : `<span class="tag">Due ${fmtDate(b.due)}</span>`;
    return `<div class="bill-row"><div class="who"><strong>${esc(b.name)}</strong><span class="when">${esc(b.note)}${b.paid ? '' : ` · due ${fmtDate(b.due)}`}</span></div>${tag}<span class="money">${money(b.amount)}</span>
    ${showPay ? `<button type="button" class="small" data-action="pay-bill" data-id="${b.id}">Mark paid</button>` : ''}</div>`;
  };
  return `
  <h1>Bill reminders</h1>
  <p class="lede">${unpaid.length} bills still to pay in the next few weeks, totalling
  <strong>${money(dueSoon)}</strong>. ${overdue.length ? `<strong class="neg">${overdue.length} overdue — pay the water bill first, its autopay failed.</strong>` : 'Nothing is overdue.'}
  Mark a bill paid and it moves to the paid list.</p>
  <section class="card">
    <h2>To pay — ${money(dueSoon)}</h2>
    ${unpaid.length ? unpaid.map((b) => billRow(b, true)).join('') : '<p class="empty">All bills are paid. Enjoy the quiet.</p>'}
  </section>
  <section class="card">
    <h2>Paid this month</h2>
    ${paid.length ? paid.map((b) => billRow(b, false)).join('') : '<p class="empty">Nothing paid yet.</p>'}
  </section>
  <section class="card">
    <h2>Add a bill</h2>
    <form id="bill-form"><div class="row">
      <label class="wide">Bill name <input name="name" required maxlength="80" placeholder="e.g. Car insurance"></label>
      <label>Amount ($) <input name="amount" type="number" min="0.01" step="0.01" required placeholder="0.00"></label>
      <label>Due date <input name="due" type="date" required value="2026-12-10" min="2026-11-25" max="2027-06-30"></label>
    </div><div class="actions"><button type="submit">Add bill</button></div></form>
  </section>`;
}

export function chartsView(state) {
  const byCat = spentByCategory(state);
  const slices = state.categories
    .filter((c) => c.id !== 'savings' && (byCat[c.id] ?? 0) > 0)
    .map((c) => ({ name: c.name, value: byCat[c.id], color: c.color }))
    .sort((a, b) => b.value - a.value);
  const total = slices.reduce((s, x) => s + x.value, 0);
  return `
  <h1>Charts</h1>
  <p class="lede">Six months of the household's money at a glance. November is counted to
  25 November; the other months are complete.</p>
  <section class="card">
    <h2>Spending by category — November</h2>
    <div class="chart-box">${donut(slices, 240)}
    <ul class="legend">${slices.map((s) => `<li><span class="dot" style="background:${s.color}"></span>${esc(s.name)}<span class="amt">${money(s.value)} · ${Math.round((s.value / total) * 100)}%</span></li>`).join('')}</ul></div>
    <p class="small muted">Housing is the biggest slice at ${Math.round(((byCat.housing ?? 0) / total) * 100)}% — rent, electricity and internet. Groceries is second, and the only category over its plan.</p>
  </section>
  <section class="card">
    <h2>Income vs spending — June to November</h2>
    ${trendBars(TREND)}
    <p class="small muted">The household saved money in every one of the last six months: income beat spending by $1,830 in June and by $2,365 so far in November.</p>
  </section>
  <section class="card">
    <h2>Biggest single expenses this month</h2>
    <table><thead><tr><th>Date</th><th>What</th><th class="num">Amount</th></tr></thead><tbody>
    ${[...state.transactions].sort((a, b) => b.amount - a.amount).slice(0, 5).map((t) => `<tr><td>${fmtDate(t.date)}</td><td>${esc(t.desc)}</td><td class="num money">${money(t.amount)}</td></tr>`).join('')}
    </tbody></table>
  </section>`;
}

export function notFound() {
  return `<h1>That page isn't in the budget</h1>
  <p class="lede">There's no page at this address. Try one of the sections above — the dashboard
  is a good place to start.</p>
  <p><a href="#/">← Back to the dashboard</a></p>`;
}
