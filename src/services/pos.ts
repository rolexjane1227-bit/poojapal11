import type { AppState, Bill, Category, DiningTable, Expense, OrderItem, PaymentSplit, Product, Purchase, Settings, TableStatus, User } from "@/types";
import { calcTotals } from "@/lib/billing";
import { getState, setState, useAppState } from "./store";

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

// ---------- Auth ----------
export function login(username: string, pin: string): User {
  const u = getState().users.find((x) => x.username.toLowerCase() === username.trim().toLowerCase());
  if (!u || u.pin !== pin) throw new Error("Invalid username or PIN");
  if (!u.active) throw new Error("This account is deactivated. Contact admin.");
  setState((s) => ({ ...s, sessionUserId: u.id }));
  return u;
}
export function logout() {
  setState((s) => ({ ...s, sessionUserId: null }));
}
export function useCurrentUser(): User | null {
  const s = useAppState();
  return s.users.find((u) => u.id === s.sessionUserId) ?? null;
}

// ---------- Tables ----------
export function tableStatus(s: AppState, tableId: string): TableStatus {
  const o = s.orders[tableId];
  if (!o) return "available";
  return o.billRequested ? "bill_pending" : "occupied";
}

// ---------- Orders ----------
function mutateOrder(tableId: string, fn: (items: OrderItem[]) => OrderItem[]) {
  setState((s) => {
    const existing = s.orders[tableId] ?? {
      tableId, items: [], discountPct: 0, openedAt: new Date().toISOString(),
      cashierId: s.sessionUserId ?? "", billRequested: false, guests: 2,
    };
    const items = fn(existing.items).filter((i) => i.qty > 0);
    const orders = { ...s.orders };
    if (items.length === 0) delete orders[tableId];
    else orders[tableId] = { ...existing, items, billRequested: false };
    return { ...s, orders };
  });
}

export function addItem(tableId: string, product: Product, serving?: { ml: number; price: number }) {
  mutateOrder(tableId, (items) => {
    const idx = items.findIndex((i) => i.productId === product.id && i.servingMl === serving?.ml && !i.note);
    if (idx >= 0) return items.map((i, k) => (k === idx ? { ...i, qty: i.qty + 1 } : i));
    return [...items, { productId: product.id, name: product.name, price: serving?.price ?? product.price, qty: 1, servingMl: serving?.ml }];
  });
}
export function setQty(tableId: string, index: number, qty: number) {
  mutateOrder(tableId, (items) => items.map((i, k) => (k === index ? { ...i, qty } : i)));
}
export function setNote(tableId: string, index: number, note: string) {
  mutateOrder(tableId, (items) => items.map((i, k) => (k === index ? { ...i, note: note || undefined } : i)));
}
export function clearOrder(tableId: string) {
  mutateOrder(tableId, () => []);
}
export function setDiscount(tableId: string, pct: number) {
  setState((s) => {
    const o = s.orders[tableId];
    if (!o) return s;
    return { ...s, orders: { ...s.orders, [tableId]: { ...o, discountPct: pct } } };
  });
}
export function requestBill(tableId: string, value = true) {
  setState((s) => {
    const o = s.orders[tableId];
    if (!o) return s;
    return { ...s, orders: { ...s.orders, [tableId]: { ...o, billRequested: value } } };
  });
}

export function settleBill(tableId: string, payments: PaymentSplit[], tendered?: number, paymentRef?: string): Bill {
  const s = getState();
  const o = s.orders[tableId];
  if (!o) throw new Error("No open order on this table");
  const table = s.tables.find((t) => t.id === tableId)!;
  const cashier = s.users.find((u) => u.id === s.sessionUserId) ?? s.users[0];
  const t = calcTotals(o.items, o.discountPct, s.settings.taxRatePct);
  const bill: Bill = {
    id: uid("b"), number: s.nextBillNumber, tableId, tableName: table.name,
    cashierId: cashier.id, cashierName: cashier.name, items: o.items,
    subtotal: t.subtotal, discount: t.discount, tax: t.tax, roundOff: t.roundOff, total: t.total,
    payments: payments.filter((p) => p.amount > 0), paymentRef: paymentRef || undefined, tendered,
    change: tendered !== undefined ? Math.max(0, tendered - t.total) : undefined,
    createdAt: new Date().toISOString(),
  };
  setState((st) => {
    const orders = { ...st.orders };
    delete orders[tableId];
    const products = st.products.map((pr) => {
      const used = o.items.filter((i) => i.productId === pr.id).reduce((a, i) => a + i.qty, 0);
      return used && pr.lowStockAt > 0 ? { ...pr, stock: Math.max(0, pr.stock - used) } : pr;
    });
    return { ...st, orders, products, bills: [bill, ...st.bills], nextBillNumber: st.nextBillNumber + 1 };
  });
  return bill;
}

// ---------- Generic admin CRUD ----------
type ListKey = "products" | "categories" | "tables" | "users" | "expenses" | "purchases";
type ItemOf<K extends ListKey> = AppState[K][number];

function upsert<K extends ListKey>(key: K, item: ItemOf<K>) {
  setState((s) => {
    const list = s[key] as ItemOf<K>[];
    const exists = list.some((x) => x.id === item.id);
    return { ...s, [key]: exists ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...list] };
  });
}
function remove(key: ListKey, id: string) {
  setState((s) => ({ ...s, [key]: (s[key] as { id: string }[]).filter((x) => x.id !== id) }));
}

export const saveProduct = (p: Product) => upsert("products", p.id ? p : { ...p, id: uid("p") });
export const deleteProduct = (id: string) => remove("products", id);
export const saveCategory = (c: Category) => upsert("categories", c.id ? c : { ...c, id: uid("c") });
export const deleteCategory = (id: string) => {
  if (getState().products.some((p) => p.categoryId === id)) throw new Error("Category has products. Move or delete them first.");
  remove("categories", id);
};
export const saveTable = (t: DiningTable) => upsert("tables", t.id ? t : { ...t, id: uid("t") });
export const deleteTable = (id: string) => {
  if (getState().orders[id]) throw new Error("Table has an open order.");
  remove("tables", id);
};
export const saveUser = (u: User) => upsert("users", u.id ? u : { ...u, id: uid("u") });
export const saveExpense = (e: Expense) => upsert("expenses", e.id ? e : { ...e, id: uid("e") });
export const deleteExpense = (id: string) => remove("expenses", id);

export function addPurchase(pu: Omit<Purchase, "id">) {
  setState((s) => ({
    ...s,
    purchases: [{ ...pu, id: uid("pu") }, ...s.purchases],
    products: s.products.map((p) => (p.id === pu.productId ? { ...p, stock: p.stock + pu.qty } : p)),
  }));
}
export function adjustStock(productId: string, delta: number) {
  setState((s) => ({
    ...s,
    products: s.products.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
  }));
}
export function saveSettings(settings: Settings) {
  setState((s) => ({ ...s, settings }));
}

/** Simulated latency for screens that show loading states */
export const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));
