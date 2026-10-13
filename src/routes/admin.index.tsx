import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { AlertTriangle, Armchair, IndianRupee, Receipt, TrendingUp } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useAppState } from "@/services/store";
import { tableStatus } from "@/services/pos";
import { CHART_COLORS, dailySeries, lowStock, paymentBreakdown, sameDay, topProducts } from "@/lib/analytics";
import { formatINR } from "@/lib/billing";
import { Money, PageHeader, Panel, Pill, StatCard, StatusBadge } from "@/components/pos/ui";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Pooja Palace SmartPOS" },
      { name: "description", content: "Daily sales, live tables, payments and stock alerts." },
      { property: "og:title", content: "Admin Dashboard — Pooja Palace SmartPOS" },
      { property: "og:description", content: "Daily sales, live tables, payments and stock alerts." },
    ],
  }),
  component: AdminHome,
});

const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }, cursor: { fill: "var(--accent)" } };

function AdminHome() {
  const s = useAppState();
  const d = useMemo(() => {
    const now = new Date();
    const y = new Date(); y.setDate(y.getDate() - 1);
    const today = s.bills.filter((b) => sameDay(b.createdAt, now));
    const yest = s.bills.filter((b) => sameDay(b.createdAt, y));
    const sales = today.reduce((a, b) => a + b.total, 0);
    const ySales = yest.reduce((a, b) => a + b.total, 0);
    const active = s.tables.filter((t) => tableStatus(s, t.id) !== "available").length;
    const expensesToday = s.expenses.filter((e) => e.date === now.toISOString().slice(0, 10)).reduce((a, e) => a + e.amount, 0);
    return {
      sales, orders: today.length, active, avg: today.length ? sales / today.length : 0,
      change: ySales ? ((sales - ySales) / ySales) * 100 : 0,
      series: dailySeries(s.bills, 7), pay: paymentBreakdown(today), top: topProducts(today, 5), low: lowStock(s), expensesToday,
    };
  }, [s]);
  const payTotal = d.pay.reduce((a, p) => a + p.value, 0) || 1;

  return (
    <div className="space-y-4">
      <PageHeader title="Dashboard" subtitle={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Today's sales" value={<Money value={d.sales} />} icon={IndianRupee} tone="primary"
          hint={<span className={d.change >= 0 ? "text-success" : "text-destructive"}>{d.change >= 0 ? "▲" : "▼"} {Math.abs(d.change).toFixed(1)}% vs yesterday</span>} />
        <StatCard label="Orders" value={d.orders} icon={Receipt} hint={`Avg bill ${formatINR(d.avg)}`} />
        <StatCard label="Active tables" value={`${d.active}/${s.tables.length}`} icon={Armchair} tone="success" hint={`${Object.values(s.orders).filter((o) => o.billRequested).length} bill pending`} />
        <StatCard label="Low stock" value={d.low.length} icon={AlertTriangle} tone="danger" hint={`Expenses today ${formatINR(d.expensesToday)}`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Sales · last 7 days" className="lg:col-span-2" action={<Link to="/admin/reports" className="text-xs text-primary">Reports</Link>}>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={d.series}>
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={36} />
                <Tooltip {...tip} formatter={(v: number) => formatINR(v)} />
                <Bar dataKey="sales" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Payments today">
          <div className="h-40">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={d.pay} dataKey="value" innerRadius={44} outerRadius={70} paddingAngle={2} stroke="none">
                  {d.pay.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
                </Pie>
                <Tooltip {...tip} formatter={(v: number) => formatINR(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {d.pay.map((p, i) => (
              <div key={p.key} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART_COLORS[i] }} />{p.name}</span>
                <span className="tabular"><Money value={p.value} /> <span className="text-muted-foreground">· {Math.round((p.value / payTotal) * 100)}%</span></span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Top products today">
          {d.top.length === 0 ? <p className="text-sm text-muted-foreground">No sales yet today.</p> : (
            <div className="space-y-3">
              {d.top.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="tabular grid h-7 w-7 shrink-0 place-items-center rounded-md bg-muted text-xs font-semibold">{i + 1}</span>
                  <div className="min-w-0 flex-1"><div className="truncate text-sm font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.qty} sold</div></div>
                  <Money value={p.revenue} className="text-sm font-semibold" />
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Low-stock alerts" action={<Link to="/admin/inventory" className="text-xs text-primary">Inventory</Link>}>
          {d.low.length === 0 ? <p className="text-sm text-muted-foreground">All stock levels healthy.</p> : (
            <div className="space-y-2.5">
              {d.low.slice(0, 6).map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{p.name} <span className="text-muted-foreground">· {p.unit}</span></span>
                  <Pill tone={p.stock === 0 ? "danger" : "primary"}>{p.stock} left</Pill>
                </div>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Live tables" action={<Link to="/admin/tables" className="text-xs text-primary">Manage</Link>}>
          <div className="grid grid-cols-4 gap-2">
            {s.tables.map((t) => {
              const st = tableStatus(s, t.id);
              return (
                <div key={t.id} title={t.name} className="rounded-md border bg-surface p-2 text-center">
                  <div className="text-sm font-semibold">{t.name}</div>
                  <span className={`mx-auto mt-1 block h-1.5 w-6 rounded-full ${st === "available" ? "bg-success" : st === "occupied" ? "bg-primary" : "bg-destructive"}`} />
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2"><StatusBadge status="available" /><StatusBadge status="occupied" /><StatusBadge status="bill_pending" /></div>
        </Panel>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="h-3.5 w-3.5" /> Figures update live as cashiers settle bills.</div>
    </div>
  );
}
