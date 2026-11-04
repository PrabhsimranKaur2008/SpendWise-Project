import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { ExpenseForm } from "@/components/ExpenseForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, CATEGORY_COLORS, type Expense } from "@/lib/finance";
import { useMoney, useStore } from "@/lib/store";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/history")({
  head: () => pageMeta("Expense History", "Browse, filter, edit and delete all your past expenses."),
  component: HistoryPage,
});

function HistoryPage() {
  const { state, updateExpense, deleteExpense } = useStore();
  const money = useMoney();
  const [cat, setCat] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const list = useMemo(
    () =>
      [...state.expenses]
        .filter((e) => (cat === "all" || e.category === cat) && (!from || e.date >= from) && (!to || e.date <= to))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [state.expenses, cat, from, to],
  );
  const total = list.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Expense history" subtitle={`${list.length} transactions · ${money(total)} total`} />
      <div className="card-soft p-4 mb-4 grid gap-3 sm:grid-cols-4 items-end">
        <div className="grid gap-1.5">
          <Label>Category</Label>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5"><Label htmlFor="from">From</Label><Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        <div className="grid gap-1.5"><Label htmlFor="to">To</Label><Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        <Button variant="outline" onClick={() => { setCat("all"); setFrom(""); setTo(""); }}>Clear filters</Button>
      </div>

      <div className="card-soft divide-y overflow-hidden">
        {list.length === 0 && <p className="p-10 text-center text-muted-foreground">No transactions match your filters.</p>}
        {list.map((e) => (
          <div key={e.id} className="flex items-center gap-3 p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl text-xs font-bold text-primary-foreground" style={{ background: CATEGORY_COLORS[e.category] }}>
              {e.category.slice(0, 2)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{e.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {e.category} · {new Date(e.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {e.description ? ` · ${e.description}` : ""}
              </p>
            </div>
            <span className="font-semibold whitespace-nowrap">{money(e.amount)}</span>
            <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => setEditing(e)}><Pencil /></Button>
            <Button size="icon" variant="ghost" aria-label="Delete" className="text-destructive" onClick={() => setDeleting(e)}><Trash2 /></Button>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit expense</DialogTitle></DialogHeader>
          {editing && (
            <ExpenseForm
              key={editing.id}
              initial={editing}
              submitLabel="Update expense"
              onSubmit={(data) => { updateExpense({ ...data, id: editing.id }); setEditing(null); toast.success("Expense updated"); }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{deleting?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>This expense will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleting) deleteExpense(deleting.id); setDeleting(null); toast.success("Expense deleted"); }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
