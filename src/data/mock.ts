import type { AppState, Bill, Category, DiningTable, Order, OrderItem, PaymentMethod, Product, User } from "@/types";
import { calcTotals, makeServingSizes } from "@/lib/billing";

export const categories: Category[] = [
  { id: "beer", name: "Beer", icon: "beer", sortOrder: 1 },
  { id: "whisky", name: "Whisky", icon: "glass-water", sortOrder: 2 },
  { id: "rum", name: "Rum & Vodka", icon: "martini", sortOrder: 3 },
  { id: "wine", name: "Wine", icon: "wine", sortOrder: 4 },
  { id: "soft", name: "Soft Drinks", icon: "cup-soda", sortOrder: 5 },
  { id: "food", name: "Food", icon: "utensils", sortOrder: 6 },
  { id: "snacks", name: "Snacks", icon: "popcorn", sortOrder: 7 },
];

const p = (id: string, name: string, categoryId: string, price: number, unit: string, stock: number, lowStockAt = 10): Product => {
  const product: Product = { id, name, categoryId, price, unit, stock, lowStockAt, active: true };
  const sizes = categoryId === "whisky" || categoryId === "rum"
    ? [30, 60, 90, 120, 180, 375, 750]
    : categoryId === "beer"
      ? [330, 650]
      : categoryId === "wine"
        ? [150, 375, 750]
        : [];
  return sizes.length ? { ...product, servingSizes: makeServingSizes(product, sizes) } : product;
};

export const products: Product[] = [
  p("p1", "Kingfisher Premium", "beer", 220, "650 ml", 96, 24),
  p("p2", "Kingfisher Ultra", "beer", 260, "650 ml", 40, 24),
  p("p3", "Budweiser", "beer", 280, "650 ml", 18, 24),
  p("p4", "Tuborg Strong", "beer", 240, "650 ml", 72, 24),
  p("p5", "Heineken", "beer", 300, "330 ml", 36, 12),
  p("p6", "Bira 91 White", "beer", 250, "330 ml", 8, 12),
  p("p7", "Royal Stag", "whisky", 90, "30 ml", 42, 10),
  p("p8", "Blenders Pride", "whisky", 130, "30 ml", 30, 10),
  p("p9", "Signature Premier", "whisky", 150, "30 ml", 22, 8),
  p("p10", "Antiquity Blue", "whisky", 170, "30 ml", 6, 8),
  p("p11", "Black & White", "whisky", 220, "30 ml", 14, 6),
  p("p12", "Johnnie Walker Black", "whisky", 420, "30 ml", 9, 4),
  p("p13", "Old Monk", "rum", 80, "30 ml", 50, 10),
  p("p14", "Bacardi White", "rum", 120, "30 ml", 28, 8),
  p("p15", "Smirnoff", "rum", 120, "30 ml", 26, 8),
  p("p16", "Magic Moments", "rum", 100, "30 ml", 3, 8),
  p("p17", "Sula Shiraz", "wine", 380, "Glass", 20, 6),
  p("p18", "Sula Sauvignon Blanc", "wine", 380, "Glass", 16, 6),
  p("p19", "Fratelli Classic", "wine", 1800, "750 ml", 5, 3),
  p("p20", "Coca-Cola", "soft", 60, "300 ml", 120, 24),
  p("p21", "Sprite", "soft", 60, "300 ml", 90, 24),
  p("p22", "Thums Up", "soft", 60, "300 ml", 110, 24),
  p("p23", "Soda", "soft", 40, "500 ml", 140, 24),
  p("p24", "Mineral Water", "soft", 30, "1 L", 80, 24),
  p("p25", "Red Bull", "soft", 150, "250 ml", 14, 12),
  p("p26", "Chicken Tikka", "food", 280, "Plate", 999, 0),
  p("p27", "Paneer Tikka", "food", 240, "Plate", 999, 0),
  p("p28", "Chicken Lollipop", "food", 260, "6 pcs", 999, 0),
  p("p29", "Mutton Sukka", "food", 340, "Plate", 999, 0),
  p("p30", "Fish Fry (Surmai)", "food", 380, "Plate", 999, 0),
  p("p31", "Veg Fried Rice", "food", 180, "Plate", 999, 0),
  p("p32", "Masala Peanuts", "snacks", 90, "Bowl", 999, 0),
  p("p33", "French Fries", "snacks", 120, "Plate", 999, 0),
  p("p34", "Chakna Platter", "snacks", 150, "Plate", 999, 0),
  p("p35", "Masala Papad", "snacks", 70, "2 pcs", 999, 0),
  p("p36", "Boiled Eggs", "snacks", 80, "2 pcs", 999, 0),
];

export const tables: DiningTable[] = [
  ...Array.from({ length: 8 }, (_, i) => ({ id: `t${i + 1}`, name: `T${i + 1}`, area: "Main Hall" as const, seats: i % 3 === 0 ? 6 : 4 })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `a${i + 1}`, name: `A${i + 1}`, area: "AC Room" as const, seats: 4 })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `r${i + 1}`, name: `R${i + 1}`, area: "Terrace" as const, seats: i < 2 ? 2 : 4 })),
];

export const users: User[] = [
  { id: "u1", name: "Vivek Unhale", username: "admin", pin: "1234", role: "admin", active: true, maxDiscountPct: 100, phone: "98220 11223" },
  { id: "u2", name: "Rahul Patil", username: "rahul", pin: "1111", role: "cashier", active: true, maxDiscountPct: 10, phone: "98500 44551" },
  { id: "u3", name: "Sneha Kulkarni", username: "sneha", pin: "2222", role: "cashier", active: true, maxDiscountPct: 5, phone: "97300 66712" },
  { id: "u4", name: "Amit Jadhav", username: "amit", pin: "3333", role: "cashier", active: false, maxDiscountPct: 5, phone: "90110 23344" },
];

const line = (pid: string, qty: number, note?: string): OrderItem => {
  const pr = products.find((x) => x.id === pid)!;
  return { productId: pid, name: pr.name, price: pr.price, qty, note };
};

const minsAgo = (m: number) => new Date(Date.now() - m * 60000).toISOString();

const orders: Record<string, Order> = {
  t2: { tableId: "t2", items: [line("p1", 3), line("p32", 1), line("p26", 1)], discountPct: 0, openedAt: minsAgo(48), cashierId: "u2", billRequested: false, guests: 3 },
  t5: { tableId: "t5", items: [line("p8", 4), line("p23", 2), line("p28", 1, "Extra spicy")], discountPct: 0, openedAt: minsAgo(82), cashierId: "u2", billRequested: true, guests: 4 },
  a1: { tableId: "a1", items: [line("p12", 2), line("p20", 2), line("p30", 1)], discountPct: 5, openedAt: minsAgo(25), cashierId: "u3", billRequested: false, guests: 2 },
  a3: { tableId: "a3", items: [line("p17", 2), line("p27", 1)], discountPct: 0, openedAt: minsAgo(12), cashierId: "u2", billRequested: false, guests: 2 },
  r2: { tableId: "r2", items: [line("p4", 4), line("p34", 1), line("p33", 1)], discountPct: 0, openedAt: minsAgo(95), cashierId: "u3", billRequested: true, guests: 4 },
};

// Deterministic PRNG so history is stable
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function genBills(taxRate: number): Bill[] {
  const rand = rng(42);
  const out: Bill[] = [];
  let n = 1001;
  const cashiers = users.filter((u) => u.role === "cashier");
  const methods: PaymentMethod[] = ["cash", "upi", "upi", "card", "cash"];
  for (let d = 13; d >= 0; d--) {
    const count = 14 + Math.floor(rand() * 14);
    for (let k = 0; k < count; k++) {
      const date = new Date();
      date.setDate(date.getDate() - d);
      date.setHours(13 + Math.floor(rand() * 10), Math.floor(rand() * 60), 0, 0);
      if (d === 0 && date.getTime() > Date.now()) date.setTime(Date.now() - (k + 1) * 600000);
      const nItems = 2 + Math.floor(rand() * 4);
      const items: OrderItem[] = [];
      for (let j = 0; j < nItems; j++) {
        const pr = products[Math.floor(rand() * products.length)];
        if (items.some((i) => i.productId === pr.id)) continue;
        items.push({ productId: pr.id, name: pr.name, price: pr.price, qty: 1 + Math.floor(rand() * 3) });
      }
      const disc = rand() < 0.15 ? 5 : 0;
      const t = calcTotals(items, disc, taxRate);
      const table = tables[Math.floor(rand() * tables.length)];
      const c = cashiers[Math.floor(rand() * cashiers.length)];
      const split = rand() < 0.08;
      const m = methods[Math.floor(rand() * methods.length)];
      out.push({
        id: `b${n}`, number: n, tableId: table.id, tableName: table.name, cashierId: c.id, cashierName: c.name,
        items, subtotal: t.subtotal, discount: t.discount, tax: t.tax, roundOff: t.roundOff, total: t.total,
        payments: split
          ? [{ method: "cash", amount: Math.round(t.total / 2) }, { method: "upi", amount: t.total - Math.round(t.total / 2) }]
          : [{ method: m, amount: t.total }],
        createdAt: date.toISOString(),
      });
      n++;
    }
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

const today = new Date();
const dayStr = (d: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() - d);
  return x.toISOString().slice(0, 10);
};

export function seedState(): AppState {
  const settings = {
    shopName: "Pooja Palace Bar & Shop",
    address: "Station Road, Nashik, Maharashtra 422001",
    phone: "0253 245 7788",
    gstin: "27AABCP1234F1Z5",
    taxRatePct: 5,
    receiptFooter: "Thank you! Visit again. Drink responsibly.",
    currency: "INR",
    upiId: "poojapalace@upi",
  };
  const bills = genBills(settings.taxRatePct);
  return {
    users,
    categories,
    products,
    tables,
    orders,
    bills,
    expenses: [
      { id: "e1", date: dayStr(0), category: "Utilities", description: "MSEB electricity bill", amount: 18450 },
      { id: "e2", date: dayStr(1), category: "Salaries", description: "Kitchen staff advance", amount: 6000 },
      { id: "e3", date: dayStr(2), category: "Supplies", description: "Ice blocks (40 kg)", amount: 1200 },
      { id: "e4", date: dayStr(3), category: "Maintenance", description: "Deep freezer repair", amount: 3500 },
      { id: "e5", date: dayStr(5), category: "Supplies", description: "Glassware & napkins", amount: 2850 },
      { id: "e6", date: dayStr(7), category: "Licence", description: "Excise licence renewal fee", amount: 25000 },
    ],
    purchases: [
      { id: "pu1", date: dayStr(0), supplier: "Shree Sai Distributors", productId: "p1", qty: 48, costPerUnit: 145, invoiceNo: "SSD/2291" },
      { id: "pu2", date: dayStr(1), supplier: "Maharashtra Liquor Agency", productId: "p8", qty: 12, costPerUnit: 1100, invoiceNo: "MLA/8812" },
      { id: "pu3", date: dayStr(2), supplier: "Coca-Cola Nashik Depot", productId: "p20", qty: 96, costPerUnit: 32, invoiceNo: "CCN/0451" },
      { id: "pu4", date: dayStr(4), supplier: "Shree Sai Distributors", productId: "p4", qty: 48, costPerUnit: 150, invoiceNo: "SSD/2260" },
    ],
    settings,
    sessionUserId: null,
    nextBillNumber: 1001 + bills.length,
  };
}
