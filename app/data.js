// Seed data for Hearth & Ledger: the Harper household, November 2026.
// All figures are the household's own sample records. "Today" inside the site
// is fixed at 25 November 2026 so every view renders the same figures.
export const TODAY = '2026-11-25';
export const MONTH_LABEL = 'November 2026';

export const CATEGORIES = [
  { id: 'housing', name: 'Housing', color: '#2e7d4f', planned: 1850 },
  { id: 'groceries', name: 'Groceries', color: '#e8a33d', planned: 720 },
  { id: 'transport', name: 'Transport', color: '#3a6ea5', planned: 380 },
  { id: 'dining', name: 'Dining out', color: '#c96a3b', planned: 240 },
  { id: 'kids', name: 'Kids & school', color: '#7a5fb0', planned: 310 },
  { id: 'health', name: 'Health', color: '#4aa3a2', planned: 180 },
  { id: 'fun', name: 'Entertainment', color: '#b04a7a', planned: 150 },
  { id: 'clothing', name: 'Clothing', color: '#8a7a4a', planned: 120 },
  { id: 'home', name: 'Home & garden', color: '#5a8a3c', planned: 200 },
  { id: 'savings', name: 'Savings', color: '#2f6f6a', planned: 800 },
  { id: 'other', name: 'Other', color: '#8a8a7a', planned: 150 },
];

export const INCOME = [
  { id: 'inc1', date: '2026-11-01', source: "Maya's salary — Riverside Clinic", amount: 4200 },
  { id: 'inc2', date: '2026-11-06', source: 'Tom — freelance design, Northwind Studio', amount: 1450 },
  { id: 'inc3', date: '2026-11-18', source: 'Tom — freelance design, Baker & Co', amount: 700 },
  { id: 'inc4', date: '2026-11-15', source: 'Interest — savings account', amount: 150 },
];

export const TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', desc: 'Rent — Maple Street flat', category: 'housing', amount: 1450 },
  { id: 't02', date: '2026-11-01', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 148.2 },
  { id: 't03', date: '2026-11-02', desc: 'Bus passes — Maya & Tom', category: 'transport', amount: 96 },
  { id: 't04', date: '2026-11-03', desc: "Lily's school lunch money", category: 'kids', amount: 40 },
  { id: 't05', date: '2026-11-04', desc: 'Electricity — October bill', category: 'housing', amount: 132.5 },
  { id: 't06', date: '2026-11-05', desc: 'Pharmacy — cold medicine', category: 'health', amount: 28.4 },
  { id: 't07', date: '2026-11-06', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 162.75 },
  { id: 't08', date: '2026-11-07', desc: 'Pizza night — Tony’s', category: 'dining', amount: 42.9 },
  { id: 't09', date: '2026-11-08', desc: 'Petrol — family car', category: 'transport', amount: 58 },
  { id: 't10', date: '2026-11-09', desc: 'Transfer to emergency fund', category: 'savings', amount: 400 },
  { id: 't11', date: '2026-11-10', desc: 'School trip — Noah, science museum', category: 'kids', amount: 65 },
  { id: 't12', date: '2026-11-11', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 139.6 },
  { id: 't13', date: '2026-11-12', desc: 'Dentist check-up — Lily', category: 'health', amount: 85 },
  { id: 't14', date: '2026-11-13', desc: 'Cinema — family Friday', category: 'fun', amount: 54 },
  { id: 't15', date: '2026-11-14', desc: 'Winter coats — Lily & Noah', category: 'clothing', amount: 118 },
  { id: 't16', date: '2026-11-15', desc: 'Internet — November', category: 'housing', amount: 65 },
  { id: 't17', date: '2026-11-16', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 151.3 },
  { id: 't18', date: '2026-11-17', desc: 'Takeaway — Thai Orchid', category: 'dining', amount: 38.5 },
  { id: 't19', date: '2026-11-18', desc: 'Petrol — family car', category: 'transport', amount: 62.4 },
  { id: 't20', date: '2026-11-19', desc: 'New bookshelf — flat-pack', category: 'home', amount: 89.99 },
  { id: 't21', date: '2026-11-20', desc: 'Transfer to holiday fund', category: 'savings', amount: 200 },
  { id: 't22', date: '2026-11-21', desc: 'Weekly shop — GreenMart', category: 'groceries', amount: 144.85 },
  { id: 't23', date: '2026-11-21', desc: 'Birthday lunch — Grandma Rose', category: 'dining', amount: 86.2 },
  { id: 't24', date: '2026-11-22', desc: 'Swimming lessons — Noah (4 weeks)', category: 'kids', amount: 96 },
  { id: 't25', date: '2026-11-23', desc: 'Streaming — November', category: 'fun', amount: 15.99 },
  { id: 't26', date: '2026-11-23', desc: 'Garden seeds & potting soil', category: 'home', amount: 34.5 },
  { id: 't27', date: '2026-11-24', desc: 'Weekly shop — corner market', category: 'groceries', amount: 58.4 },
  { id: 't28', date: '2026-11-24', desc: 'School supplies — art class', category: 'kids', amount: 27.6 },
  { id: 't29', date: '2026-11-25', desc: 'Pharmacy — vitamins', category: 'health', amount: 19.75 },
  { id: 't30', date: '2026-11-25', desc: 'Bus top-up — Tom', category: 'transport', amount: 24 },
];

export const BILLS = [
  { id: 'b1', name: 'Water — City Water Co', amount: 48, due: '2026-11-20', paid: false, note: 'Autopay failed — pay by card' },
  { id: 'b2', name: 'Mobile phones — Maya & Tom', amount: 84, due: '2026-11-27', paid: false, note: 'Direct debit on the 27th' },
  { id: 'b3', name: 'Electricity — November', amount: 132, due: '2026-11-28', paid: false, note: 'Estimated — meter reading due' },
  { id: 'b4', name: 'Streaming — family plan', amount: 15.99, due: '2026-11-29', paid: false, note: '' },
  { id: 'b5', name: 'Rent — December', amount: 1450, due: '2026-12-01', paid: false, note: 'Standing order, 1st of the month' },
  { id: 'b6', name: 'Gym — Riverside Fitness', amount: 45, due: '2026-12-01', paid: false, note: '' },
  { id: 'b7', name: 'Home insurance — quarterly', amount: 210, due: '2026-12-05', paid: false, note: 'Quarterly — check the renewal letter' },
  { id: 'b8', name: 'Internet — November', amount: 65, due: '2026-11-15', paid: true, note: 'Paid 14 Nov' },
  { id: 'b9', name: 'Electricity — October', amount: 132.5, due: '2026-11-04', paid: true, note: 'Paid 4 Nov' },
];

export const GOALS = [
  { id: 'g1', name: 'Emergency fund', target: 6000, saved: 4200, note: 'Six months of essentials — the safety net first.' },
  { id: 'g2', name: 'Summer holiday — coast trip', target: 2500, saved: 1150, note: 'Train tickets, a cottage, and ice cream money.' },
  { id: 'g3', name: 'New washing machine', target: 900, saved: 640, note: 'The old one leaks. Replace before it floods the kitchen.' },
  { id: 'g4', name: "Kids' college fund", target: 10000, saved: 2300, note: 'Slow and steady — $100 a month, every month.' },
];

// Monthly totals, June–November 2026, for the trend chart.
export const TREND = [
  { month: 'Jun', income: 6450, spent: 4620 },
  { month: 'Jul', income: 6500, spent: 4890 },
  { month: 'Aug', income: 6300, spent: 4540 },
  { month: 'Sep', income: 6500, spent: 5120 },
  { month: 'Oct', income: 6500, spent: 4980 },
  { month: 'Nov', income: 6500, spent: 4135 }, // November to 25 Nov — matches the transaction list
];

export const TIPS = [
  { title: 'Dining out has $72.40 left', body: 'Three meals out so far total $167.60 against a $240 plan. One more takeaway tips it over — cook the Friday pizza at home this week and the month stays green.' },
  { title: 'Groceries: shop the list, not the aisle', body: 'Weekly shops run $139–$163. A written list and one big shop instead of top-ups would save roughly $40 a month — that is half a swimming term for Noah.' },
  { title: 'The water bill needs paying today', body: 'City Water Co ($48) was due 20 November and the autopay failed. Pay it by card now to avoid the $12 late fee.' },
];
