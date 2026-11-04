import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CATEGORIES, toISO, type Category, type Expense } from "@/lib/finance";

export function ExpenseForm({
  initial,
  onSubmit,
  submitLabel = "Save expense",
}: {
  initial?: Expense;
  onSubmit: (e: Omit<Expense, "id">) => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [category, setCategory] = useState<Category>(initial?.category ?? "Food");
  const [date, setDate] = useState(initial?.date ?? toISO(new Date()));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [error, setError] = useState("");

  return (
    <form
      className="grid gap-4 sm:grid-cols-2"
      onSubmit={(ev) => {
        ev.preventDefault();
        const amt = parseFloat(amount);
        if (!name.trim()) return setError("Please enter an expense name.");
        if (!(amt > 0)) return setError("Amount must be greater than 0.");
        if (!date) return setError("Please pick a date.");
        setError("");
        onSubmit({ name: name.trim(), amount: Math.round(amt * 100) / 100, category, date, description: description.trim() || undefined });
        if (!initial) { setName(""); setAmount(""); setDescription(""); }
      }}
    >
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="name">Expense name</Label>
        <Input id="name" placeholder="e.g. Canteen lunch" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="amount">Amount</Label>
        <Input id="amount" type="number" min="0" step="0.01" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      <div className="grid gap-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="grid gap-2 sm:col-span-2">
        <Label htmlFor="desc">Description <span className="text-muted-foreground">(optional)</span></Label>
        <Textarea id="desc" rows={3} placeholder="Any notes…" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="sm:col-span-2 rounded-xl">{submitLabel}</Button>
    </form>
  );
}
