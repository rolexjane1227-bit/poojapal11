import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Printer, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/services/store";
import { ReceiptBody } from "@/components/pos/ReceiptBody";
import { Money } from "@/components/pos/ui";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cashier/receipt/$billId")({
  head: () => ({
    meta: [
      { title: "Bill Completed — Pooja Palace SmartPOS" },
      { name: "description", content: "Settled bill receipt." },
      { property: "og:title", content: "Bill Completed — Pooja Palace SmartPOS" },
      { property: "og:description", content: "Settled bill receipt." },
    ],
  }),
  component: ReceiptPage,
});

function ReceiptPage() {
  const { billId } = Route.useParams();
  const s = useAppState();
  const b = s.bills.find((x) => x.id === billId);
  return (
    <div className="mx-auto max-w-2xl">
      {b && (
        <div className="mb-4 flex items-center gap-3 rounded-lg border border-success/40 bg-success/10 p-4">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-success" />
          <div>
            <div className="font-semibold">Payment received · <Money value={b.total} /></div>
            <div className="text-sm text-muted-foreground">Table {b.tableName} is closed and available.</div>
          </div>
        </div>
      )}
      <ReceiptBody billId={billId} />
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" className="h-12" onClick={() => toast.success("Sent to printer")}><Printer /> Print</Button>
        <Button className="h-12 font-semibold" asChild><Link to="/cashier/tables">New order</Link></Button>
      </div>
    </div>
  );
}
