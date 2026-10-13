import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAppState } from "@/services/store";
import { categorySales, dailySeries, paymentBreakdown, topProducts } from "@/lib/analytics";
import { formatINR } from "@/lib/billing";
import { Money, PageHeader, Panel, Segmented, StatCard } from "@/components/pos/ui";
import { meta } from "@/components/pos/FormDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/reports")({
  head: () => meta("Reports", "Sales trends by day, category and payment method."),
  component: Page,
});

const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }, cursor: { fill: "var(--accent)" } };

function Page() {
  const s = useAppState();
  const [days, setDays] = useState<"7" | "14">("7");
  const d = useMemo(() => {
    const n = Number(days);
    const cutoff = new Date(); cutoff.setHours(0, 0, 0, 0); cutoff.setDate(cutoff.getDate() - (n - 1));
    const bills = s.bills.filter((b) => new Date(b.createdAt) >= cutoff);
    const sales = bills.reduce((a, b) => a + b.total, 0);
    const exp = s.expenses.filter((e) => new Date(e.date) >= cutoff).reduce((a, e) => a + e.amount, 0);
    return {
      bills, sales, exp, tax: bills.reduce((a, b) => a + b.tax, 0), disc: bills.reduce((a, b) => a + b.discount, 0),
      series: dailySeries(s.bills, n), cats: categorySales(s, bills).sort((a, b) => b.value - a.value), pay: paymentBreakdown(bills), top: topProducts(bills, 10),
    };
  }, [s, days]);

  const exportCsv = () => {
    const rows = [["Bill", "Date", "Table", "Cashier", "Subtotal", "Discount", "Tax", "Total", "Payment"], ...d.bills.map((b) => [b.number, b.createdAt, b.tableName, b.cashierName, b.subtotal, b.discount, b.tax, b.total, b.payments.map((p) => p.method).join("+")])];
    const blob = new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `pooja-palace-sales-${days}d.csv`; a.click();
    toast.success("Report exported");
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Reports" actions={<><Segmented value={days} onChange={setDays} options={[{ value: "7", label: "7 days" }, { value: "14", label: "14 days" }]} /><Button variant="outline" className="h-11" onClick={exportCsv}><Download /> CSV</Button></>} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Gross sales" value={<Money value={d.sales} />} tone="primary" hint={`${d.bills.length} bills`} />
        <StatCard label="Avg bill" value={<Money value={d.bills.length ? d.sales / d.bills.length : 0} />} />
        <StatCard label="Tax collected" value={<Money value={d.tax} />} hint={<>Discounts <Money value={d.disc} /></>} />
        <StatCard label="Net after expenses" value={<Money value={d.sales - d.exp} />} tone="success" hint={<>Expenses <Money value={d.exp} /></>} />
      </div>
      <Panel title="Daily sales">
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={d.series}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={36} />
              <Tooltip {...tip} formatter={(v: number) => formatINR(v)} />
              <Line dataKey="sales" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Sales by category">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={d.cats} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={90} />
                <Tooltip {...tip} formatter={(v: number) => formatINR(v)} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Payment methods">
          <div className="space-y-4 pt-2">
            {d.pay.map((p) => {
              const pct = d.sales ? (p.value / d.sales) * 100 : 0;
              return (
                <div key={p.key}>
                  <div className="mb-1.5 flex justify-between text-sm"><span>{p.name}</span><span className="tabular"><Money value={p.value} /> · {pct.toFixed(0)}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} /></div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
      <Panel title="Top 10 products">
        <div className="divide-y">
          {d.top.map((p, i) => (
            <div key={p.name} className="grid grid-cols-[28px_minmax(0,1fr)_60px_90px] items-center gap-2 py-2 text-sm">
              <span className="text-muted-foreground">{i + 1}</span><span className="truncate">{p.name}</span><span className="tabular text-right text-muted-foreground">{p.qty}</span><Money value={p.revenue} className="text-right font-medium" />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
