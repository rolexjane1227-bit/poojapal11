import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, ShoppingCart } from "lucide-react";
import { useAppState } from "@/services/store";
import { addItem, tableStatus, useCurrentUser } from "@/services/pos";
import { calcTotals } from "@/lib/billing";
import { Money, StatusBadge, EmptyState } from "@/components/pos/ui";
import { CartPanel } from "@/components/pos/CartPanel";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { ProductThumbnail } from "@/components/pos/ProductThumbnail";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/cashier/order/$tableId")({
  head: () => ({
    meta: [
      { title: "Order — Pooja Palace SmartPOS" },
      { name: "description", content: "Add drinks and food to a table order." },
      { property: "og:title", content: "Order — Pooja Palace SmartPOS" },
      { property: "og:description", content: "Add drinks and food to a table order." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { tableId } = Route.useParams();
  const s = useAppState();
  const user = useCurrentUser()!;
  const table = s.tables.find((t) => t.id === tableId);
  const order = s.orders[tableId];
  const cats = [...s.categories].sort((a, b) => a.sortOrder - b.sortOrder);
  const [cat, setCat] = useState(cats[0]?.id ?? "");
  const [q, setQ] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [sizeProduct, setSizeProduct] = useState<Product | null>(null);

  const list = useMemo(
    () => s.products.filter((p) => p.active && (q ? p.name.toLowerCase().includes(q.toLowerCase()) : p.categoryId === cat)),
    [s.products, cat, q],
  );
  const qtyIn = (pid: string) => order?.items.filter((i) => i.productId === pid).reduce((a, i) => a + i.qty, 0) ?? 0;
  const add = (product: Product, serving?: { ml: number; price: number }) => {
    addItem(tableId, product, serving);
    setFlash(product.id);
    setTimeout(() => setFlash(null), 250);
    setSizeProduct(null);
  };
  const t = calcTotals(order?.items ?? [], order?.discountPct ?? 0, s.settings.taxRatePct);

  if (!table) return <EmptyState icon={Search} title="Table not found" action={<Link to="/cashier/tables" className="text-primary">Back to tables</Link>} />;

  return (
    <div className="-mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:grid lg:h-[calc(100vh)] lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex min-w-0 flex-col lg:overflow-hidden">
        <div className="sticky top-14 z-20 border-b bg-background px-4 py-3 md:top-0 md:px-6">
          <div className="flex items-center gap-3">
            <Link to="/cashier/tables" aria-label="Back" className="grid h-10 w-10 shrink-0 place-items-center rounded-md border"><ArrowLeft className="h-4 w-4" /></Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2"><span className="text-lg font-semibold">Table {table.name}</span><StatusBadge status={tableStatus(s, tableId)} /></div>
              <div className="text-xs text-muted-foreground">{table.area} · {table.seats} seats</div>
            </div>
            <div className="relative w-40 sm:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search items" className="h-10 pl-9" />
            </div>
          </div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {cats.map((c) => (
              <button
                key={c.id}
                onClick={() => { setCat(c.id); setQ(""); }}
                className={cn("h-11 shrink-0 rounded-md border px-4 text-sm font-medium", cat === c.id && !q ? "border-primary bg-primary text-primary-foreground" : "bg-card text-muted-foreground")}
              >{c.name}</button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 md:px-6 lg:pb-6">
          {list.length === 0 ? (
            <EmptyState icon={Search} title="No items found" description={q ? `Nothing matches “${q}”.` : "This category has no active products."} />
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-4">
              {list.map((p) => {
                const n = qtyIn(p.id);
                const out = p.lowStockAt > 0 && p.stock <= 0;
                return (
                  <button
                    key={p.id}
                    disabled={out}
                    onClick={() => p.servingSizes?.length ? setSizeProduct(p) : add(p)}
                    className={cn(
                      "relative flex min-h-[172px] flex-col overflow-hidden rounded-lg border bg-card text-left transition-colors active:bg-accent disabled:opacity-40",
                      n > 0 && "border-primary/60",
                      flash === p.id && "bg-primary/10",
                    )}
                  >
                    <ProductThumbnail productId={p.id} categoryId={p.categoryId} name={p.name} className="h-24 w-full border-b" />
                    {n > 0 && <span className="tabular absolute right-2 top-2 grid h-6 min-w-6 place-items-center rounded-md bg-primary px-1.5 text-xs font-bold text-primary-foreground">{n}</span>}
                    <span className="p-3 pb-0 text-sm font-medium leading-snug">{p.name}</span>
                    <span className="px-3 text-[11px] text-muted-foreground">{p.servingSizes?.length ? "Choose serving" : p.unit}</span>
                    <span className="mt-auto flex items-end justify-between px-3 pb-3 pt-2">
                      <span className="font-semibold text-primary">{p.servingSizes?.length ? "From " : ""}<Money value={Math.min(...(p.servingSizes?.map((size) => size.price) ?? [p.price]))} /></span>
                      {p.lowStockAt > 0 && <span className={cn("text-[10px]", p.stock <= p.lowStockAt ? "text-destructive" : "text-muted-foreground")}>{out ? "Out" : `${p.stock} left`}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <aside className="hidden flex-col border-l bg-card lg:flex">
        <div className="border-b px-4 py-3.5">
          <div className="text-sm font-semibold">Current order</div>
          <div className="text-xs text-muted-foreground">{order ? `${t.itemCount} items · Guests ${order.guests}` : "Empty"}</div>
        </div>
        <div className="min-h-0 flex-1"><CartPanel tableId={tableId} order={order} taxRate={s.settings.taxRatePct} user={user} /></div>
      </aside>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t bg-sidebar p-3 md:bottom-0 lg:hidden">
        <button onClick={() => setCartOpen(true)} className="flex h-12 w-full items-center justify-between rounded-md bg-primary px-4 font-semibold text-primary-foreground">
          <span className="flex items-center gap-2"><ShoppingCart className="h-5 w-5" /> {t.itemCount} items</span>
          <span>View cart · <Money value={t.total} /></span>
        </button>
      </div>
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent side="bottom" className="flex h-[85vh] flex-col p-0">
          <SheetHeader className="border-b px-4 py-3"><SheetTitle>Table {table.name} · Order</SheetTitle></SheetHeader>
          <div className="min-h-0 flex-1"><CartPanel tableId={tableId} order={order} taxRate={s.settings.taxRatePct} user={user} /></div>
        </SheetContent>
      </Sheet>
      <Dialog open={sizeProduct !== null} onOpenChange={(open) => !open && setSizeProduct(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{sizeProduct?.name} · Select serving</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {sizeProduct?.servingSizes?.map((size) => (
              <button
                key={size.ml}
                type="button"
                onClick={() => add(sizeProduct, size)}
                className="flex h-16 items-center justify-between rounded-md border bg-surface px-4 text-left active:border-primary active:bg-primary/10"
              >
                <span className="text-base font-semibold">{size.ml}ml</span>
                <Money value={size.price} className="text-sm font-semibold text-primary" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
