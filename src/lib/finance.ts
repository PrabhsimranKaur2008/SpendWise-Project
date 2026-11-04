export const CATEGORIES = [
  "Food",
  "Transportation",
  "Education",
  "Shopping",
  "Entertainment",
  "Accommodation",
  "Other",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_COLORS: Record<Category, string> = {
  Food: "var(--chart-1)",
  Transportation: "var(--chart-2)",
  Education: "var(--chart-3)",
  Shopping: "var(--chart-4)",
  Entertainment: "var(--chart-5)",
  Accommodation: "var(--chart-6)",
  Other: "var(--chart-7)",
};

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: Category;
  date: string; // yyyy-mm-dd
  description?: string | undefined;
}
export interface Goal {
  id: string;
  name: string;
  target: number;
  saved: number;
}
export interface AppState {
  name: string;
  currency: string;
  budget: number;
  expenses: Expense[];
  goals: Goal[];
}

export const CURRENCIES = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
];

export function formatMoney(n: number, currency = "INR") {
  const sym = CURRENCIES.find((c) => c.code === currency)?.symbol ?? "₹";
  return sym + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function toISO(d: Date) {
  return `${monthKey(d)}-${String(d.getDate()).padStart(2, "0")}`;
}

export function monthTotal(expenses: Expense[], key: string) {
  return round(expenses.filter((e) => e.date.startsWith(key)).reduce((s, e) => s + e.amount, 0));
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export type BudgetLevel = "ok" | "warning" | "over";
export function budgetStatus(budget: number, spent: number) {
  const remaining = round(budget - spent);
  const percent = budget > 0 ? (spent / budget) * 100 : 0;
  const level: BudgetLevel = percent >= 100 ? "over" : percent >= 80 ? "warning" : "ok";
  return { spent, remaining, percent, level };
}

export function byCategory(expenses: Expense[]) {
  return CATEGORIES.map((c) => ({
    category: c,
    total: round(expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0)),
  })).filter((x) => x.total > 0);
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function makeSampleState(): AppState {
  const now = new Date();
  const items: [string, number, Category, number, string?][] = [
    ["Mess lunch", 120, "Food", 0],
    ["Metro card recharge", 300, "Transportation", 1],
    ["Engineering Physics textbook", 650, "Education", 2, "Second-hand from senior"],
    ["Movie with friends", 280, "Entertainment", 3],
    ["Hostel rent", 4500, "Accommodation", 4],
    ["Canteen snacks", 85, "Food", 5],
    ["Lab record notebooks", 180, "Education", 6],
    ["T-shirt (sale)", 499, "Shopping", 8],
    ["Auto to station", 150, "Transportation", 9],
    ["Pizza night", 360, "Food", 11],
    ["Mobile recharge", 299, "Other", 12],
    ["Printouts & xerox", 60, "Education", 14],
    ["Groceries", 540, "Food", 33],
    ["Hostel rent", 4500, "Accommodation", 35],
    ["Bus pass", 400, "Transportation", 37],
    ["Earphones", 799, "Shopping", 40],
    ["College fest ticket", 250, "Entertainment", 45],
    ["Coffee & snacks", 210, "Food", 50],
    ["Hostel rent", 4500, "Accommodation", 65],
    ["Online course", 449, "Education", 70],
    ["Dinner outing", 420, "Food", 80],
    ["Train ticket home", 620, "Transportation", 90],
  ];
  const expenses = items.map(([name, amount, category, ago, description]) => {
    const d = new Date(now);
    d.setDate(d.getDate() - ago);
    return { id: uid(), name, amount, category, date: toISO(d), description };
  });
  return {
    name: "Aarav",
    currency: "INR",
    budget: 10000,
    expenses,
    goals: [
      { id: uid(), name: "New laptop", target: 45000, saved: 12500 },
      { id: uid(), name: "Goa trip with friends", target: 8000, saved: 5200 },
      { id: uid(), name: "Emergency fund", target: 5000, saved: 1500 },
    ],
  };
}
