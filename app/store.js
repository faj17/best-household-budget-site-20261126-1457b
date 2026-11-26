// State for Hearth & Ledger: loads the November seed data, keeps every change in
// localStorage, and computes the totals every view shows.
import { BILLS, CATEGORIES, GOALS, INCOME, TRANSACTIONS } from './data.js';

const KEY = 'hearth-ledger-v1';

export function defaultState() {
  return {
    categories: CATEGORIES.map((c) => ({ ...c })),
    income: INCOME.map((i) => ({ ...i })),
    transactions: TRANSACTIONS.map((t) => ({ ...t })),
    bills: BILLS.map((b) => ({ ...b })),
    goals: GOALS.map((g) => ({ ...g })),
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    for (const k of Object.keys(base)) if (!Array.isArray(parsed[k])) parsed[k] = base[k];
    return parsed;
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(KEY);
  return defaultState();
}

export function money(n) {
  const v = Math.round(n * 100) / 100;
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function money0(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

export function catName(state, id) {
  return state.categories.find((c) => c.id === id)?.name ?? 'Other';
}

export function catColor(state, id) {
  return state.categories.find((c) => c.id === id)?.color ?? '#8a8a7a';
}

export function totalIncome(state) {
  return state.income.reduce((s, i) => s + i.amount, 0);
}

export function totalSpent(state) {
  return state.transactions.reduce((s, t) => s + t.amount, 0);
}

// Spending per category, excluding money moved into savings (a transfer, not spending).
export function spentByCategory(state) {
  const out = {};
  for (const t of state.transactions) {
    if (t.category === 'savings') continue;
    out[t.category] = (out[t.category] ?? 0) + t.amount;
  }
  return out;
}

export function plannedTotal(state) {
  return state.categories.reduce((s, c) => s + c.planned, 0);
}

export function upcomingBills(state) {
  return state.bills.filter((b) => !b.paid).sort((a, b) => (a.due < b.due ? -1 : 1));
}

export function overdueBills(state) {
  return state.bills.filter((b) => !b.paid && b.due < '2026-11-26');
}

export function uid(prefix) {
  return prefix + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36);
}

export function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d} ${months[m - 1]} ${y}`;
}

export function daysUntil(iso) {
  const a = new Date(iso + 'T00:00:00Z').getTime();
  const b = new Date('2026-11-25T00:00:00Z').getTime();
  return Math.round((a - b) / 86400000);
}
