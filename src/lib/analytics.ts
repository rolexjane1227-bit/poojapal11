import type { AppState, Bill } from "@/types";

export const sameDay = (iso: string, d: Date) => new Date(iso).toDateString() === d.toDateString();

export function dailySeries(bills: Bill[], days: number) {
  const out: { day: string; sales: number; orders: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const bs = bills.filter((b) => sameDay(b.createdAt, d));
    out.push({ day: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), sales: bs.reduce((a, b) => a + b.total, 0), orders: bs.length });
  }
  return out;
}

export function paymentBreakdown(bills: Bill[]) {
  const m: Record<string, number> = { cash: 0, upi: 0, card: 0 };
  bills.forEach((b) => b.payments.forEach((p) => (m[p.method] += p.amount)));
  return [
    { name: "Cash", key: "cash", value: m.cash },
    { name: "UPI", key: "upi", value: m.upi },
    { name: "Card", key: "card", value: m.card },
  ];
}

export function topProducts(bills: Bill[], n = 5) {
  const m = new Map<string, { name: string; qty: number; revenue: number }>();
  bills.forEach((b) => b.items.forEach((i) => {
    const cur = m.get(i.productId) ?? { name: i.name, qty: 0, revenue: 0 };
    cur.qty += i.qty; cur.revenue += i.qty * i.price;
    m.set(i.productId, cur);
  }));
  return [...m.values()].sort((a, b) => b.revenue - a.revenue).slice(0, n);
}

export function categorySales(s: AppState, bills: Bill[]) {
  const pc = new Map(s.products.map((p) => [p.id, p.categoryId]));
  return s.categories.map((c) => ({
    name: c.name,
    value: bills.reduce((a, b) => a + b.items.filter((i) => pc.get(i.productId) === c.id).reduce((x, i) => x + i.qty * i.price, 0), 0),
  }));
}

export const lowStock = (s: AppState) => s.products.filter((p) => p.lowStockAt > 0 && p.stock <= p.lowStockAt);

export const CHART_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--muted-foreground)", "var(--primary)"];
