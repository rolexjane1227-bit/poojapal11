import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/pos/AppShell";

export const Route = createFileRoute("/cashier")({
  component: () => (
    <AppShell role="cashier">
      <Outlet />
    </AppShell>
  ),
});
