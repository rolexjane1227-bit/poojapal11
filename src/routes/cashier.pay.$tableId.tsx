import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Banknote, CreditCard, Loader2, ShoppingBag, Smartphone, Split } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/services/store";
import { delay, settleBill } from "@/services/pos";
import { calcTotals, isSplitValid, splitRemaining } from "@/lib/billing";
import { EmptyState, Money, PageHeader, Panel, SummaryRow } from "@/components/pos/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PaymentMethod, PaymentSplit } from "@/types";
import { cn } from "@/lib/utils";
import { UpiPaymentCard } from "@/components/pos/UpiPaymentCard";

export const Route = createFileRoute("/cashier/pay/$tableId")({
  head: () => ({
    meta: [
      { title: "Payment — Pooja Palace SmartPOS" },
      { name: "description", content: "Settle a table bill by cash, UPI, card or split payment." },
      { property: "og:title", content: "Payment — Pooja Palace SmartPOS" },
      { property: "og:description", content: "Settle a table bill by cash, UPI, card or split payment." },
    ],
  }),
  component: PayPage,
});

type Mode = PaymentMethod | "split";
const MODES: { id: Mode; label: string; icon: typeof Banknote }[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "split", label: "Split", icon: Split },
];

function PayPage() {
  const { tableId } = Route.useParams();
  const s = useAppState();
  const navigate = useNavigate();
  const order = s.orders[tableId];
  const table = s.tables.find((t) => t.id === tableId);
  const [mode, setMode] = useState<Mode>("cash");
  const [tendered, setTendered] = useState("");
  const [ref, setRef] = useState("");
  const [splits, setSplits] = useState<PaymentSplit[]>([
    { method: "cash", amount: 0 }, { method: "upi", amount: 0 }, { method: "card", amount: 0 },
  ]);
  const [busy, setBusy] = useState(false);

  if (!order || !table)
    return <EmptyState icon={ShoppingBag} title="Nothing to pay" description="This table has no open bill." action={<Button asChild><Link to="/cashier/tables">Back to tables</Link></Button>} />;

  const t = calcTotals(order.items, order.discountPct, s.settings.taxRatePct);
  const cash = Number(tendered) || 0;
  const change = Math.max(0, cash - t.total);
  const remaining = splitRemaining(t.total, splits);
  const quick = Array.from(new Set([t.total, Math.ceil(t.total / 100) * 100, Math.ceil(t.total / 500) * 500, Math.ceil(t.total / 2000) * 2000]));

  const upiRef = ref.trim();
  const canPay =
    mode === "cash" ? cash >= t.total
    : mode === "split" ? isSplitValid(t.total, splits)
    : true;

  const pay = async () => {
    if (!canPay)
      return toast.error(
        mode === "cash" ? "Cash received is less than total"
        : `Split must equal total (₹${remaining} remaining)`,
      );
    setBusy(true);
    await delay(700);
    try {
      const payments = mode === "split" ? splits : [{ method: mode, amount: t.total }];
      const bill = settleBill(tableId, payments, mode === "cash" ? cash : undefined, upiRef || undefined);
      toast.success(`Bill #${bill.number} settled · ${table.name} is now available`);
      navigate({ to: "/cashier/receipt/$billId", params: { billId: bill.id } });
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`Payment · ${table.name}`}
        subtitle={`Bill #${s.nextBillNumber}`}
        actions={<Button variant="outline" size="icon" asChild className="h-10 w-10"><Link to="/cashier/bill/$tableId" params={{ tableId }} aria-label="Back"><ArrowLeft /></Link></Button>}
      />
      <div className="mb-4 rounded-lg border border-primary/40 bg-primary/5 p-5 text-center">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Amount due</div>
        <Money value={t.total} className="mt-1 block text-4xl font-semibold text-primary" />
        <div className="mt-1 text-xs text-muted-foreground">{t.itemCount} items · incl. tax {t.tax.toFixed(2)}{t.discount > 0 && ` · saved ${t.discount.toFixed(2)}`}</div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => setMode(m.id)} className={cn("flex h-20 flex-col items-center justify-center gap-1.5 rounded-lg border-2 bg-card text-sm font-medium", mode === m.id ? "border-primary text-primary" : "text-muted-foreground")}>
            <m.icon className="h-6 w-6" />{m.label}
          </button>
        ))}
      </div>

      <Panel>
        {mode === "cash" && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Cash received</label>
            <Input autoFocus type="number" inputMode="numeric" value={tendered} onChange={(e) => setTendered(e.target.value)} placeholder="0" className="tabular h-14 text-2xl font-semibold" />
            <div className="grid grid-cols-4 gap-2">
              {quick.map((q) => <button key={q} onClick={() => setTendered(String(q))} className="h-11 rounded-md border text-sm font-medium active:bg-accent"><Money value={q} /></button>)}
            </div>
            <div className="rounded-md bg-surface p-3"><SummaryRow label="Change to return" value={<Money value={change} />} strong /></div>
          </div>
        )}
        {(mode === "upi" || mode === "card") && (
          <div className="space-y-3">
            {mode === "upi" && <UpiPaymentCard amount={t.total} billNumber={s.nextBillNumber} payeeName={s.settings.shopName} upiId={s.settings.upiId} />}
            <p className="text-sm text-muted-foreground">{mode === "upi" ? "Confirm the payment in your UPI app before completing the bill." : "Swipe or tap the card on the terminal, then confirm approval."}</p>
            <label className="text-sm font-medium">
              {mode === "upi" ? "UPI transaction reference (optional)" : "Approval code (optional)"}
            </label>
            <Input value={ref} onChange={(e) => setRef(e.target.value)} className="h-12" placeholder={mode === "upi" ? "e.g. 4271 9932 1180" : "e.g. 083921"} />
            {mode === "upi" && (
              <p className="text-xs text-muted-foreground">
                Ask the customer for the UTR / transaction ID shown in their UPI app after payment. It is saved on the bill for reconciliation.
              </p>
            )}
          </div>
        )}
        {mode === "split" && (
          <div className="space-y-3">
            {splits.map((sp, i) => (
              <div key={sp.method} className="grid grid-cols-[80px_1fr_auto] items-center gap-2">
                <span className="text-sm font-medium uppercase">{sp.method}</span>
                <Input type="number" inputMode="numeric" value={sp.amount || ""} onChange={(e) => setSplits(splits.map((x, k) => (k === i ? { ...x, amount: Number(e.target.value) || 0 } : x)))} className="tabular h-12 text-lg" placeholder="0" />
                <Button variant="outline" className="h-12" onClick={() => setSplits(splits.map((x, k) => (k === i ? { ...x, amount: x.amount + Math.max(0, remaining) } : x)))}>Rest</Button>
              </div>
            ))}
            <div className={cn("rounded-md p-3 text-sm font-medium", Math.abs(remaining) < 0.01 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
              {Math.abs(remaining) < 0.01 ? "Split matches total" : remaining > 0 ? `₹${remaining} remaining` : `₹${-remaining} over total`}
            </div>
            {splits.some((sp) => sp.method === "upi" && sp.amount > 0) && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium">UPI transaction reference (optional)</label>
                <Input value={ref} onChange={(e) => setRef(e.target.value)} className="h-12" placeholder="e.g. 4271 9932 1180" />
              </div>
            )}
          </div>
        )}
      </Panel>

      <div className="sticky bottom-16 mt-4 bg-background py-3 md:bottom-0">
        <Button className="h-14 w-full text-base font-semibold" disabled={busy || !canPay} onClick={pay}>
          {busy ? <Loader2 className="animate-spin" /> : null}
          {busy ? "Processing…" : <>Confirm payment · <Money value={t.total} /></>}
        </Button>
      </div>
    </div>
  );
}
