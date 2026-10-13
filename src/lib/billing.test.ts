import { describe, expect, it } from "vitest";
import { calcTotals, isSplitValid, makeServingSizes, servingPrice, splitRemaining } from "./billing";

const items = [
  { productId: "a", name: "A", price: 220, qty: 2 },
  { productId: "b", name: "B", price: 180, qty: 1 },
];

describe("billing", () => {
  it("computes subtotal, discount, tax, round-off", () => {
    const t = calcTotals(items, 10, 5);
    expect(t.subtotal).toBe(620);
    expect(t.discount).toBe(62);
    expect(t.tax).toBe(27.9);
    expect(t.total).toBe(586);
    expect(t.roundOff).toBe(0.1);
    expect(t.itemCount).toBe(3);
  });
  it("validates split payments", () => {
    expect(isSplitValid(500, [{ method: "cash", amount: 200 }, { method: "upi", amount: 300 }])).toBe(true);
    expect(splitRemaining(500, [{ method: "cash", amount: 200 }])).toBe(300);
  });
  it("prices measured servings from the product base unit", () => {
    expect(servingPrice(90, 30, 90)).toBe(270);
    expect(makeServingSizes({ price: 120, unit: "30 ml" }, [30, 60, 90])).toEqual([
      { ml: 30, price: 120 },
      { ml: 60, price: 240 },
      { ml: 90, price: 360 },
    ]);
  });
});
