import type { Bill } from "@/types";

const esc = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const inr = (n: number) => `₹${n.toFixed(2)}`;

const fmtDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
};

export function billMethodLabel(b: Bill): string {
  if (b.payments.length > 1) return "Split";
  const m = b.payments[0]?.method;
  return m ? m.toUpperCase() : "—";
}

/** Opens a compact, printer-friendly report of the given bills and triggers printing. */
export function printBills(bills: Bill[], shopName: string, filterSummary: string): boolean {
  const total = bills.reduce((a, b) => a + b.total, 0);
  const rows = bills
    .map((b) => {
      const ref = b.paymentRef ? `<div class="ref">Ref: ${esc(b.paymentRef)}</div>` : "";
      return `<tr>
        <td>#${b.number}</td>
        <td>${fmtDateTime(b.createdAt)}</td>
        <td>${esc(b.tableName)}</td>
        <td>${esc(b.cashierName)}</td>
        <td>${billMethodLabel(b)}${ref}</td>
        <td class="num">${inr(b.total)}</td>
      </tr>`;
    })
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(shopName)} — Bill report</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: ui-sans-serif, system-ui, sans-serif; color: #111; padding: 16px; font-size: 11px; }
  h1 { font-size: 15px; }
  .sub { color: #555; margin: 2px 0 10px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { text-align: left; padding: 4px 6px; border-bottom: 1px solid #ddd; vertical-align: top; }
  th { font-size: 10px; text-transform: uppercase; letter-spacing: .04em; color: #555; border-bottom: 1.5px solid #333; }
  .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .ref { font-size: 10px; color: #555; }
  tfoot td { border-top: 1.5px solid #333; border-bottom: none; font-weight: 700; padding-top: 6px; }
  @page { margin: 12mm; }
</style></head><body>
  <h1>${esc(shopName)} — Bill report</h1>
  <div class="sub">${esc(filterSummary)} · ${bills.length} bill${bills.length === 1 ? "" : "s"} · Printed ${fmtDateTime(new Date().toISOString())}</div>
  <table>
    <thead><tr><th>Bill</th><th>Date &amp; time</th><th>Table</th><th>Cashier</th><th>Payment</th><th class="num">Amount</th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr><td colspan="5">Total</td><td class="num">${inr(total)}</td></tr></tfoot>
  </table>
  <script>window.onload = () => { window.print(); };<\/script>
</body></html>`;

  const win = window.open("", "_blank", "width=800,height=600");
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  return true;
}
