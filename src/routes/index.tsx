import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCurrentUser } from "@/services/pos";
import { useHydrated } from "@/services/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pooja Palace SmartPOS — Bar & Shop Billing" },
      { name: "description", content: "Fast table ordering, billing and admin reports for Pooja Palace Bar & Shop." },
      { property: "og:title", content: "Pooja Palace SmartPOS — Bar & Shop Billing" },
      { property: "og:description", content: "Fast table ordering, billing and admin reports for Pooja Palace Bar & Shop." },
    ],
  }),
  component: Index,
});

function Index() {
  const user = useCurrentUser();
  const hydrated = useHydrated();
  const navigate = useNavigate();
  useEffect(() => {
    if (!hydrated) return;
    navigate({ to: !user ? "/login" : user.role === "admin" ? "/admin" : "/cashier", replace: true });
  }, [hydrated, user, navigate]);
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
    </div>
  );
}
