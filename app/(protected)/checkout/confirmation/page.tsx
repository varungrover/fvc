import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ enrollment?: string; status?: string }>;
}) {
  const { enrollment: enrollmentId, status } = await searchParams;
  const isSuccess = status === "success";

  let enrollment: any = null;
  if (enrollmentId) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("enrollments")
      .select(`
        id, status, enrolled_at,
        students(full_name),
        courses(title, type, price_monthly, locations(name))
      `)
      .eq("id", enrollmentId)
      .single();
    enrollment = data;
  }

  const course = enrollment?.courses;
  const student = enrollment?.students;

  // Generate a mock receipt number
  const receiptNumber = `FVC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const today = new Date().toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (isSuccess) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        <div className="bg-card-dark border border-border-dark rounded-2xl p-8 text-center">
          {/* Success icon with glow */}
          <div className="mb-6">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <span className="material-icons-round text-success text-[44px]">check_circle</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Payment successful!</h1>
          <p className="text-slate-400 text-sm mb-8">
            {student?.full_name} is now enrolled in{" "}
            <span className="text-white font-medium">{course?.title}</span>.
          </p>

          {/* Receipt card */}
          <div className="bg-surface-dark border border-border-dark rounded-xl p-5 text-left mb-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Receipt
              </p>
              <p className="text-xs text-slate-500 font-mono">{receiptNumber}</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Date</span>
                <span className="text-white">{today}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Course</span>
                <span className="text-white">{course?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Student</span>
                <span className="text-white">{student?.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location</span>
                <span className="text-white">{course?.locations?.name ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment method</span>
                <span className="text-white">Visa •••• 4242</span>
              </div>
              <div className="border-t border-border-dark pt-3 flex justify-between">
                <span className="text-white font-semibold">Amount paid</span>
                <span className="text-success font-bold">${course?.price_monthly ?? "0.00"}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/parent/enrollments"
              className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg text-sm transition-all shadow-[0_0_10px_rgba(43,108,238,0.2)] flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-lg">assignment</span>
              View my enrollments
            </Link>
            <Link
              href="/parent/payments"
              className="w-full border border-border-dark text-slate-300 hover:text-white hover:bg-surface-hover font-medium py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
            >
              <span className="material-icons-round text-lg">receipt_long</span>
              Payment history
            </Link>
            <Link
              href="/courses"
              className="text-sm text-primary hover:text-blue-400 font-medium transition-colors mt-1"
            >
              Browse more courses →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  return (
    <div className="p-8 max-w-lg mx-auto">
      <div className="bg-card-dark border border-border-dark rounded-2xl p-8 text-center">
        {/* Error icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            <span className="material-icons-round text-error text-[44px]">cancel</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Payment failed</h1>
        <p className="text-slate-400 text-sm mb-6">
          We couldn&apos;t process your payment. Please check your card details and try again.
        </p>

        {/* Error details */}
        <div className="bg-error/5 border border-error/20 rounded-xl p-4 text-left mb-6">
          <div className="flex items-start gap-3">
            <span className="material-icons-round text-error text-base mt-0.5">info</span>
            <div>
              <p className="text-sm font-medium text-error">Transaction declined</p>
              <p className="text-xs text-slate-400 mt-1">
                Your bank declined the transaction. This may be due to insufficient funds,
                incorrect card details, or a security hold. Please contact your bank or try a
                different card.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href={`/checkout?enrollment=${enrollmentId}`}
            className="w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg text-sm transition-all shadow-[0_0_10px_rgba(43,108,238,0.2)] flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-lg">refresh</span>
            Try again
          </Link>
          <Link
            href="/parent/payments/methods"
            className="w-full border border-border-dark text-slate-300 hover:text-white hover:bg-surface-hover font-medium py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
          >
            <span className="material-icons-round text-lg">credit_card</span>
            Use a different card
          </Link>
          <Link
            href="/parent/enrollments"
            className="text-sm text-slate-400 hover:text-white font-medium transition-colors mt-1"
          >
            ← Back to enrollments
          </Link>
        </div>
      </div>
    </div>
  );
}
