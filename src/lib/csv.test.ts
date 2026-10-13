import { describe, expect, it } from "vitest";
import type { Bill } from "@/types";
import { billMethod, billsToCsv, csvFileName } from "./csv";

const bill = (over: Partial<Bill> = {}): Bill => ({
  id: "b1",
  number: 42,
  tableId: "t1",
  tableName: "Main Hall 12",
  cashierId: "u1",
  cashierName: "Rahul",
  items: [],
  subtotal: 900,
  discount: 0,
  tax: 0,
  roundOff: 3,
  total: 903,
  payments: [{ method: "upi", amount: 903 }],
  paymentRef: "427199321180",
  createdAt: new Date(2026, 9, 5, 11, 9).toISOString(),
  ...over,
});

describe("billsToCsv", () => {
  it("writes a header plus one row per bill", () => {
    const lines = billsToCsv([bill()]).split("\r\n");
    expect(lines[0]).toBe("Bill,Date,Time,Table,Cashier,Payment method,Amount (INR),UPI reference");
    expect(lines[1]).toBe("#42,2026-10-05,11:09,Main Hall 12,Rahul,UPI,903.00,427199321180");
    expect(lines).toHaveLength(2);
  });

  it("quotes fields containing commas and doubles inner quotes", () => {
    const csv = billsToCsv([bill({ cashierName: 'Rahul, "Bhai" Patil' })]);
    expect(csv).toContain('"Rahul, ""Bhai"" Patil"');
  });

  it("leaves the UPI reference blank when none was entered", () => {
    const csv = billsToCsv([bill({ payments: [{ method: "cash", amount: 903 }], paymentRef: undefined })]);
    expect(csv.split("\r\n")[1]).toBe("#42,2026-10-05,11:09,Main Hall 12,Rahul,CASH,903.00,");
  });

  it("labels split payments with their parts", () => {
    const b = bill({ payments: [{ method: "cash", amount: 300 }, { method: "upi", amount: 603 }] });
    expect(billMethod(b)).toBe("SPLIT (CASH + UPI)");
    expect(billsToCsv([b])).toContain("SPLIT (CASH + UPI),903.00,427199321180");
  });

  it("returns only the header for an empty selection", () => {
    expect(billsToCsv([])).toBe("Bill,Date,Time,Table,Cashier,Payment method,Amount (INR),UPI reference");
  });
});

describe("csvFileName", () => {
  it("uses the local date", () => {
    expect(csvFileName(new Date(2026, 9, 5))).toBe("bills-2026-10-05.csv");
  });
});
