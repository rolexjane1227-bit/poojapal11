import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/pos/ui";
import { BillHistory } from "@/components/pos/BillHistory";
import { meta } from "@/components/pos/FormDialog";

export const Route = createFileRoute("/admin/bills")({
  head: () => meta("Bill History", "Search and review all settled bills."),
  component: () => (
    <div>
      <PageHeader title="Bill history" subtitle="All settled bills" />
      <BillHistory />
    </div>
  ),
});
