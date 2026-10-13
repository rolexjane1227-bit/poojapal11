import type { OrderItem, PaymentSplit, Product, ServingSize } from "@/types";

export interface BillTotals {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  roundOff: number;
  total: number;
  itemCount: number;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function servingPrice(basePrice: number, baseMl: number, ml: number): number {
  return r2((basePrice / baseMl) * ml);
}

export function makeServingSizes(product: Pick<Product, "price" | "unit">, sizes: number[]): ServingSize[] {
  const baseMl = Number.parseInt(product.unit, 10) || sizes[0] || 30;
  return sizes.map((ml) => ({ ml, price: servingPrice(product.price, baseMl, ml) }));
}

export function calcTotals(items: OrderItem[], discountPct: number, taxRatePct: number): BillTotals {
  const subtotal = r2(items.reduce((s, i) => s + i.price * i.qty, 0));
  const pct = Math.min(Math.max(discountPct, 0), 100);
  const discount = r2((subtotal * pct) / 100);
  const taxable = r2(subtotal - discount);
  const tax = r2((taxable * taxRatePct) / 100);
  const raw = taxable + tax;
  const total = Math.round(raw);
  return {
    subtotal,
    discount,
    taxable,
    tax,
    roundOff: r2(total - raw),
    total,
    itemCount: items.reduce((s, i) => s + i.qty, 0),
  };
}

export function splitRemaining(total: number, splits: PaymentSplit[]): number {
  return r2(total - splits.reduce((s, p) => s + (p.amount || 0), 0));
}

export function isSplitValid(total: number, splits: PaymentSplit[]): boolean {
  return splits.every((p) => p.amount >= 0) && Math.abs(splitRemaining(total, splits)) < 0.01;
}

export const formatINR = (n: number, decimals = 0) =>
  "₹" +
  n.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
