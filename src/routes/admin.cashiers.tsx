import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useAppState } from "@/services/store";
import { saveUser } from "@/services/pos";
import { Money, PageHeader, Pill } from "@/components/pos/ui";
import { FormDialog, TextField, meta } from "@/components/pos/FormDialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { User } from "@/types";

export const Route = createFileRoute("/admin/cashiers")({
  head: () => meta("Cashiers", "Manage cashier accounts, PINs and discount limits."),
  component: Page,
});

function Page() {
  const s = useAppState();
  const [edit, setEdit] = useState<User | null>(null);
  const cashiers = s.users.filter((u) => u.role === "cashier");
  const today = new Date().toDateString();

  return (
    <div>
      <PageHeader title="Cashiers" subtitle={`${cashiers.filter((c) => c.active).length} active`} actions={<Button className="h-11" onClick={() => setEdit({ id: "", name: "", username: "", pin: "", role: "cashier", active: true, maxDiscountPct: 5, phone: "" })}><Plus /> Add cashier</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cashiers.map((c) => {
          const bills = s.bills.filter((b) => b.cashierId === c.id && new Date(b.createdAt).toDateString() === today);
          return (
            <button key={c.id} onClick={() => setEdit(c)} className="rounded-lg border bg-card p-4 text-left active:bg-accent">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-primary/12 font-semibold text-primary">{c.name.split(" ").map((x) => x[0]).join("")}</div>
                <div className="min-w-0 flex-1"><div className="truncate font-medium">{c.name}</div><div className="text-xs text-muted-foreground">@{c.username} · {c.phone}</div></div>
                {c.active ? <Pill tone="success">Active</Pill> : <Pill tone="danger">Inactive</Pill>}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 text-center text-xs">
                <div><div className="tabular text-sm font-semibold">{bills.length}</div><div className="text-muted-foreground">Bills today</div></div>
                <div><Money value={bills.reduce((a, b) => a + b.total, 0)} className="block text-sm font-semibold" /><div className="text-muted-foreground">Sales</div></div>
                <div><div className="tabular text-sm font-semibold">{c.maxDiscountPct}%</div><div className="text-muted-foreground">Max disc.</div></div>
              </div>
            </button>
          );
        })}
      </div>
      <FormDialog open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit?.id ? "Edit cashier" : "New cashier"}
        onSubmit={() => {
          if (!edit) return;
          if (!edit.name.trim() || !edit.username.trim()) return toast.error("Name and username are required");
          if (!/^\d{4}$/.test(edit.pin)) return toast.error("PIN must be 4 digits");
          if (s.users.some((u) => u.username === edit.username && u.id !== edit.id)) return toast.error("Username already taken");
          saveUser(edit); toast.success("Cashier saved"); setEdit(null);
        }}>
        {edit && (
          <>
            <TextField label="Full name" value={edit.name} onChange={(v) => setEdit({ ...edit, name: v })} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Username" value={edit.username} onChange={(v) => setEdit({ ...edit, username: v.toLowerCase() })} />
              <TextField label="4-digit PIN" value={edit.pin} onChange={(v) => setEdit({ ...edit, pin: v.replace(/\D/g, "").slice(0, 4) })} />
              <TextField label="Phone" value={edit.phone} onChange={(v) => setEdit({ ...edit, phone: v })} />
              <TextField label="Max discount %" type="number" value={edit.maxDiscountPct} onChange={(v) => setEdit({ ...edit, maxDiscountPct: Number(v) })} />
            </div>
            <label className="flex items-center justify-between rounded-md border px-3 py-3"><span className="text-sm font-medium">Account active</span><Switch checked={edit.active} onCheckedChange={(v) => setEdit({ ...edit, active: v })} /></label>
          </>
        )}
      </FormDialog>
    </div>
  );
}
