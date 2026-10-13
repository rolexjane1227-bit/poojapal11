import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Boxes, Truck } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/services/store";
import { adjustStock } from "@/services/pos";
import { EmptyState, Money, PageHeader, Pill, Segmented, StatCard } from "@/components/pos/ui";
import { FormDialog, SearchInput, TextField, meta } from "@/components/pos/FormDialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types";

export const Route = createFileRoute("/admin/inventory")({
  head: () => meta("Inventory", "Stock levels and low-stock alerts for bar items."),
  component: Page,
});

type F = "all" | "low" | "out";

function Page() {
  const s = useAppState();
  const [f, setF] = useState<F>("all");
  const [q, setQ] = useState("");
  const [adj, setAdj] = useState<Product | null>(null);
  const [delta, setDelta] = useState("");
  const tracked = s.products.filter((p) => p.lowStockAt > 0);
  const low = tracked.filter((p) => p.stock <= p.lowStockAt && p.stock > 0);
  const out = tracked.filter((p) => p.stock === 0);
  const list = tracked.filter((p) => (f === "all" || (f === "low" ? p.stock <= p.lowStockAt && p.stock > 0 : p.stock === 0)) && p.name.toLowerCase().includes(q.toLowerCase()));
  const value = tracked.reduce((a, p) => a + p.stock * p.price, 0);

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Stock-tracked bar items" actions={<Button asChild className="h-11"><Link to="/admin/purchases"><Truck /> Stock entry</Link></Button>} />
      <div className="mb-4 grid grid-cols-3 gap-3">
        <StatCard label="Tracked SKUs" value={tracked.length} />
        <StatCard label="Low stock" value={low.length} tone="primary" />
        <StatCard label="Out of stock" value={out.length} tone="danger" hint={<>Stock value <Money value={value} /></>} />
      </div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <Segmented<F> value={f} onChange={setF} options={[{ value: "all", label: "All" }, { value: "low", label: `Low ${low.length}` }, { value: "out", label: `Out ${out.length}` }]} />
        <div className="sm:ml-auto"><SearchInput value={q} onChange={setQ} placeholder="Search stock" /></div>
      </div>
      {list.length === 0 ? <EmptyState icon={Boxes} title="Nothing here" description="No items match this filter." /> : (
        <div className="divide-y rounded-lg border bg-card">
          {list.map((p) => {
            const pct = Math.min(100, (p.stock / (p.lowStockAt * 4)) * 100);
            const tone = p.stock === 0 ? "danger" : p.stock <= p.lowStockAt ? "primary" : "success";
            return (
              <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="truncate font-medium">{p.name}</span><span className="text-xs text-muted-foreground">{p.unit}</span></div>
                  <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                    <div className={`h-full rounded-full ${tone === "danger" ? "bg-destructive" : tone === "primary" ? "bg-primary" : "bg-success"}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right"><div className="tabular font-semibold">{p.stock}</div><Pill tone={tone}>{tone === "danger" ? "Out" : tone === "primary" ? `Min ${p.lowStockAt}` : "OK"}</Pill></div>
                  <Button variant="outline" className="h-10" onClick={() => { setAdj(p); setDelta(""); }}>Adjust</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <FormDialog open={!!adj} onOpenChange={(o) => !o && setAdj(null)} title={`Adjust · ${adj?.name ?? ""}`} submitLabel="Apply"
        onSubmit={() => { const d = Number(delta); if (!d) return toast.error("Enter a non-zero quantity"); adjustStock(adj!.id, d); toast.success(`Stock ${d > 0 ? "increased" : "reduced"} by ${Math.abs(d)}`); setAdj(null); }}>
        <p className="text-sm text-muted-foreground">Current stock: {adj?.stock}. Use negative numbers for breakage or wastage.</p>
        <TextField label="Quantity change" type="number" value={delta} onChange={setDelta} placeholder="e.g. -2 or 12" />
      </FormDialog>
    </div>
  );
}
