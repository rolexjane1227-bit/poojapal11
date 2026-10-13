import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, FileText, Pencil, Printer, ShoppingBag, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/services/store";
import { requestBill, tableStatus } from "@/services/pos";
import { calcTotals } from "@/lib/billing";
import { BillView } from "@/components/pos/BillView";
import { EmptyState, PageHeader, StatusBadge, elapsed, fmtTime } from "@/components/pos/ui";
import { Button } from "@/components/ui/button";
import { UpiPaymentCard } from "@/components/pos/UpiPaymentCard";

export const Route = createFileRoute("/cashier/bill/$tableId")({
  head: () => ({
    meta: [
      { title: "Bill — Pooja Palace SmartPOS" },
      { name: "description", content: "Running and final bill for a table." },
      { property: "og:title", content: "Bill — Pooja Palace SmartPOS" },
      { property: "og:description", content: "Running and final bill for a table." },
    ],
  }),
  component: BillPage,
});

function BillPage() {
  const { tableId } = Route.useParams();
  const s = useAppState();
  const navigate = useNavigate();
  const table = s.tables.find((t) => t.id === tableId);
  const order = s.orders[tableId];
  if (!table || !order)
    return <EmptyState icon={ShoppingBag} title="No open order" description="This table has no running bill." action={<Button asChild><Link to="/cashier/tables">Back to tables</Link></Button>} />;

  const t = calcTotals(order.items, order.discountPct, s.settings.taxRatePct);
  const final = order.billRequested;
  const cashier = s.users.find((u) => u.id === order.cashierId);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={`${final ? "Final bill" : "Running bill"} · ${table.name}`}
        subtitle={`Opened ${fmtTime(order.openedAt)} · ${elapsed(order.openedAt)} ago`}
        actions={<Button variant="outline" size="icon" asChild className="h-10 w-10"><Link to="/cashier/tables" aria-label="Back"><ArrowLeft /></Link></Button>}
      />
      <div className="mb-3"><StatusBadge status={tableStatus(s, tableId)} /></div>
      <BillView
        settings={s.settings}
        items={order.items}
        totals={t}
        discountPct={order.discountPct}
        meta={[
          { label: "Table", value: `${table.name} (${table.area})` },
          { label: "Guests", value: String(order.guests) },
          { label: "Cashier", value: cashier?.name ?? "—" },
          { label: "Bill", value: final ? `#${s.nextBillNumber}` : "Draft" },
        ]}
      />
      {final && (
        <div className="mt-4">
          <UpiPaymentCard amount={t.total} billNumber={s.nextBillNumber} payeeName={s.settings.shopName} upiId={s.settings.upiId} />
        </div>
      )}
      <div className="sticky bottom-16 mt-4 grid grid-cols-2 gap-2 bg-background py-3 md:bottom-0">
        {final ? (
          <>
            <Button variant="outline" className="h-12" onClick={() => { requestBill(tableId, false); toast("Bill reopened for editing"); }}><Undo2 /> Reopen</Button>
            <Button className="h-12 text-base font-semibold" onClick={() => navigate({ to: "/cashier/pay/$tableId", params: { tableId } })}>Take payment</Button>
            <Button variant="ghost" className="col-span-2 h-11" onClick={() => toast.success("Sent to printer")}><Printer /> Print bill</Button>
          </>
        ) : (
          <>
            <Button variant="outline" className="h-12" asChild><Link to="/cashier/order/$tableId" params={{ tableId }}><Pencil /> Edit order</Link></Button>
            <Button className="h-12 text-base font-semibold" onClick={() => { requestBill(tableId); toast.success(`Final bill generated for ${table.name}`); }}><FileText /> Generate final bill</Button>
          </>
        )}
      </div>
    </div>
  );
}
