import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function FormDialog({ open, onOpenChange, title, children, onSubmit, submitLabel = "Save", onDelete }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; children: ReactNode;
  onSubmit: () => void; submitLabel?: string; onDelete?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form id="pos-form" className="space-y-3" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>{children}</form>
        <DialogFooter className="gap-2 sm:justify-between">
          {onDelete ? <Button type="button" variant="ghost" className="h-11 text-destructive" onClick={onDelete}>Delete</Button> : <span />}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-11" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" form="pos-form" className="h-11">{submitLabel}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function Field({ label, children, error }: { label: string; children: ReactNode; error?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function TextField({ label, value, onChange, type = "text", error, placeholder }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string; error?: string; placeholder?: string;
}) {
  return (
    <Field label={label} error={error}>
      <Input type={type} inputMode={type === "number" ? "decimal" : undefined} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="h-11" />
    </Field>
  );
}

export function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-full rounded-md border bg-surface px-3 text-sm">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-11 sm:w-64" />;
}

export function meta(title: string, description: string) {
  return {
    meta: [
      { title: `${title} — Pooja Palace SmartPOS` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} — Pooja Palace SmartPOS` },
      { property: "og:description", content: description },
    ],
  };
}
