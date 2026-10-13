import type { OrderItem, Settings } from "@/types";
import type { BillTotals } from "@/lib/billing";
import { Money, SummaryRow } from "./ui";

export function BillView({ settings, items, totals, meta, discountPct, footer }: {
  settings: Settings; items: OrderItem[]; totals: Pick<BillTotals, "subtotal" | "discount" | "tax" | "roundOff" | "total">;
  meta: { label: string; value: string }[]; discountPct?: number; footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b border-dashed p-5 text-center">
        <div className="text-lg font-semibold">{settings.shopName}</div>
        <div className="text-xs text-muted-foreground">{settings.address}</div>
        <div className="text-xs text-muted-foreground">Ph {settings.phone} · GSTIN {settings.gstin}</div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 border-b border-dashed px-5 py-3 text-xs">
        {meta.map((m) => (
          <div key={m.label} className="flex justify-between gap-2"><span className="text-muted-foreground">{m.label}</span><span className="font-medium">{m.value}</span></div>
        ))}
      </div>
      <div className="px-5 py-3">
        <div className="grid grid-cols-[1fr_40px_72px_80px] gap-2 pb-2 text-[11px] font-medium uppercase text-muted-foreground">
          <span>Item</span><span className="text-right">Qty</span><span className="text-right">Rate</span><span className="text-right">Amt</span>
        </div>
        {items.map((i, k) => (
          <div key={k} className="grid grid-cols-[1fr_40px_72px_80px] gap-2 py-1.5 text-sm">
            <span className="min-w-0">
              <span className="block truncate">{i.name}{i.servingMl ? ` — ${i.servingMl}ml` : ""}</span>
              {i.note && <span className="block text-[11px] italic text-muted-foreground">{i.note}</span>}
            </span>
            <span className="tabular text-right">{i.qty}</span>
            <Money value={i.price} className="text-right text-muted-foreground" />
            <Money value={i.price * i.qty} className="text-right" />
          </div>
        ))}
      </div>
      <div className="border-t border-dashed px-5 py-3">
        <SummaryRow label="Subtotal" value={<Money value={totals.subtotal} decimals={2} />} muted />
        {totals.discount > 0 && <SummaryRow label={`Discount${discountPct ? ` (${discountPct}%)` : ""}`} value={<span className="text-success">−<Money value={totals.discount} decimals={2} /></span>} />}
        <SummaryRow label={`Tax (${settings.taxRatePct}%)`} value={<Money value={totals.tax} decimals={2} />} muted />
        <SummaryRow label="Round off" value={totals.roundOff.toFixed(2)} muted />
        <div className="mt-1 border-t pt-2"><SummaryRow label="Grand total" value={<Money value={totals.total} />} strong /></div>
      </div>
      {footer && <div className="border-t border-dashed px-5 py-3">{footer}</div>}
    </div>
  );
}
