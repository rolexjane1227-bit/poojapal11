import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/services/store";
import { deleteTable, saveTable, tableStatus } from "@/services/pos";
import { calcTotals } from "@/lib/billing";
import { Money, PageHeader, StatusBadge } from "@/components/pos/ui";
import { FormDialog, SelectField, TextField, meta } from "@/components/pos/FormDialog";
import { Button } from "@/components/ui/button";
import type { DiningTable } from "@/types";

export const Route = createFileRoute("/admin/tables")({
  head: () => meta("Tables", "Configure tables, areas and seating."),
  component: Page,
});

const AREAS = ["Main Hall", "AC Room", "Terrace"] as const;

function Page() {
  const s = useAppState();
  const [edit, setEdit] = useState<DiningTable | null>(null);
  return (
    <div>
      <PageHeader title="Tables" subtitle={`${s.tables.length} tables across ${AREAS.length} areas`} actions={<Button className="h-11" onClick={() => setEdit({ id: "", name: "", area: "Main Hall", seats: 4 })}><Plus /> Add table</Button>} />
      <div className="space-y-6">
        {AREAS.map((a) => (
          <section key={a}>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">{a}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {s.tables.filter((t) => t.area === a).map((t) => {
                const o = s.orders[t.id];
                return (
                  <button key={t.id} onClick={() => setEdit(t)} className="rounded-lg border bg-card p-3 text-left active:bg-accent">
                    <div className="flex items-start justify-between"><span className="text-xl font-semibold">{t.name}</span><span className="text-xs text-muted-foreground">{t.seats} seats</span></div>
                    <div className="mt-2 text-sm">{o ? <Money value={calcTotals(o.items, o.discountPct, s.settings.taxRatePct).total} /> : <span className="text-muted-foreground">—</span>}</div>
                    <div className="mt-1.5"><StatusBadge status={tableStatus(s, t.id)} /></div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <FormDialog
        open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit?.id ? `Edit ${edit.name}` : "New table"}
        onSubmit={() => { if (!edit?.name.trim()) return toast.error("Table name is required"); saveTable(edit); toast.success("Table saved"); setEdit(null); }}
        onDelete={edit?.id ? () => { try { deleteTable(edit.id); toast.success("Table removed"); setEdit(null); } catch (e) { toast.error((e as Error).message); } } : undefined}
      >
        {edit && (
          <>
            <TextField label="Table name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} placeholder="e.g. T9" />
            <SelectField label="Area" value={edit.area} onChange={(v) => setEdit({ ...edit, area: v as DiningTable["area"] })} options={AREAS.map((a) => ({ value: a, label: a }))} />
            <TextField label="Seats" type="number" value={edit.seats} onChange={(v) => setEdit({ ...edit, seats: Number(v) })} />
          </>
        )}
      </FormDialog>
    </div>
  );
}
