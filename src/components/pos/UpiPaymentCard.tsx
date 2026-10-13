import { Copy, ExternalLink, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { formatINR } from "@/lib/billing";
import { Button } from "@/components/ui/button";

export function UpiPaymentCard({ amount, billNumber, payeeName, upiId }: {
  amount: number;
  billNumber: number;
  payeeName: string;
  upiId: string;
}) {
  const upiUrl = `upi://pay?${new URLSearchParams({
    pa: upiId,
    pn: payeeName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: `Bill ${billNumber}`,
  }).toString()}`;

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      toast.success("UPI ID copied");
    } catch {
      toast.error("Could not copy UPI ID");
    }
  };

  return (
    <div className="grid gap-4 rounded-lg border border-primary/40 bg-primary/5 p-4 sm:grid-cols-[176px_1fr] sm:items-center">
      <div className="mx-auto rounded-lg bg-foreground p-3 shadow-sm">
        <QRCodeSVG value={upiUrl} size={152} level="M" title={`Pay ${formatINR(amount)} by UPI`} />
      </div>
      <div className="text-center sm:text-left">
        <div className="flex items-center justify-center gap-2 text-primary sm:justify-start">
          <QrCode className="h-5 w-5" />
          <span className="text-sm font-semibold">Scan to pay exact amount</span>
        </div>
        <div className="mt-1 text-3xl font-semibold tabular">{formatINR(amount)}</div>
        <p className="mt-1 text-xs text-muted-foreground">Bill #{billNumber} · Opens with the amount already filled</p>
        <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
          <Button variant="outline" className="h-11 min-w-0" onClick={copyUpiId}>
            <Copy /> <span className="truncate">{upiId}</span>
          </Button>
          <Button className="h-11" asChild>
            <a href={upiUrl}><ExternalLink /> Pay in UPI app</a>
          </Button>
        </div>
      </div>
    </div>
  );
}