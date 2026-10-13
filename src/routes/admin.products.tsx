import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/services/store";
import { delay, deleteProduct, saveProduct } from "@/services/pos";
import { EmptyState, Money, PageHeader, Pill, Segmented, SkeletonRows } from "@/components/pos/ui";
import { FormDialog, SearchInput, SelectField, TextField, meta } from "@/components/pos/FormDialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Product } from "@/types";
import { ProductThumbnail } from "@/components/pos/ProductThumbnail";

export const Route = createFileRoute("/admin/products")({
  head: () => meta("Products", "Manage menu items, prices and availability."),
  component: ProductsPage,
});

const blank = (cat: string): Product => ({ id: "", name: "", categoryId: cat, price: 0, unit: "", stock: 0, lowStockAt: 10, active: true });

function ProductsPage() {
  const s = useAppState();
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Product | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});
  useEffect(() => { delay(350).then(() => setLoading(false)); }, []);

  const list = s.products.filter((p) => (cat === "all" || p.categoryId === cat) && p.name.toLowerCase().includes(q.toLowerCase()));
  const catName = (id: string) => s.categories.find((c) => c.id === id)?.name ?? "—";

  const submit = () => {
    if (!edit) return;
    const e: Record<string, string> = {};
    if (!edit.name.trim()) e.name = "Name is required";
    if (!(edit.price > 0)) e.price = "Price must be greater than 0";
    setErr(e);
    if (Object.keys(e).length) return;
    saveProduct(edit);
    toast.success(edit.id ? "Product updated" : "Product added");
    setEdit(null);
  };

  return (
    <div>
      <PageHeader title="Products" subtitle={`${s.products.length} items on the menu`} actions={<Button className="h-11" onClick={() => { setErr({}); setEdit(blank(s.categories[0]?.id ?? "")); }}><Plus /> Add product</Button>} />
      <div className="mb-3 flex flex-col gap-2 lg:flex-row">
        <Segmented value={cat} onChange={setCat} options={[{ value: "all", label: "All" }, ...s.categories.map((c) => ({ value: c.id, label: c.name }))]} />
        <div className="lg:ml-auto"><SearchInput value={q} onChange={setQ} placeholder="Search products" /></div>
      </div>
      {loading ? <SkeletonRows /> : list.length === 0 ? (
        <EmptyState icon={Package} title="No products" description="Add your first product or change the filter." />
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="hidden grid-cols-[minmax(0,2fr)_1fr_1fr_100px_90px] gap-3 border-b bg-surface px-4 py-2.5 text-xs font-medium uppercase text-muted-foreground md:grid">
            <span>Product</span><span>Category</span><span>Unit</span><span className="text-right">Price</span><span className="text-right">Status</span>
          </div>
          <div className="divide-y">
            {list.map((p) => (
              <button key={p.id} onClick={() => { setErr({}); setEdit(p); }} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left active:bg-accent md:grid-cols-[minmax(0,2fr)_1fr_1fr_100px_90px]">
                <div className="flex min-w-0 items-center gap-3"><ProductThumbnail productId={p.id} categoryId={p.categoryId} name={p.name} className="h-11 w-11 shrink-0 rounded-md border" /><div className="min-w-0"><div className="truncate font-medium">{p.name}</div><div className="text-xs text-muted-foreground md:hidden">{catName(p.categoryId)} · {p.unit}</div></div></div>
                <span className="hidden text-sm text-muted-foreground md:block">{catName(p.categoryId)}</span>
                <span className="hidden text-sm text-muted-foreground md:block">{p.unit}</span>
                <Money value={p.price} className="text-right font-semibold" />
                <span className="hidden text-right md:block">{p.active ? <Pill tone="success">Active</Pill> : <Pill>Hidden</Pill>}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      <FormDialog
        open={!!edit}
        onOpenChange={(o) => !o && setEdit(null)}
        title={edit?.id ? "Edit product" : "New product"}
        onSubmit={submit}
        onDelete={edit?.id ? () => { if (confirm(`Delete ${edit.name}?`)) { deleteProduct(edit.id); toast.success("Product deleted"); setEdit(null); } } : undefined}
      >
        {edit && (
          <>
            <TextField label="Name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} error={err.name} placeholder="e.g. Kingfisher Premium" />
            <SelectField label="Category" value={edit.categoryId} onChange={(v) => setEdit({ ...edit, categoryId: v })} options={s.categories.map((c) => ({ value: c.id, label: c.name }))} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Price (₹)" type="number" value={edit.price || ""} onChange={(v) => setEdit({ ...edit, price: Number(v) })} error={err.price} />
              <TextField label="Unit" value={edit.unit} onChange={(v) => setEdit({ ...edit, unit: v })} placeholder="650 ml / 30 ml / Plate" />
              <TextField label="Opening stock" type="number" value={edit.stock} onChange={(v) => setEdit({ ...edit, stock: Number(v) })} />
              <TextField label="Low-stock alert at" type="number" value={edit.lowStockAt} onChange={(v) => setEdit({ ...edit, lowStockAt: Number(v) })} />
            </div>
            <p className="text-xs text-muted-foreground">Set low-stock to 0 for kitchen items that aren't stock-tracked.</p>
            <label className="flex items-center justify-between rounded-md border px-3 py-3"><span className="text-sm font-medium">Available for ordering</span><Switch checked={edit.active} onCheckedChange={(v) => setEdit({ ...edit, active: v })} /></label>
          </>
        )}
      </FormDialog>
    </div>
  );
}
