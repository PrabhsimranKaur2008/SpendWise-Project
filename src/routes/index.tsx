import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, PiggyBank, TrendingDown, Wallet, AlertTriangle } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMoney, useStore } from "@/lib/store";
import { budgetStatus, CATEGORY_COLORS, monthKey, monthTotal } from "@/lib/finance";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/")({
  head: () => pageMeta("Dashboard", "Your monthly spending, remaining budget and savings at a glance."),
  component: Dashboard,
});

function Dashboard() {
  const { state } = useStore();
  const money = useMoney();
  const now = new Date();
  const spent = monthTotal(state.expenses, monthKey(now));
  const b = budgetStatus(state.budget, spent);
  const savings = state.goals.reduce((s, g) => s + g.saved, 0);
  const recent = [...state.expenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: d.toLocaleString("en-IN", { month: "short" }), total: monthTotal(state.expenses, monthKey(d)) };
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="bg-hero rounded-3xl p-6 sm:p-8 text-primary-foreground">
        <p className="text-primary-foreground/70 text-sm">{now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
        <h1 className="mt-1 text-3xl sm:text-4xl font-bold">Hi {state.name} 👋</h1>
        <p className="mt-2 max-w-md text-primary-foreground/80">
          You've used {Math.round(b.percent)}% of this month's budget. {b.level === "ok" ? "Nice work, keep it up!" : "Time to slow down a little."}
        </p>
        <Button asChild variant="secondary" className="mt-5 rounded-xl">
          <Link to="/add">Add expense <ArrowRight /></Link>
        </Button>
      </section>

      {b.level !== "ok" && (
        <div className={`flex items-center gap-3 rounded-2xl border p-4 text-sm ${b.level === "over" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-warning/50 bg-warning/15 text-foreground"}`}>
          <AlertTriangle className="size-5 shrink-0" />
          {b.level === "over" ? `You've exceeded your budget by ${money(-b.remaining)}.` : `Heads up! Only ${money(b.remaining)} left in this month's budget.`}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat icon={TrendingDown} label="Spent this month" value={money(spent)} tone="bg-primary/10 text-primary" />
        <Stat icon={Wallet} label="Remaining budget" value={money(b.remaining)} tone="bg-secondary text-secondary-foreground">
          <Progress value={Math.min(100, b.percent)} className="mt-3 h-2" />
        </Stat>
        <Stat icon={PiggyBank} label="Total savings" value={money(savings)} tone="bg-accent/30 text-secondary-foreground" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card-soft p-5 lg:col-span-3">
          <h2 className="font-semibold text-lg">Monthly spending</h2>
          <p className="text-sm text-muted-foreground mb-4">Last 6 months</p>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={months}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={50} />
                <Tooltip formatter={(v: number) => money(v)} cursor={{ fill: "var(--muted)" }} />
                <Bar dataKey="total" fill="var(--chart-2)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card-soft p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Recent transactions</h2>
            <Link to="/history" className="text-sm font-medium text-success hover:underline">View all</Link>
          </div>
          {recent.length === 0 && <p className="text-sm text-muted-foreground py-8 text-center">No expenses yet.</p>}
          <ul className="divide-y">
            {recent.map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-3">
                <span className="size-2.5 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[e.category] }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{e.name}</p>
                  <p className="text-xs text-muted-foreground">{e.category} · {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                </div>
                <span className="font-semibold text-sm">-{money(e.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone, children }: { icon: typeof Wallet; label: string; value: string; tone: string; children?: React.ReactNode }) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
      {children}
    </div>
  );
}
