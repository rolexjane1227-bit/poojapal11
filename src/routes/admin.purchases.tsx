import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/services/store";
import { addPurchase } from "@/services/pos";
import { EmptyState, Money, PageHeader } from "@/components/pos/ui";
import { FormDialog, SelectField, TextField, meta } from "@/components/pos/FormDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/purchases")({
  head: () => meta("Purchases", "Record supplier deliveries and update stock."),
  component: Page,
});

const today = () => new Date().toISOString().slice(0, 10);

function Page() {
  const s = useAppState();
  const tracked = s.products.filter((p) => p.lowStockAt > 0);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ date: today(), supplier: "", productId: tracked[0]?.id ?? "", qty: "", costPerUnit: "", invoiceNo: "" });
  const name = (id: string) => s.products.find((p) => p.id === id)?.name ?? "—";
  const monthTotal = s.purchases.filter((p) => p.date.slice(0, 7) === today().slice(0, 7)).reduce((a, p) => a + p.qty * p.costPerUnit, 0);

  return (
    <div>
      <PageHeader title="Purchases & stock entry" subtitle={<>This month <Money value={monthTotal} /></>} actions={<Button className="h-11" onClick={() => setOpen(true)}><Plus /> New entry</Button>} />
      {s.purchases.length === 0 ? <EmptyState icon={Truck} title="No purchases yet" /> : (
        <div className="divide-y rounded-lg border bg-card">
          {s.purchases.map((p) => (
            <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{name(p.productId)} <span className="text-muted-foreground">× {p.qty}</span></div>
                <div className="truncate text-xs text-muted-foreground">{p.date} · {p.supplier} · Inv {p.invoiceNo}</div>
              </div>
              <div className="text-right"><Money value={p.qty * p.costPerUnit} className="font-semibold" /><div className="text-xs text-muted-foreground">@ ₹{p.costPerUnit}</div></div>
            </div>
          ))}
        </div>
      )}
      <FormDialog open={open} onOpenChange={setOpen} title="Stock entry" submitLabel="Add to stock"
        onSubmit={() => {
          if (!f.supplier.trim() || !(Number(f.qty) > 0) || !(Number(f.costPerUnit) > 0)) return toast.error("Supplier, quantity and cost are required");
          addPurchase({ ...f, qty: Number(f.qty), costPerUnit: Number(f.costPerUnit) });
          toast.success(`${f.qty} units added to ${name(f.productId)}`);
          setOpen(false);
          setF({ ...f, qty: "", costPerUnit: "", invoiceNo: "" });
        }}>
        <SelectField label="Product" value={f.productId} onChange={(v) => setF({ ...f, productId: v })} options={tracked.map((p) => ({ value: p.id, label: `${p.name} (${p.unit})` }))} />
        <TextField label="Supplier" value={f.supplier} onChange={(v) => setF({ ...f, supplier: v })} placeholder="e.g. Shree Sai Distributors" />
        <div className="grid grid-cols-2 gap-3">
          <TextField label="Quantity" type="number" value={f.qty} onChange={(v) => setF({ ...f, qty: v })} />
          <TextField label="Cost / unit (₹)" type="number" value={f.costPerUnit} onChange={(v) => setF({ ...f, costPerUnit: v })} />
          <TextField label="Invoice no." value={f.invoiceNo} onChange={(v) => setF({ ...f, invoiceNo: v })} />
          <TextField label="Date" type="date" value={f.date} onChange={(v) => setF({ ...f, date: v })} />
        </div>
      </FormDialog>
    </div>
  );
}
