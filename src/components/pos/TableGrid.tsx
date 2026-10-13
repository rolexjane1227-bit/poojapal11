import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Search, Users } from "lucide-react";
import tableImg from "@/assets/table-lounge.jpg";
import { useAppState } from "@/services/store";
import { tableStatus } from "@/services/pos";
import { calcTotals } from "@/lib/billing";
import { Money, Segmented, StatusBadge, elapsed, statusMeta, EmptyState } from "./ui";
import { Input } from "@/components/ui/input";
import type { TableStatus } from "@/types";
import { cn } from "@/lib/utils";

type Filter = "all" | TableStatus;

export function TableGrid({ showSearch = true }: { showSearch?: boolean }) {
  const s = useAppState();
  const [filter, setFilter] = useState<Filter>("all");
  const [area, setArea] = useState<string>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(
    () => s.tables.map((t) => ({ t, status: tableStatus(s, t.id), order: s.orders[t.id] })),
    [s],
  );
  const counts = useMemo(() => {
    const c = { all: rows.length, available: 0, occupied: 0, bill_pending: 0 };
    rows.forEach((r) => c[r.status]++);
    return c;
  }, [rows]);
  const areas = Array.from(new Set(s.tables.map((t) => t.area)));
  const shown = rows.filter(
    (r) => (filter === "all" || r.status === filter) && (area === "all" || r.t.area === area) && r.t.name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: `All ${counts.all}` },
            { value: "available", label: `Available ${counts.available}` },
            { value: "occupied", label: `Occupied ${counts.occupied}` },
            { value: "bill_pending", label: `Bill Pending ${counts.bill_pending}` },
          ]}
        />
        <div className="flex gap-2 lg:ml-auto">
          <select value={area} onChange={(e) => setArea(e.target.value)} className="h-11 rounded-md border bg-surface px-3 text-sm">
            <option value="all">All areas</option>
            {areas.map((a) => <option key={a}>{a}</option>)}
          </select>
          {showSearch && (
            <div className="relative flex-1 lg:w-48">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Table no." className="h-11 pl-9" />
            </div>
          )}
        </div>
      </div>

      {shown.length === 0 ? (
        <EmptyState icon={Search} title="No tables match" description="Try a different status or area filter." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map(({ t, status, order }) => {
            const total = order ? calcTotals(order.items, order.discountPct, s.settings.taxRatePct).total : 0;
            const items = order?.items.reduce((a, i) => a + i.qty, 0) ?? 0;
            const target = status === "bill_pending" ? "/cashier/bill/$tableId" : "/cashier/order/$tableId";
            const cta = status === "available" ? "Open Table" : status === "bill_pending" ? "Generate Bill" : "View Order";
            return (
              <Link
                key={t.id}
                to={target}
                params={{ tableId: t.id }}
                className={cn("group flex flex-col overflow-hidden rounded-2xl border bg-card transition-colors hover:border-primary/60", statusMeta[status].card)}
              >
                <div className="flex items-center justify-between px-3 pt-3">
                  <div className="text-sm font-bold uppercase tracking-wide">Table {t.name}</div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{order?.guests ?? t.seats}</span>
                </div>
                <div className="relative mt-2 h-20 overflow-hidden">
                  <img src={tableImg} alt="" loading="lazy" width={1152} height={576} className={cn("h-full w-full object-cover", status === "available" && "opacity-70")} />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-card to-transparent" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3 pt-1">
                  <div><StatusBadge status={status} /></div>
                  {order ? (
                    <div>
                      <Money value={total} className="text-lg font-bold" />
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">{items} items · <Clock className="h-3 w-3" />{elapsed(order.openedAt)}</div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">{t.area} · {t.seats} seats</div>
                  )}
                  <span className={cn("mt-auto flex h-10 items-center justify-center gap-1 rounded-lg text-sm font-semibold", status === "available" ? "border border-primary/70 text-foreground" : "bg-primary text-primary-foreground")}>
                    {cta} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
