import { useMemo, useState } from "react";
import { Download, Printer, Receipt, Search } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/services/store";
import { EmptyState, Money, Pill, Segmented, fmtDate, fmtTime } from "./ui";
import { ReceiptBody } from "./ReceiptBody";
import { billsToCsv, csvFileName, downloadCsv } from "@/lib/csv";
import { printBills } from "@/lib/print";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

type Range = "today" | "7d" | "30d" | "custom" | "all";
type Method = "all" | "cash" | "upi" | "card" | "split";

export function BillHistory({ cashierId }: { cashierId?: string }) {
  const s = useAppState();
  const [range, setRange] = useState<Range>("today");
  const [method, setMethod] = useState<Method>("all");
  const [cashier, setCashier] = useState("all");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const list = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const fromTs = from ? new Date(`${from}T00:00:00`).getTime() : -Infinity;
    const toTs = to ? new Date(`${to}T23:59:59.999`).getTime() : Infinity;
    return s.bills.filter((b) => {
      const created = new Date(b.createdAt);
      const age = now.getTime() - created.getTime();
      if (range === "today" && created.toDateString() !== todayStr) return false;
      if (range === "7d" && age > 7 * 864e5) return false;
      if (range === "30d" && age > 30 * 864e5) return false;
      if (range === "custom" && (created.getTime() < fromTs || created.getTime() > toTs)) return false;
      if (cashierId && b.cashierId !== cashierId) return false;
      if (cashier !== "all" && b.cashierId !== cashier) return false;
      const m = b.payments.length > 1 ? "split" : b.payments[0]?.method;
      if (method !== "all" && m !== method) return false;
      if (q) {
        const hay = `${b.number} ${b.tableName} ${b.cashierName} ${b.paymentRef ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
  }, [s.bills, range, method, cashier, cashierId, q, from, to]);
  const total = list.reduce((a, b) => a + b.total, 0);

  const exportCsv = () => {
    if (list.length === 0) return;
    try {
      downloadCsv(csvFileName(), billsToCsv(list));
      toast.success(`Exported ${list.length} bill${list.length === 1 ? "" : "s"} to CSV`);
    } catch {
      toast.error("Could not export the CSV. Please try again.");
    }
  };

  const printList = () => {
    if (list.length === 0) return;
    const rangeLabel = range === "custom" ? `${from || "…"} to ${to || "…"}` : range === "all" ? "All time" : range === "today" ? "Today" : `Last ${range}`;
    const summary = `${rangeLabel} · ${method === "all" ? "All payments" : method.toUpperCase()}${q ? ` · Search “${q}”` : ""}`;
    if (!printBills(list, s.settings.shopName, summary)) {
      toast.error("Your browser blocked the print window. Please allow pop-ups for this site.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row">
        <Segmented<Range> value={range} onChange={setRange} options={[{ value: "today", label: "Today" }, { value: "7d", label: "7 days" }, { value: "30d", label: "30 days" }, { value: "custom", label: "Custom" }, { value: "all", label: "All" }]} />
        {range === "custom" && (
          <div className="flex items-center gap-2">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" className="h-11 w-36" />
            <span className="text-xs text-muted-foreground">to</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" className="h-11 w-36" />
          </div>
        )}
        <select value={method} onChange={(e) => setMethod(e.target.value as Method)} className="h-11 rounded-md border bg-surface px-3 text-sm">
          <option value="all">All payments</option><option value="cash">Cash</option><option value="upi">UPI</option><option value="card">Card</option><option value="split">Split</option>
        </select>
        {!cashierId && (
          <select value={cashier} onChange={(e) => setCashier(e.target.value)} className="h-11 rounded-md border bg-surface px-3 text-sm">
            <option value="all">All cashiers</option>
            {s.users.filter((u) => u.role === "cashier").map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        )}
        <div className="relative lg:ml-auto lg:w-56">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bill no., table or UPI ref" className="h-11 pl-9" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-surface px-4 py-2.5 text-sm">
        <span className="text-muted-foreground">{list.length} bill{list.length === 1 ? "" : "s"}</span>
        <div className="flex items-center gap-3">
          <span className="font-semibold"><Money value={total} /></span>
          <Button variant="outline" size="sm" onClick={printList} disabled={list.length === 0} className="h-9 gap-1.5">
            <Printer className="h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={list.length === 0} className="h-9 gap-1.5">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={Receipt} title="No bills found" description="Bills settled in this period will appear here." />
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {list.slice(0, 150).map((b) => {
            const m = b.payments.length > 1 ? "split" : b.payments[0]?.method;
            return (
              <button key={b.id} onClick={() => setOpen(b.id)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left active:bg-accent">
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="font-medium">#{b.number}</span><span className="text-sm text-muted-foreground">Table {b.tableName}</span></div>
                  <div className="truncate text-xs text-muted-foreground">{fmtDate(b.createdAt)} · {fmtTime(b.createdAt)} · {b.cashierName} · {b.items.length} items</div>
                </div>
                <div className="text-right">
                  <Money value={b.total} className="block font-semibold" />
                  <Pill tone={m === "cash" ? "success" : m === "split" ? "primary" : "default"}>{m?.toUpperCase()}</Pill>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <Sheet open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader><SheetTitle>Bill details</SheetTitle></SheetHeader>
          <div className="mt-4">{open && <ReceiptBody billId={open} />}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
