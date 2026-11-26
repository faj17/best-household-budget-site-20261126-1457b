// Hearth & Ledger — boot, hash routing, and all the controls.
// Routes: #/ dashboard, #/transactions, #/planner, #/goals, #/bills, #/charts.
// State lives in localStorage (store.js); every change re-renders and saves.
// ?shot=cover|transactions|planner|phone stages a deterministic view for
// screenshots: the transactions shot adds one real expense through the same
// code path the Add form uses, so the shot shows the site working, not a mock.
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { TODAY } from './data.js';
import { loadState, money, resetState, saveState, totalSpent, uid } from './store.js';
import { billsView, chartsView, dashboard, goalsView, notFound, plannerView, transactionsView } from './views.js';

const app = document.getElementById('app');
let state = loadState();
let txFilter = { q: '', category: '', edit: '' };

// Route table: hash fragment -> [view function, document title].
const ROUTES = {
  dashboard: [(s) => dashboard(s), 'Hearth & Ledger — The Harper Household Budget'],
  transactions: [(s) => transactionsView(s, txFilter), 'Transactions | Hearth & Ledger'],
  planner: [(s) => plannerView(s), 'Budget planner | Hearth & Ledger'],
  goals: [(s) => goalsView(s), 'Savings goals | Hearth & Ledger'],
  bills: [(s) => billsView(s), 'Bill reminders | Hearth & Ledger'],
  charts: [(s) => chartsView(s), 'Charts | Hearth & Ledger'],
};

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function setActiveNav(route) {
  for (const a of document.querySelectorAll('[data-nav]')) {
    a.classList.toggle('active', a.dataset.nav === route);
  }
}

function render() {
  window.__shotReady = false;
  const hash = location.hash || '#/';
  const route = hash.replace(/^#\//, '').split('/')[0] || 'dashboard';
  const entry = ROUTES[route];
  if (entry) {
    app.innerHTML = entry[0](state);
    document.title = entry[1];
  } else {
    app.innerHTML = notFound();
    document.title = 'Page not found | Hearth & Ledger';
  }
  setActiveNav(ROUTES[route] ? route : 'dashboard');
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

function persist(msg) {
  saveState(state);
  render();
  if (msg) toast(msg);
}

// --- Transaction form: add or save an edit ---
function submitTx(form) {
  const data = new FormData(form);
  const desc = String(data.get('desc') ?? '').trim();
  const amount = Number(data.get('amount'));
  const date = String(data.get('date'));
  const category = String(data.get('category'));
  const id = String(data.get('id') ?? '');
  if (!desc || !(amount > 0) || !date || !category) return;
  if (id) {
    const t = state.transactions.find((x) => x.id === id);
    if (t) Object.assign(t, { desc, amount, date, category });
    txFilter.edit = '';
    persist(`Updated “${desc}” — ${money(amount)}.`);
  } else {
    state.transactions.push({ id: uid('t'), desc, amount, date, category });
    persist(`Added “${desc}” — ${money(amount)}. Total spent is now ${money(totalSpent(state))}.`);
  }
}

function submitPlan(form) {
  const data = new FormData(form);
  for (const c of state.categories) {
    const v = Number(data.get(`plan-${c.id}`));
    if (Number.isFinite(v) && v >= 0) c.planned = v;
  }
  persist('Budget plan saved.');
}

function submitGoal(form) {
  const data = new FormData(form);
  const name = String(data.get('name') ?? '').trim();
  const target = Number(data.get('target'));
  const saved = Number(data.get('saved') ?? 0);
  if (!name || !(target > 0)) return;
  state.goals.push({ id: uid('g'), name, target, saved: Number.isFinite(saved) && saved > 0 ? saved : 0, note: 'Added by the household.' });
  persist(`Goal “${name}” added — target ${money(target)}.`);
}

function submitBill(form) {
  const data = new FormData(form);
  const name = String(data.get('name') ?? '').trim();
  const amount = Number(data.get('amount'));
  const due = String(data.get('due'));
  if (!name || !(amount > 0) || !due) return;
  state.bills.push({ id: uid('b'), name, amount, due, paid: false, note: 'Added by the household' });
  persist(`Bill “${name}” added — due ${due}.`);
}

function submitAddFunds(form) {
  const goalId = form.dataset.goal;
  const amount = Number(new FormData(form).get('amount'));
  const g = state.goals.find((x) => x.id === goalId);
  if (!g || !(amount > 0)) return;
  g.saved = Math.round((g.saved + amount) * 100) / 100;
  persist(`Added ${money(amount)} to “${g.name}” — now ${money(g.saved)} of ${money(g.target)}.`);
}

app.addEventListener('submit', (e) => {
  const form = e.target;
  if (!(form instanceof HTMLFormElement)) return;
  e.preventDefault();
  if (form.id === 'tx-form') submitTx(form);
  else if (form.id === 'plan-form') submitPlan(form);
  else if (form.id === 'goal-form') submitGoal(form);
  else if (form.id === 'bill-form') submitBill(form);
  else if (form.classList.contains('add-funds')) submitAddFunds(form);
  else if (form.id === 'tx-filter') {
    const data = new FormData(form);
    txFilter.q = String(data.get('q') ?? '').trim();
    txFilter.category = String(data.get('category') ?? '');
    render();
  }
});

app.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  if (action === 'delete-tx') {
    const t = state.transactions.find((x) => x.id === id);
    if (!t) return;
    if (!window.confirm(`Delete “${t.desc}” (${money(t.amount)})?`)) return;
    state.transactions = state.transactions.filter((x) => x.id !== id);
    persist(`Deleted “${t.desc}”.`);
  } else if (action === 'edit-tx') {
    txFilter.edit = id;
    render();
    document.getElementById('tx-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } else if (action === 'cancel-edit') {
    txFilter.edit = '';
    render();
  } else if (action === 'clear-filter') {
    txFilter = { q: '', category: '', edit: '' };
    render();
  } else if (action === 'pay-bill') {
    const b = state.bills.find((x) => x.id === id);
    if (!b) return;
    b.paid = true;
    b.note = 'Paid 25 Nov 2026';
    persist(`Paid “${b.name}” — ${money(b.amount)}.`);
  }
});

document.getElementById('reset-data')?.addEventListener('click', () => {
  if (!window.confirm('Reset the budget to the November sample data? Your changes will be lost.')) return;
  state = resetState();
  txFilter = { q: '', category: '', edit: '' };
  persist('Sample data restored.');
});

window.addEventListener('hashchange', () => {
  txFilter.edit = '';
  render();
});

// Pressing "/" on the transactions page jumps straight to the search box,
// so a household hunting for one purchase does not have to reach for the mouse.
document.addEventListener('keydown', (e) => {
  if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
  const tag = (document.activeElement?.tagName ?? '').toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
  const route = (location.hash || '#/').replace(/^#\//, '').split('/')[0] || 'dashboard';
  if (route !== 'transactions') return;
  const search = document.querySelector('#tx-filter input[name="q"]');
  if (!search) return;
  e.preventDefault();
  search.focus();
  search.select();
});

// Screenshot staging: ?shot=transactions adds one real expense through the
// same submitTx path the form uses; ?shot=planner opens the planner.
function stageShot() {
  const shot = new URLSearchParams(location.search).get('shot');
  if (!shot) return;
  if (shot === 'transactions') {
    location.hash = '#/transactions';
    // Only once per browser profile: re-taking the shot in a profile that
    // already saved the demo expense must not add a second one.
    const already = state.transactions.some((t) => t.desc === 'Saturday market — vegetables');
    if (already) { txFilter.q = 'market'; render(); return; }
    const before = state.transactions.length;
    const form = document.createElement('form');
    const fill = (name, value) => {
      const input = document.createElement('input');
      input.name = name; input.value = value;
      form.appendChild(input);
    };
    fill('desc', 'Saturday market — vegetables');
    fill('amount', '24.60');
    fill('date', TODAY);
    fill('category', 'groceries');
    fill('id', '');
    submitTx(form);
    if (state.transactions.length === before + 1) {
      txFilter.q = 'market';
      render();
    }
  } else if (shot === 'planner') {
    location.hash = '#/planner';
    render();
  } else {
    location.hash = '#/';
    render();
  }
}

render();
stageShot();
