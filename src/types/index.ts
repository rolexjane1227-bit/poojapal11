export type Role = "admin" | "cashier";
export type TableStatus = "available" | "occupied" | "bill_pending";
export type PaymentMethod = "cash" | "upi" | "card";

export interface Category {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  unit: string; // e.g. "650ml", "30ml peg", "plate"
  stock: number;
  lowStockAt: number;
  active: boolean;
  servingSizes?: ServingSize[];
}

export interface ServingSize {
  ml: number;
  price: number;
}

export interface DiningTable {
  id: string;
  name: string;
  area: "Main Hall" | "AC Room" | "Terrace";
  seats: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  servingMl?: number;
  note?: string;
}

export interface Order {
  tableId: string;
  items: OrderItem[];
  discountPct: number;
  openedAt: string;
  cashierId: string;
  billRequested: boolean;
  guests: number;
}

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
}

export interface Bill {
  id: string;
  number: number;
  tableId: string;
  tableName: string;
  cashierId: string;
  cashierName: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  roundOff: number;
  total: number;
  payments: PaymentSplit[];
  paymentRef?: string;
  tendered?: number;
  change?: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  pin: string;
  role: Role;
  active: boolean;
  maxDiscountPct: number;
  phone: string;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface Purchase {
  id: string;
  date: string;
  supplier: string;
  productId: string;
  qty: number;
  costPerUnit: number;
  invoiceNo: string;
}

export interface Settings {
  shopName: string;
  address: string;
  phone: string;
  gstin: string;
  taxRatePct: number;
  receiptFooter: string;
  currency: string;
  upiId: string;
}

export interface AppState {
  users: User[];
  categories: Category[];
  products: Product[];
  tables: DiningTable[];
  orders: Record<string, Order>;
  bills: Bill[];
  expenses: Expense[];
  purchases: Purchase[];
  settings: Settings;
  sessionUserId: string | null;
  nextBillNumber: number;
}
