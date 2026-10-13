import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/pos/ui";
import { BillHistory } from "@/components/pos/BillHistory";
import { useCurrentUser } from "@/services/pos";

export const Route = createFileRoute("/cashier/history")({
  head: () => ({
    meta: [
      { title: "My Bills — Pooja Palace SmartPOS" },
      { name: "description", content: "Bills settled by you this shift." },
      { property: "og:title", content: "My Bills — Pooja Palace SmartPOS" },
      { property: "og:description", content: "Bills settled by you this shift." },
    ],
  }),
  component: Page,
});

function Page() {
  const u = useCurrentUser();
  return (
    <div>
      <PageHeader title="My bills" subtitle="Settled bills for your account" />
      <BillHistory cashierId={u?.id} />
    </div>
  );
}
