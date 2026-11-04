import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { ExpenseForm } from "@/components/ExpenseForm";
import { useStore } from "@/lib/store";
import { pageMeta } from "@/lib/meta";

export const Route = createFileRoute("/add")({
  head: () => pageMeta("Add Expense", "Record a new expense with category, date and notes."),
  component: AddPage,
});

function AddPage() {
  const { addExpense } = useStore();
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add expense" subtitle="Log what you spent — it only takes a few seconds." />
      <div className="card-soft p-6">
        <ExpenseForm
          onSubmit={(e) => {
            addExpense(e);
            toast.success("Expense saved", { action: { label: "View history", onClick: () => navigate({ to: "/history" }) } });
          }}
        />
      </div>
    </div>
  );
}
