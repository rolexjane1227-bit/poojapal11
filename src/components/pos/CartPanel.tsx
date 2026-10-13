import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquarePlus, Percent, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Order, User } from "@/types";
import { calcTotals } from "@/lib/billing";
import { clearOrder, setDiscount, setNote, setQty } from "@/services/pos";
import { EmptyState, Money, QtyStepper, SummaryRow } from "./ui";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CartPanel({ tableId, order, taxRate, user }: { tableId: string; order?: Order; taxRate: number; user: User }) {
  const [noteIdx, setNoteIdx] = useState<number | null>(null);
  const [noteText, setNoteText] = useState("");
  const [discOpen, setDiscOpen] = useState(false);
  const [disc, setDisc] = useState("0");
  const items = order?.items ?? [];
  const t = calcTotals(items, order?.discountPct ?? 0, taxRate);

  if (!items.length)
    return (
      <div className="p-4">
        <EmptyState icon={ShoppingBag} title="No items yet" description="Tap products to add them to this table's order." />
      </div>
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 divide-y overflow-y-auto">
        {items.map((i, idx) => (
          <div key={idx} className="px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{i.name}{i.servingMl ? ` — ${i.servingMl}ml × ${i.qty}` : ""}</div>
                <div className="text-xs text-muted-foreground"><Money value={i.price} /> each</div>
                {i.note && <div className="mt-1 text-xs italic text-primary">“{i.note}”</div>}
              </div>
              <Money value={i.price * i.qty} className="shrink-0 text-sm font-semibold" />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <QtyStepper value={i.qty} onChange={(v) => setQty(tableId, idx, v)} />
              <div className="flex gap-1">
                <button aria-label="Add note" onClick={() => { setNoteIdx(idx); setNoteText(i.note ?? ""); }} className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground active:bg-accent">
                  <MessageSquarePlus className="h-4 w-4" />
                </button>
                <button aria-label="Remove" onClick={() => { setQty(tableId, idx, 0); toast(`${i.name} removed`); }} className="grid h-9 w-9 place-items-center rounded-md text-destructive active:bg-accent">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t bg-surface p-4">
        <SummaryRow label={`Subtotal · ${t.itemCount} items`} value={<Money value={t.subtotal} decimals={2} />} muted />
        <SummaryRow
          label={
            <button onClick={() => { setDisc(String(order?.discountPct ?? 0)); setDiscOpen(true); }} className="inline-flex items-center gap-1 text-primary">
              <Percent className="h-3.5 w-3.5" /> Discount {order?.discountPct ? `(${order.discountPct}%)` : ""}
            </button>
          }
          value={<span className="text-success">−<Money value={t.discount} decimals={2} /></span>}
        />
        <SummaryRow label={`Tax ${taxRate}%`} value={<Money value={t.tax} decimals={2} />} muted />
        <SummaryRow label="Total" value={<Money value={t.total} />} strong />
        <div className="mt-3 grid grid-cols-[auto_1fr] gap-2">
          <Button variant="outline" className="h-12" onClick={() => { if (confirm("Clear all items from this table?")) clearOrder(tableId); }}>Clear</Button>
          <Button asChild className="h-12 text-base font-semibold">
            <Link to="/cashier/bill/$tableId" params={{ tableId }}>Running bill · <Money value={t.total} /></Link>
          </Button>
        </div>
      </div>

      <Dialog open={noteIdx !== null} onOpenChange={(o) => !o && setNoteIdx(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Item note</DialogTitle></DialogHeader>
          <div className="flex flex-wrap gap-2">
            {["Less spicy", "Extra spicy", "No ice", "On the rocks", "Large peg", "Serve later"].map((n) => (
              <button key={n} onClick={() => setNoteText(n)} className="rounded-md border px-3 py-2 text-sm active:bg-accent">{n}</button>
            ))}
          </div>
          <Input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Custom note" className="h-11" />
          <DialogFooter>
            <Button className="h-11" onClick={() => { if (noteIdx !== null) setNote(tableId, noteIdx, noteText); setNoteIdx(null); }}>Save note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={discOpen} onOpenChange={setDiscOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Apply discount</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Your limit: up to {user.maxDiscountPct}%</p>
          <div className="grid grid-cols-4 gap-2">
            {[0, 5, 10, 15].map((p) => (
              <button key={p} disabled={p > user.maxDiscountPct} onClick={() => setDisc(String(p))} className="h-11 rounded-md border text-sm font-medium disabled:opacity-30 data-[on=true]:border-primary data-[on=true]:text-primary" data-on={disc === String(p)}>{p}%</button>
            ))}
          </div>
          <Input type="number" inputMode="numeric" value={disc} onChange={(e) => setDisc(e.target.value)} className="h-11" />
          <DialogFooter>
            <Button
              className="h-11"
              onClick={() => {
                const v = Number(disc);
                if (Number.isNaN(v) || v < 0) return toast.error("Enter a valid percentage");
                if (v > user.maxDiscountPct) return toast.error(`Discount above ${user.maxDiscountPct}% needs admin approval`);
                setDiscount(tableId, v);
                setDiscOpen(false);
                toast.success(v ? `${v}% discount applied` : "Discount removed");
              }}
            >Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
