import type { ReactNode } from "react";
import { Minus, Plus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/billing";
import type { TableStatus } from "@/types";

export function Money({ value, decimals = 0, className }: { value: number; decimals?: number; className?: string }) {
  return <span className={cn("tabular", className)}>{formatINR(value, decimals)}</span>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-0.5 truncate text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: {
  label: string; value: ReactNode; hint?: ReactNode; icon?: LucideIcon; tone?: "default" | "primary" | "success" | "danger";
}) {
  const toneCls = {
    default: "text-muted-foreground bg-muted",
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    danger: "text-destructive bg-destructive/10",
  }[tone];
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        {Icon && (
          <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-md", toneCls)}>
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <div className="tabular mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export const statusMeta: Record<TableStatus, { label: string; dot: string; badge: string; card: string }> = {
  available: { label: "Available", dot: "bg-success", badge: "bg-success/12 text-success border-success/30", card: "border-border" },
  occupied: { label: "Occupied", dot: "bg-destructive", badge: "bg-destructive/12 text-destructive border-destructive/30", card: "border-destructive/40" },
  bill_pending: { label: "Bill Requested", dot: "bg-warning", badge: "bg-warning/12 text-warning border-warning/30", card: "border-warning/50" },
};

export function StatusBadge({ status }: { status: TableStatus }) {
  const m = statusMeta[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium", m.badge)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "danger" | "primary" }) {
  const cls = {
    default: "bg-muted text-muted-foreground border-border",
    success: "bg-success/12 text-success border-success/30",
    danger: "bg-destructive/12 text-destructive border-destructive/30",
    primary: "bg-primary/12 text-primary border-primary/30",
  }[tone];
  return <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium", cls)}>{children}</span>;
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-surface px-6 py-12 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="mt-3 font-medium">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function QtyStepper({ value, onChange, size = "md" }: { value: number; onChange: (v: number) => void; size?: "md" | "lg" }) {
  const btn = size === "lg" ? "h-11 w-11" : "h-9 w-9";
  return (
    <div className="inline-flex items-center rounded-md border bg-surface">
      <button type="button" aria-label="Decrease" onClick={() => onChange(value - 1)} className={cn(btn, "grid place-items-center rounded-l-md text-muted-foreground active:bg-accent")}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="tabular w-8 text-center text-sm font-semibold">{value}</span>
      <button type="button" aria-label="Increase" onClick={() => onChange(value + 1)} className={cn(btn, "grid place-items-center rounded-r-md text-primary active:bg-accent")}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: ReactNode }[] }) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-lg border bg-surface p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "h-9 shrink-0 rounded-md px-3 text-sm font-medium transition-colors",
            value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border bg-card", className)}>
      {title && (
        <header className="flex items-center justify-between gap-2 border-b px-4 py-3">
          <h2 className="text-sm font-semibold">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 animate-pulse rounded-md bg-muted" />
      ))}
    </div>
  );
}

export function SummaryRow({ label, value, strong, muted }: { label: ReactNode; value: ReactNode; strong?: boolean; muted?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between py-1 text-sm", strong && "text-lg font-semibold", muted && "text-muted-foreground")}>
      <span>{label}</span>
      <span className="tabular">{value}</span>
    </div>
  );
}

export const elapsed = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 60 ? `${m}m` : `${Math.floor(m / 60)}h ${m % 60}m`;
};
export const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
