import { useEffect, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  BarChart3, Bell, Boxes, ClipboardList, Grid3x3, LayoutDashboard, LogOut, Package, Receipt, Settings,
  Tags, Truck, Users, Wallet, type LucideIcon,
} from "lucide-react";
import { logout, useCurrentUser } from "@/services/pos";
import { useHydrated } from "@/services/store";
import type { Role } from "@/types";
import { cn } from "@/lib/utils";
import { LogoMark, Wordmark } from "./Logo";

interface NavItem { to: string; label: string; icon: LucideIcon; mobile?: boolean; exact?: boolean }

const NAV: Record<Role, NavItem[]> = {
  cashier: [
    { to: "/cashier", label: "Home", icon: LayoutDashboard, mobile: true, exact: true },
    { to: "/cashier/tables", label: "Tables", icon: Grid3x3, mobile: true },
    { to: "/cashier/history", label: "Bills", icon: Receipt, mobile: true },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard, mobile: true, exact: true },
    { to: "/admin/tables", label: "Tables", icon: Grid3x3 },
    { to: "/admin/products", label: "Products", icon: Package, mobile: true },
    { to: "/admin/categories", label: "Categories", icon: Tags },
    { to: "/admin/inventory", label: "Inventory", icon: Boxes, mobile: true },
    { to: "/admin/purchases", label: "Purchases", icon: Truck },
    { to: "/admin/expenses", label: "Expenses", icon: Wallet },
    { to: "/admin/cashiers", label: "Cashiers", icon: Users },
    { to: "/admin/bills", label: "Bill History", icon: ClipboardList, mobile: true },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const user = useCurrentUser();
  const hydrated = useHydrated();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) navigate({ to: "/login" });
    else if (user.role !== role) navigate({ to: user.role === "admin" ? "/admin" : "/cashier" });
  }, [hydrated, user, role, navigate]);

  if (!hydrated || !user || user.role !== role) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  const items = NAV[role];
  const mobileItems = items.filter((i) => i.mobile);

  const initials = user.name.split(" ").map((x) => x[0]).join("").slice(0, 2);
  const doLogout = () => { logout(); navigate({ to: "/login" }); };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b bg-sidebar px-4 md:px-6">
        <Brand />
        <div className="flex items-center gap-2 md:gap-4">
          <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-full text-muted-foreground hover:bg-accent">
            <Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
          </button>
          <div className="flex items-center gap-2.5 border-l pl-3 md:pl-4">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">{initials}</div>
            <div className="hidden leading-tight sm:block">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-xs capitalize text-muted-foreground">{user.role}</div>
            </div>
            <button aria-label="Log out" onClick={doLogout} className="grid h-10 w-10 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-w-0 flex-1">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-24 shrink-0 flex-col border-r bg-sidebar md:flex">
          <nav className="flex-1 space-y-1.5 overflow-y-auto p-2">
            {items.map((i) => (
              <Link
                key={i.to}
                to={i.to}
                activeOptions={{ exact: i.exact }}
                className="flex flex-col items-center gap-1.5 rounded-xl px-1 py-3 text-center text-[11px] font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                activeProps={{ className: "!bg-primary !text-primary-foreground" }}
              >
                <i.icon className="h-5 w-5" />
                <span className="leading-tight">{i.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-24 pt-4 md:px-6 md:pb-8 md:pt-6">{children}</main>
      </div>

      <nav className={cn("fixed inset-x-0 bottom-0 z-30 grid border-t bg-sidebar md:hidden")} style={{ gridTemplateColumns: `repeat(${mobileItems.length + (role === "admin" ? 1 : 0)}, 1fr)` }}>
        {mobileItems.map((i) => (
          <Link
            key={i.to}
            to={i.to}
            activeOptions={{ exact: i.exact }}
            className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "!text-primary" }}
          >
            <i.icon className="h-5 w-5" />
            {i.label}
          </Link>
        ))}
        {role === "admin" && (
          <Link to="/admin/more" className="flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground" activeProps={{ className: "!text-primary" }}>
            <Settings className="h-5 w-5" />
            More
          </Link>
        )}
      </nav>
    </div>
  );
}

export function Brand({ compact }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark className="h-10 w-10" />
      <Wordmark />
      {!compact && (
        <div className="hidden border-l pl-4 text-lg font-semibold sm:block">
          Smart<span className="text-primary">POS</span>
        </div>
      )}
    </div>
  );
}

export { NAV };
