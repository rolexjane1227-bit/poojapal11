import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/pos/AppShell";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AppShell role="admin">
      <Outlet />
    </AppShell>
  ),
});
