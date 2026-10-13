import type { Bill } from "@/types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar date as YYYY-MM-DD (sorts correctly in spreadsheets). */
const dayOf = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** Local clock time as HH:MM. */
const clockOf = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Payment method label for a bill — "CASH", "UPI", "CARD" or "SPLIT (CASH + UPI)". */
export const billMethod = (b: Bill) =>
  b.payments.length > 1
    ? `SPLIT (${b.payments.map((p) => p.method.toUpperCase()).join(" + ")})`
    : (b.payments[0]?.method ?? "").toUpperCase();

/** Wrap a field in quotes when it contains a comma, quote or newline. */
const esc = (value: string | number) => {
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const CSV_HEADER = [
  "Bill",
  "Date",
  "Time",
  "Table",
  "Cashier",
  "Payment method",
  "Amount (INR)",
  "UPI reference",
];

/** Build a CSV (comma separated, CRLF lines) from a list of bills. */
export function billsToCsv(bills: Bill[]): string {
  const rows = bills.map((b) => [
    `#${b.number}`,
    dayOf(b.createdAt),
    clockOf(b.createdAt),
    b.tableName,
    b.cashierName,
    billMethod(b),
    b.total.toFixed(2),
    b.paymentRef ?? "",
  ]);
  return [CSV_HEADER, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
}

/** Trigger a browser download of the given CSV text. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Suggested file name for an export, e.g. bills-2026-10-05.csv */
export const csvFileName = (when = new Date()) =>
  `bills-${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}.csv`;
