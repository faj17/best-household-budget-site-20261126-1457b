// Hearth & Ledger state: the November seed records, localStorage persistence,
// and every total the pages display. One module, one job: hold the household's
// numbers and answer questions about them. Nothing here touches the DOM.
import { BILLS, CATEGORIES, GOALS, INCOME, TRANSACTIONS } from './data.js';

// The single localStorage slot the whole site shares.
const STORAGE_KEY = 'hearth-ledger-v1';

// A fixed "today" for the month: every due date and total is measured from it.
const TODAY_ISO = '2026-11-25';
const OVERDUE_CUTOFF = '2026-11-26';
const DAY_MS = 86_400_000;

function cloneRows(rows) {
  const out = [];
  for (const row of rows) out.push({ ...row });
  return out;
}

export function defaultState() {
  return {
    categories: cloneRows(CATEGORIES),
    income: cloneRows(INCOME),
    transactions: cloneRows(TRANSACTIONS),
    bills: cloneRows(BILLS),
    goals: cloneRows(GOALS),
  };
}

function stateShapeOk(parsed, base) {
  if (!parsed || typeof parsed !== 'object') return false;
  for (const key of Object.keys(base)) {
    if (!Array.isArray(parsed[key])) return false;
  }
  return true;
}

export function loadState() {
  const base = defaultState();
  let raw = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return base;
  }
  if (!raw) return base;
  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return base;
  }
  if (!stateShapeOk(parsed, base)) return base;
  return parsed;
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  return defaultState();
}

function formatGrouped(value, fractionDigits) {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function money(n) {
  const cents = Math.round(n * 100) / 100;
  return '$' + formatGrouped(cents, 2);
}

export function money0(n) {
  return '$' + formatGrouped(Math.round(n), 0);
}

function findCategory(state, id) {
  for (const c of state.categories) {
    if (c.id === id) return c;
  }
  return undefined;
}

export function catName(state, id) {
  return findCategory(state, id)?.name ?? 'Other';
}

export function catColor(state, id) {
  return findCategory(state, id)?.color ?? '#8a8a7a';
}

export function totalIncome(state) {
  let sum = 0;
  for (const item of state.income) sum += item.amount;
  return sum;
}

export function totalSpent(state) {
  let sum = 0;
  for (const t of state.transactions) sum += t.amount;
  return sum;
}

// Spending per category. Money moved to a savings goal is a transfer, not
// spending, so the 'savings' category never lands in this map.
export function spentByCategory(state) {
  const perCat = {};
  for (const t of state.transactions) {
    if (t.category === 'savings') continue;
    perCat[t.category] = (perCat[t.category] ?? 0) + t.amount;
  }
  return perCat;
}

export function plannedTotal(state) {
  let sum = 0;
  for (const c of state.categories) sum += c.planned;
  return sum;
}

function byDueDate(a, b) {
  if (a.due < b.due) return -1;
  if (a.due > b.due) return 1;
  return 0;
}

export function upcomingBills(state) {
  const open = [];
  for (const b of state.bills) {
    if (!b.paid) open.push(b);
  }
  open.sort(byDueDate);
  return open;
}

export function overdueBills(state) {
  const late = [];
  for (const b of state.bills) {
    if (!b.paid && b.due < OVERDUE_CUTOFF) late.push(b);
  }
  return late;
}

export function uid(prefix) {
  const stamp = Date.now().toString(36);
  const rand = Math.floor(Math.random() * 1e6).toString(36);
  return prefix + stamp + rand;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function fmtDate(iso) {
  const parts = iso.split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  return d + ' ' + MONTHS[m - 1] + ' ' + y;
}

export function daysUntil(iso) {
  const due = new Date(iso + 'T00:00:00Z').getTime();
  const today = new Date(TODAY_ISO + 'T00:00:00Z').getTime();
  return Math.round((due - today) / DAY_MS);
}
