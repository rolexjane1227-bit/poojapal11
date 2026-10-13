import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAppState, resetStore } from "@/services/store";
import { saveSettings } from "@/services/pos";
import { PageHeader, Panel } from "@/components/pos/ui";
import { TextField, meta } from "@/components/pos/FormDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin/settings")({
  head: () => meta("Settings", "Shop details, tax rate and receipt preferences."),
  component: Page,
});

function Page() {
  const s = useAppState();
  const [f, setF] = useState(s.settings);
  useEffect(() => setF(s.settings), [s.settings]);
  const dirty = JSON.stringify(f) !== JSON.stringify(s.settings);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageHeader title="Settings" />
      <Panel title="Shop details">
        <div className="space-y-3">
          <TextField label="Shop name" value={f.shopName} onChange={(v) => setF({ ...f, shopName: v })} />
          <TextField label="Address" value={f.address} onChange={(v) => setF({ ...f, address: v })} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Phone" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
            <TextField label="GSTIN" value={f.gstin} onChange={(v) => setF({ ...f, gstin: v })} />
          </div>
        </div>
      </Panel>
      <Panel title="Billing">
        <div className="space-y-3">
          <TextField label="Tax rate %" type="number" value={f.taxRatePct} onChange={(v) => setF({ ...f, taxRatePct: Number(v) })} />
          <TextField label="UPI ID" value={f.upiId} onChange={(v) => setF({ ...f, upiId: v.trim() })} placeholder="business@bank" />
          <TextField label="Receipt footer" value={f.receiptFooter} onChange={(v) => setF({ ...f, receiptFooter: v })} />
          <p className="text-xs text-muted-foreground">Cashier discount limits are set per cashier on the Cashiers page.</p>
        </div>
      </Panel>
      <Panel title="Demo data">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Restore sample products, tables, orders and bills.</p>
          <Button variant="outline" className="h-11 shrink-0" onClick={() => { if (confirm("Reset all data to sample data?")) { resetStore(); toast.success("Sample data restored"); } }}><RotateCcw /> Reset</Button>
        </div>
      </Panel>
      <div className="sticky bottom-16 flex justify-end gap-2 bg-background py-3 md:bottom-0">
        <Button variant="outline" className="h-11" disabled={!dirty} onClick={() => setF(s.settings)}>Discard</Button>
        <Button className="h-11" disabled={!dirty} onClick={() => { if (f.taxRatePct < 0 || f.taxRatePct > 40) return toast.error("Tax rate must be between 0 and 40"); if (!f.upiId.includes("@")) return toast.error("Enter a valid UPI ID"); saveSettings(f); toast.success("Settings saved"); }}>Save changes</Button>
      </div>
    </div>
  );
}
