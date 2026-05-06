import type { Invoice, InvoiceLineItem, PaymentMethod } from "@/lib/types";

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm_raj_visa",
    customerId: "cust_raj",
    stripePmId: "pm_demo_raj_visa",
    last4: "4242",
    cardBrand: "visa",
    expMonth: 8,
    expYear: 2027,
    isDefault: true,
  },
  {
    id: "pm_raj_mc",
    customerId: "cust_raj",
    stripePmId: "pm_demo_raj_mc",
    last4: "1881",
    cardBrand: "mastercard",
    expMonth: 3,
    expYear: 2028,
    isDefault: false,
  },
];

/**
 * Three months of paid invoices (Feb / Mar / Apr 2026) plus one failed May
 * invoice — surfaced on dashboards as "1 missed payment".
 *
 * Each month bundles all of Raj's family enrollments into one invoice.
 */

const RAJ_MONTHLY_TOTAL = 139 + 159 + 169 + 129; // chess_pp + chess_rr + math_g7 + finance_basics
const RAJ_TAX = Math.round(RAJ_MONTHLY_TOTAL * 0.05 * 100) / 100; // 5% GST
const RAJ_GROSS = RAJ_MONTHLY_TOTAL + RAJ_TAX;

function rajInvoice(month: string, status: "paid" | "failed", id: string): Invoice {
  return {
    id,
    customerId: "cust_raj",
    paymentMethodId: "pm_raj_visa",
    amount: RAJ_MONTHLY_TOTAL,
    tax: RAJ_TAX,
    discount: 0,
    total: RAJ_GROSS,
    status,
    stripePiId: `pi_demo_${id}`,
    issuedAt: `2026-${month}-01T08:00:00Z`,
    paidAt: status === "paid" ? `2026-${month}-01T08:00:12Z` : undefined,
  };
}

export const INVOICES: Invoice[] = [
  rajInvoice("02", "paid", "inv_raj_feb"),
  rajInvoice("03", "paid", "inv_raj_mar"),
  rajInvoice("04", "paid", "inv_raj_apr"),
  rajInvoice("05", "failed", "inv_raj_may"),
  // Other customers — minimal stubs for admin payment list
  {
    id: "inv_chen_apr",
    customerId: "cust_chen",
    amount: 298,
    tax: 14.9,
    discount: 0,
    total: 312.9,
    status: "paid",
    issuedAt: "2026-04-01T08:00:00Z",
    paidAt: "2026-04-01T08:01:00Z",
  },
  {
    id: "inv_kumar_apr",
    customerId: "cust_kumar",
    amount: 298,
    tax: 14.9,
    discount: 0,
    total: 312.9,
    status: "paid",
    issuedAt: "2026-04-01T08:00:00Z",
    paidAt: "2026-04-01T08:01:00Z",
  },
  {
    id: "inv_oconnor_apr",
    customerId: "cust_oconnor",
    amount: 139,
    tax: 6.95,
    discount: 0,
    total: 145.95,
    status: "failed",
    issuedAt: "2026-04-01T08:00:00Z",
  },
];

export const INVOICE_BY_ID: Record<string, Invoice> = Object.fromEntries(
  INVOICES.map((i) => [i.id, i]),
);

export const INVOICES_BY_CUSTOMER: Record<string, Invoice[]> = INVOICES.reduce(
  (acc, i) => {
    (acc[i.customerId] ??= []).push(i);
    return acc;
  },
  {} as Record<string, Invoice[]>,
);

export const INVOICE_LINE_ITEMS: InvoiceLineItem[] = [
  // Raj's April invoice broken into per-enrollment lines
  {
    id: "li_raj_apr_chess_aarav",
    invoiceId: "inv_raj_apr",
    description: "Chess PP (Mon) — Aarav Sharma",
    amount: 139,
    referenceType: "enrollment",
    referenceId: "enr_aarav_chess",
  },
  {
    id: "li_raj_apr_chess_anaya",
    invoiceId: "inv_raj_apr",
    description: "Chess RR (Tue) — Anaya Sharma",
    amount: 159,
    referenceType: "enrollment",
    referenceId: "enr_anaya_chess",
  },
  {
    id: "li_raj_apr_math_anaya",
    invoiceId: "inv_raj_apr",
    description: "Math Grade 7 (Wed) — Anaya Sharma",
    amount: 169,
    referenceType: "enrollment",
    referenceId: "enr_anaya_math",
  },
  {
    id: "li_raj_apr_finance",
    invoiceId: "inv_raj_apr",
    description: "Money Basics (Sat) — Raj Sharma",
    amount: 129,
    referenceType: "enrollment",
    referenceId: "enr_raj_finance",
  },
];
