import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/pos/ui";
import { TableGrid } from "@/components/pos/TableGrid";

export const Route = createFileRoute("/cashier/tables")({
  head: () => ({
    meta: [
      { title: "Tables — Pooja Palace SmartPOS" },
      { name: "description", content: "Pick a table to start or continue an order." },
      { property: "og:title", content: "Tables — Pooja Palace SmartPOS" },
      { property: "og:description", content: "Pick a table to start or continue an order." },
    ],
  }),
  component: () => (
    <div>
      <PageHeader title="Tables" subtitle="Tap a table to open its order" />
      <TableGrid />
    </div>
  ),
});
