import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { budgetStatus, byCategory, CATEGORY_COLORS, monthKey, monthTotal } from "@/lib/finance";
import { useMoney, useStore } from "@/lib/store";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/budget")({
  head: () => pageMeta("Monthly Budget", "Set a monthly budget and see how much you've used and have left."),
  component: BudgetPage,
});

function BudgetPage() {
  const { state, setBudget, ready } = useStore();
  const money = useMoney();
  const [value, setValue] = useState("");
  useEffect(() => { if (ready) setValue(String(state.budget)); }, [ready, state.budget]);

  const key = monthKey(new Date());
  const spent = monthTotal(state.expenses, key);
  const b = budgetStatus(state.budget, spent);
  const cats = byCategory(state.expenses.filter((e) => e.date.startsWith(key)));

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Monthly budget" subtitle={new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })} />
      <form
        className="card-soft p-5 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          const n = parseFloat(value);
          if (!(n >= 0)) return toast.error("Enter a valid budget amount");
          setBudget(n);
          toast.success("Budget updated");
        }}
      >
        <div className="grid gap-1.5 flex-1 min-w-48">
          <Label htmlFor="budget">Monthly budget</Label>
          <Input id="budget" type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
        <Button type="submit" className="rounded-xl">Set budget</Button>
      </form>

      <div className="card-soft p-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div><p className="text-sm text-muted-foreground">Budget</p><p className="font-display text-xl sm:text-2xl font-bold">{money(state.budget)}</p></div>
          <div><p className="text-sm text-muted-foreground">Used</p><p className="font-display text-xl sm:text-2xl font-bold">{money(spent)}</p></div>
          <div><p className="text-sm text-muted-foreground">Remaining</p><p className={`font-display text-xl sm:text-2xl font-bold ${b.remaining < 0 ? "text-destructive" : "text-success"}`}>{money(b.remaining)}</p></div>
        </div>
        <Progress value={Math.min(100, b.percent)} className="mt-6 h-3" />
        <p className="mt-2 text-right text-sm text-muted-foreground">{b.percent.toFixed(1)}% used</p>
        <div className={`mt-4 flex items-center gap-3 rounded-xl p-4 text-sm ${b.level === "ok" ? "bg-secondary text-secondary-foreground" : b.level === "warning" ? "bg-warning/15" : "bg-destructive/10 text-destructive"}`}>
          {b.level === "ok" ? <CheckCircle2 className="size-5" /> : <AlertTriangle className="size-5" />}
          {b.level === "ok" && "You're within budget. Great going!"}
          {b.level === "warning" && "Warning: you've used over 80% of your budget. Spend carefully."}
          {b.level === "over" && "You've gone over your monthly budget."}
        </div>
      </div>

      <div className="card-soft p-6">
        <h2 className="font-semibold text-lg mb-4">This month by category</h2>
        {cats.length === 0 && <p className="text-sm text-muted-foreground">No spending yet this month.</p>}
        <div className="space-y-4">
          {cats.map((c) => (
            <div key={c.category}>
              <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">{c.category}</span><span>{money(c.total)}</span></div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${spent ? (c.total / spent) * 100 : 0}%`, background: CATEGORY_COLORS[c.category] }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
