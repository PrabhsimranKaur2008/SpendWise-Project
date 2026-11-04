import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { makeSampleState, uid, type AppState, type Expense, type Goal } from "./finance";

const KEY = "studentspend-v1";

interface Store {
  state: AppState;
  ready: boolean;
  addExpense: (e: Omit<Expense, "id">) => void;
  updateExpense: (e: Expense) => void;
  deleteExpense: (id: string) => void;
  setBudget: (n: number) => void;
  addGoal: (g: Omit<Goal, "id">) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;
  setProfile: (name: string, currency: string) => void;
  reset: (withSample: boolean) => void;
}

const Ctx = createContext<Store | null>(null);

const EMPTY: AppState = { name: "Student", currency: "INR", budget: 0, expenses: [], goals: [] };

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setState(raw ? JSON.parse(raw) : makeSampleState());
    } catch {
      setState(makeSampleState());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, ready]);

  const up = (fn: (s: AppState) => AppState) => setState(fn);

  const store: Store = {
    state,
    ready,
    addExpense: (e) => up((s) => ({ ...s, expenses: [{ ...e, id: uid() }, ...s.expenses] })),
    updateExpense: (e) => up((s) => ({ ...s, expenses: s.expenses.map((x) => (x.id === e.id ? e : x)) })),
    deleteExpense: (id) => up((s) => ({ ...s, expenses: s.expenses.filter((x) => x.id !== id) })),
    setBudget: (budget) => up((s) => ({ ...s, budget })),
    addGoal: (g) => up((s) => ({ ...s, goals: [...s.goals, { ...g, id: uid() }] })),
    updateGoal: (g) => up((s) => ({ ...s, goals: s.goals.map((x) => (x.id === g.id ? g : x)) })),
    deleteGoal: (id) => up((s) => ({ ...s, goals: s.goals.filter((x) => x.id !== id) })),
    setProfile: (name, currency) => up((s) => ({ ...s, name, currency })),
    reset: (withSample) => setState(withSample ? makeSampleState() : { ...EMPTY, budget: 10000 }),
  };
  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
}

export function useMoney() {
  const { state } = useStore();
  return (n: number) =>
    (state.currency === "INR" ? "₹" : ({ USD: "$", EUR: "€", GBP: "£" } as Record<string, string>)[state.currency] ?? "₹") +
    n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
