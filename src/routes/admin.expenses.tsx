import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/services/store";
import { deleteExpense, saveExpense } from "@/services/pos";
import { EmptyState, Money, PageHeader, Pill, StatCard } from "@/components/pos/ui";
import { FormDialog, SelectField, TextField, meta } from "@/components/pos/FormDialog";
import { Button } from "@/components/ui/button";
import type { Expense } from "@/types";

export const Route = createFileRoute("/admin/expenses")({
  head: () => meta("Expenses", "Track daily shop expenses by category."),
  component: Page,
});

const CATS = ["Utilities", "Salaries", "Supplies", "Maintenance", "Licence", "Rent", "Other"];

function Page() {
  const s = useAppState();
  const [edit, setEdit] = useState<Expense | null>(null);
  const month = new Date().toISOString().slice(0, 7);
  const monthList = s.expenses.filter((e) => e.date.startsWith(month));
  const total = monthList.reduce((a, e) => a + e.amount, 0);
  const sales = s.bills.filter((b) => b.createdAt.startsWith(month)).reduce((a, b) => a + b.total, 0);
  const sorted = [...s.expenses].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader title="Expenses" actions={<Button className="h-11" onClick={() => setEdit({ id: "", date: new Date().toISOString().slice(0, 10), category: "Supplies", description: "", amount: 0 })}><Plus /> Add expense</Button>} />
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatCard label="This month" value={<Money value={total} />} tone="danger" />
        <StatCard label="Entries" value={monthList.length} />
        <StatCard label="Sales − expenses" value={<Money value={sales - total} />} tone="success" />
      </div>
      {sorted.length === 0 ? <EmptyState icon={Wallet} title="No expenses recorded" /> : (
        <div className="divide-y rounded-lg border bg-card">
          {sorted.map((e) => (
            <button key={e.id} onClick={() => setEdit(e)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left active:bg-accent">
              <div className="min-w-0"><div className="truncate font-medium">{e.description}</div><div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">{e.date} <Pill>{e.category}</Pill></div></div>
              <Money value={e.amount} className="font-semibold" />
            </button>
          ))}
        </div>
      )}
      <FormDialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit?.id ? "Edit expense" : "New expense"}
        onSubmit={() => { if (!edit?.description.trim() || !(edit.amount > 0)) return toast.error("Description and amount are required"); saveExpense(edit); toast.success("Expense saved"); setEdit(null); }}
        onDelete={edit?.id ? () => { deleteExpense(edit.id); toast.success("Expense deleted"); setEdit(null); } : undefined}>
        {edit && (
          <>
            <TextField label="Description" value={edit.description} onChange={(v) => setEdit({ ...edit, description: v })} />
            <div className="grid grid-cols-2 gap-3">
              <SelectField label="Category" value={edit.category} onChange={(v) => setEdit({ ...edit, category: v })} options={CATS.map((c) => ({ value: c, label: c }))} />
              <TextField label="Amount (₹)" type="number" value={edit.amount || ""} onChange={(v) => setEdit({ ...edit, amount: Number(v) })} />
            </div>
            <TextField label="Date" type="date" value={edit.date} onChange={(v) => setEdit({ ...edit, date: v })} />
          </>
        )}
      </FormDialog>
    </div>
  );
}
