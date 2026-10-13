import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Armchair, IndianRupee, Receipt, Timer } from "lucide-react";
import { useAppState } from "@/services/store";
import { tableStatus, useCurrentUser } from "@/services/pos";
import { Money, PageHeader, StatCard } from "@/components/pos/ui";
import { TableGrid } from "@/components/pos/TableGrid";

export const Route = createFileRoute("/cashier/")({
  head: () => ({
    meta: [
      { title: "Cashier Dashboard — Pooja Palace SmartPOS" },
      { name: "description", content: "Live table status and today's shift summary for cashiers." },
      { property: "og:title", content: "Cashier Dashboard — Pooja Palace SmartPOS" },
      { property: "og:description", content: "Live table status and today's shift summary for cashiers." },
    ],
  }),
  component: CashierHome,
});

function CashierHome() {
  const s = useAppState();
  const user = useCurrentUser();
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const mine = s.bills.filter((b) => b.cashierId === user?.id && new Date(b.createdAt).toDateString() === today);
    const statuses = s.tables.map((t) => tableStatus(s, t.id));
    return {
      sales: mine.reduce((a, b) => a + b.total, 0),
      bills: mine.length,
      occupied: statuses.filter((x) => x !== "available").length,
      pending: statuses.filter((x) => x === "bill_pending").length,
    };
  }, [s, user]);

  return (
    <div>
      <PageHeader
        title={`Good ${new Date().getHours() < 17 ? "afternoon" : "evening"}, ${user?.name.split(" ")[0]}`}
        subtitle={new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
      />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="My sales today" value={<Money value={stats.sales} />} icon={IndianRupee} tone="primary" />
        <StatCard label="Bills settled" value={stats.bills} icon={Receipt} />
        <StatCard label="Active tables" value={`${stats.occupied}/${s.tables.length}`} icon={Armchair} tone="success" />
        <StatCard label="Bill pending" value={stats.pending} icon={Timer} tone="danger" />
      </div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tables</h2>
      <TableGrid showSearch={false} />
    </div>
  );
}
