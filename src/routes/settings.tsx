import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CURRENCIES } from "@/lib/finance";
import { useStore } from "@/lib/store";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/settings")({
  head: () => pageMeta("Settings", "Change your name and currency or reset your data."),
  component: SettingsPage,
});

function SettingsPage() {
  const { state, ready, setProfile, reset } = useStore();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("INR");
  useEffect(() => { if (ready) { setName(state.name); setCurrency(state.currency); } }, [ready, state.name, state.currency]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" subtitle="Personalise StudentSpend." />
      <form
        className="card-soft p-6 grid gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return toast.error("Name can't be empty");
          setProfile(name.trim(), currency);
          toast.success("Settings saved");
        }}
      >
        <h2 className="font-semibold text-lg">Profile</h2>
        <div className="grid gap-1.5"><Label htmlFor="sname">Your name</Label><Input id="sname" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid gap-1.5">
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <Button type="submit" className="justify-self-start rounded-xl">Save changes</Button>
      </form>

      <div className="card-soft p-6 border-destructive/30">
        <h2 className="font-semibold text-lg">Reset data</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Clear all expenses and goals, or restore the demo data.</p>
        <div className="flex flex-wrap gap-3">
          <ResetButton label="Clear all data" desc="All expenses and goals will be deleted." onConfirm={() => { reset(false); toast.success("All data cleared"); }} destructive />
          <ResetButton label="Restore sample data" desc="Your data will be replaced with demo transactions." onConfirm={() => { reset(true); toast.success("Sample data restored"); }} />
        </div>
      </div>
    </div>
  );
}

function ResetButton({ label, desc, onConfirm, destructive }: { label: string; desc: string; onConfirm: () => void; destructive?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant={destructive ? "destructive" : "outline"}>{label}</Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>{desc}</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
