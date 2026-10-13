import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { NAV } from "@/components/pos/AppShell";
import { PageHeader } from "@/components/pos/ui";
import { meta } from "@/components/pos/FormDialog";

export const Route = createFileRoute("/admin/more")({
  head: () => meta("All sections", "Every admin section of Pooja Palace SmartPOS."),
  component: () => (
    <div>
      <PageHeader title="All sections" />
      <div className="divide-y rounded-lg border bg-card">
        {NAV.admin.map((i) => (
          <Link key={i.to} to={i.to} className="flex h-14 items-center gap-3 px-4 active:bg-accent">
            <i.icon className="h-5 w-5 text-primary" />
            <span className="flex-1 font-medium">{i.label}</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        ))}
      </div>
    </div>
  ),
});
