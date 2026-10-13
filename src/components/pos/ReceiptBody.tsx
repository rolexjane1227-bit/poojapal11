import { Receipt } from "lucide-react";
import { useAppState } from "@/services/store";
import { BillView } from "./BillView";
import { EmptyState, Money, fmtDate, fmtTime } from "./ui";

export function ReceiptBody({ billId }: { billId: string }) {
  const s = useAppState();
  const b = s.bills.find((x) => x.id === billId);
  if (!b) return <EmptyState icon={Receipt} title="Bill not found" />;
  return (
    <BillView
      settings={s.settings}
      items={b.items}
      totals={b}
      meta={[
        { label: "Bill no.", value: `#${b.number}` },
        { label: "Date", value: `${fmtDate(b.createdAt)} ${fmtTime(b.createdAt)}` },
        { label: "Table", value: b.tableName },
        { label: "Cashier", value: b.cashierName },
      ]}
      footer={
        <div className="space-y-1 text-sm">
          {b.payments.map((p, i) => (
            <div key={i} className="flex justify-between"><span className="uppercase text-muted-foreground">Paid · {p.method}</span><Money value={p.amount} /></div>
          ))}
          {b.paymentRef && <div className="flex justify-between text-muted-foreground"><span>UPI ref</span><span className="tabular font-medium">{b.paymentRef}</span></div>}
          {b.tendered !== undefined && <div className="flex justify-between text-muted-foreground"><span>Tendered / Change</span><span className="tabular">₹{b.tendered} / ₹{b.change}</span></div>}
          <div className="mt-3 rounded-md border bg-muted/40 p-3">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Payment audit</div>
            <div className="space-y-1.5">
              {b.payments.map((p, i) => (
                <div key={i} className="flex items-center justify-between gap-2 text-xs">
                  <span className="min-w-0">
                    <span className="font-medium uppercase">{p.method}</span>
                    <span className="text-muted-foreground"> · {fmtDate(b.createdAt)} {fmtTime(b.createdAt)}</span>
                    {p.method === "upi" && b.paymentRef && (
                      <span className="block truncate text-muted-foreground">Ref: {b.paymentRef}</span>
                    )}
                  </span>
                  <Money value={p.amount} className="shrink-0" />
                </div>
              ))}
              {b.tendered !== undefined && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Cash tendered / change returned</span>
                  <span className="tabular">₹{b.tendered} / ₹{b.change}</span>
                </div>
              )}
            </div>
          </div>
          <p className="pt-2 text-center text-xs text-muted-foreground">{s.settings.receiptFooter}</p>
        </div>
      }
    />
  );
}

