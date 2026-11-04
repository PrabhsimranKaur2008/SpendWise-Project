import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Target, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useMoney, useStore } from "@/lib/store";
import type { Goal } from "@/lib/finance";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/goals")({
  head: () => pageMeta("Savings Goals", "Create savings goals and track your progress toward each one."),
  component: GoalsPage,
});

function GoalsPage() {
  const { state, addGoal } = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Savings goals"
        subtitle="Small savings add up. Track what you're working toward."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="rounded-xl"><Plus /> New goal</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a savings goal</DialogTitle></DialogHeader>
              <form
                className="grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const t = parseFloat(target), s = parseFloat(saved || "0");
                  if (!name.trim() || !(t > 0) || s < 0) return toast.error("Enter a name and a target above 0");
                  addGoal({ name: name.trim(), target: t, saved: s });
                  setName(""); setTarget(""); setSaved(""); setOpen(false);
                  toast.success("Goal created");
                }}
              >
                <div className="grid gap-1.5"><Label htmlFor="gname">Goal name</Label><Input id="gname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New bicycle" /></div>
                <div className="grid gap-1.5"><Label htmlFor="gtarget">Target amount</Label><Input id="gtarget" type="number" min="1" value={target} onChange={(e) => setTarget(e.target.value)} /></div>
                <div className="grid gap-1.5"><Label htmlFor="gsaved">Already saved</Label><Input id="gsaved" type="number" min="0" value={saved} onChange={(e) => setSaved(e.target.value)} placeholder="0" /></div>
                <Button type="submit">Create goal</Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />
      {state.goals.length === 0 && <div className="card-soft p-10 text-center text-muted-foreground">No goals yet — create your first one!</div>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.goals.map((g) => <GoalCard key={g.id} goal={g} />)}
      </div>
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const { updateGoal, deleteGoal } = useStore();
  const money = useMoney();
  const [amt, setAmt] = useState("");
  const pct = Math.min(100, (goal.saved / goal.target) * 100);
  const done = goal.saved >= goal.target;
  return (
    <div className="card-soft p-5 flex flex-col">
      <div className="flex items-start justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Target className="size-5" /></span>
        <Button size="icon" variant="ghost" aria-label="Delete goal" className="text-destructive" onClick={() => { deleteGoal(goal.id); toast.success("Goal deleted"); }}><Trash2 /></Button>
      </div>
      <h3 className="mt-3 font-semibold text-lg">{goal.name}</h3>
      <p className="text-sm text-muted-foreground">{money(goal.saved)} of {money(goal.target)}</p>
      <Progress value={pct} className="mt-3 h-2.5" />
      <p className={`mt-1.5 text-sm font-medium ${done ? "text-success" : ""}`}>{done ? "🎉 Goal reached!" : `${pct.toFixed(0)}% · ${money(goal.target - goal.saved)} to go`}</p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const n = parseFloat(amt);
          if (!(n > 0)) return;
          updateGoal({ ...goal, saved: Math.round((goal.saved + n) * 100) / 100 });
          setAmt("");
          toast.success(`Added ${money(n)} to ${goal.name}`);
        }}
      >
        <Input type="number" min="0" placeholder="Add amount" value={amt} onChange={(e) => setAmt(e.target.value)} />
        <Button type="submit" variant="secondary">Add</Button>
      </form>
    </div>
  );
}
