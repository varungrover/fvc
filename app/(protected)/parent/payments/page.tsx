import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Mock payment data — will be replaced with real Stripe data later
const MOCK_PAYMENTS = [
  {
    id: "pay_1",
    date: "2026-04-01",
    description: "Intermediate Club — Monthly Fee (Apr)",
    student: "Arjun Grover",
    amount: 120,
    status: "paid",
    method: "Visa •••• 4242",
    receiptId: "FVC-A8K2M1",
  },
  {
    id: "pay_2",
    date: "2026-03-15",
    description: "Beginner Trial Class",
    student: "Maya Grover",
    amount: 0,
    status: "paid",
    method: "—",
    receiptId: "FVC-B3N7P4",
  },
  {
    id: "pay_3",
    date: "2026-03-01",
    description: "Intermediate Club — Monthly Fee (Mar)",
    student: "Arjun Grover",
    amount: 120,
    status: "paid",
    method: "Visa •••• 4242",
    receiptId: "FVC-C1R9Q2",
  },
  {
    id: "pay_4",
    date: "2026-02-01",
    description: "Intermediate Club — Monthly Fee (Feb)",
    student: "Arjun Grover",
    amount: 120,
    status: "paid",
    method: "Visa •••• 4242",
    receiptId: "FVC-D5T3V8",
  },
  {
    id: "pay_5",
    date: "2026-04-15",
    description: "Intermediate Club — Monthly Fee (May)",
    student: "Arjun Grover",
    amount: 120,
    status: "upcoming",
    method: "Visa •••• 4242",
    receiptId: null,
  },
];

const STATUS_CONFIG: Record<string, { label: string; classes: string; icon: string }> = {
  paid: {
    label: "Paid",
    classes: "bg-success/10 text-success",
    icon: "check_circle",
  },
  pending: {
    label: "Pending",
    classes: "bg-warning/10 text-warning",
    icon: "schedule",
  },
  failed: {
    label: "Failed",
    classes: "bg-error/10 text-error",
    icon: "error",
  },
  refunded: {
    label: "Refunded",
    classes: "bg-slate-700 text-slate-400",
    icon: "undo",
  },
  upcoming: {
    label: "Upcoming",
    classes: "bg-primary/10 text-primary",
    icon: "event",
  },
};

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PaymentHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Calculate summary from mock data
  const totalPaid = MOCK_PAYMENTS.filter((p) => p.status === "paid").reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const upcomingAmount = MOCK_PAYMENTS.filter((p) => p.status === "upcoming").reduce(
    (sum, p) => sum + p.amount,
    0
  );

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment History</h1>
          <p className="text-slate-400 text-sm mt-1">
            View your transactions, invoices, and receipts.
          </p>
        </div>
        <Link
          href="/parent/payments/methods"
          className="flex items-center gap-2 border border-border-dark bg-surface-dark hover:bg-surface-hover text-slate-200 font-medium py-2.5 px-4 rounded-lg text-sm transition-all"
        >
          <span className="material-icons-round text-[18px]">credit_card</span>
          Payment methods
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card-dark border border-border-dark rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center flex-shrink-0">
            <span className="material-icons-round text-success text-xl">account_balance_wallet</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Paid</p>
            <p className="text-2xl font-bold text-white mt-0.5">${totalPaid}</p>
            <p className="text-xs text-slate-500 mt-0.5">All time</p>
          </div>
        </div>

        <div className="bg-card-dark border border-border-dark rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
            <span className="material-icons-round text-primary text-xl">event_upcoming</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Next Payment</p>
            <p className="text-2xl font-bold text-white mt-0.5">${upcomingAmount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Due Apr 15</p>
          </div>
        </div>

        <div className="bg-card-dark border border-border-dark rounded-xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple/15 flex items-center justify-center flex-shrink-0">
            <span className="material-icons-round text-purple text-xl">receipt_long</span>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Invoices</p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {MOCK_PAYMENTS.filter((p) => p.status === "paid").length}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">Total receipts</p>
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-dark flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Transactions</h2>
          <span className="text-xs text-slate-500">{MOCK_PAYMENTS.length} total</span>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="bg-[#151c2b] border-b border-border-dark">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                  Description
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                  Student
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                  Amount
                </th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                  Receipt
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-dark">
              {MOCK_PAYMENTS.map((payment) => {
                const statusCfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
                return (
                  <tr
                    key={payment.id}
                    className="hover:bg-card-hover transition-colors duration-150"
                  >
                    <td className="px-5 py-3.5 text-sm text-slate-300 whitespace-nowrap">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-white font-medium">{payment.description}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{payment.method}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-300">{payment.student}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-white font-semibold">
                        {payment.amount === 0 ? "Free" : `$${payment.amount}`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.classes}`}
                      >
                        <span className="material-icons-round text-[12px]">{statusCfg.icon}</span>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {payment.receiptId ? (
                        <button className="text-xs text-primary hover:text-purple-300 font-medium transition-colors inline-flex items-center gap-1">
                          <span className="material-icons-round text-[14px]">download</span>
                          {payment.receiptId}
                        </button>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <div className="md:hidden divide-y divide-border-dark">
          {MOCK_PAYMENTS.map((payment) => {
            const statusCfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
            return (
              <div key={payment.id} className="px-5 py-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{payment.description}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(payment.date)} · {payment.student}
                    </p>
                  </div>
                  <span className="text-sm text-white font-semibold flex-shrink-0">
                    {payment.amount === 0 ? "Free" : `$${payment.amount}`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusCfg.classes}`}
                  >
                    <span className="material-icons-round text-[12px]">{statusCfg.icon}</span>
                    {statusCfg.label}
                  </span>
                  {payment.receiptId && (
                    <button className="text-xs text-primary font-medium">
                      Download receipt
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
