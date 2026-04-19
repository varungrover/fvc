"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function CheckoutForm({
  enrollmentId,
  amount,
  courseTitle,
}: {
  enrollmentId: string;
  amount: number;
  courseTitle: string;
}) {
  const router = useRouter();
  const [payMethod, setPayMethod] = useState<"saved" | "new">("new");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Format card number with spaces
  function formatCardNumber(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  // Format expiry as MM/YY
  function formatExpiry(val: string) {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (payMethod === "new") {
      const rawCard = cardNumber.replace(/\s/g, "");
      if (rawCard.length < 16) {
        setError("Please enter a valid 16-digit card number.");
        return;
      }
      if (expiry.length < 5) {
        setError("Please enter a valid expiry date (MM/YY).");
        return;
      }
      if (cvc.length < 3) {
        setError("Please enter a valid CVC.");
        return;
      }
    }

    setLoading(true);

    // Simulate payment processing (2-second delay)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock: 90% success rate
    const success = Math.random() > 0.1;

    if (success) {
      // Update enrollment status in Supabase
      const supabase = createClient();
      await supabase
        .from("enrollments")
        .update({ status: "active" })
        .eq("id", enrollmentId);

      router.push(`/checkout/confirmation?enrollment=${enrollmentId}&status=success`);
    } else {
      router.push(`/checkout/confirmation?enrollment=${enrollmentId}&status=failed`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment method selection */}
      <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Payment method</h2>

        {/* Saved card option */}
        <label
          className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all mb-3 ${
            payMethod === "saved"
              ? "border-primary bg-primary/5"
              : "border-border-dark hover:border-slate-600"
          }`}
        >
          <input
            type="radio"
            name="payMethod"
            checked={payMethod === "saved"}
            onChange={() => setPayMethod("saved")}
            className="accent-primary"
          />
          <div className="flex items-center gap-3 flex-1">
            <div className="w-12 h-8 bg-gradient-to-br from-purple-600 to-purple-800 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold tracking-wider">VISA</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">•••• •••• •••• 4242</p>
              <p className="text-slate-500 text-xs">Expires 12/28</p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium">Default</span>
        </label>

        {/* New card option */}
        <label
          className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all ${
            payMethod === "new"
              ? "border-primary bg-primary/5"
              : "border-border-dark hover:border-slate-600"
          }`}
        >
          <input
            type="radio"
            name="payMethod"
            checked={payMethod === "new"}
            onChange={() => setPayMethod("new")}
            className="accent-primary"
          />
          <div className="flex items-center gap-3">
            <div className="w-12 h-8 bg-surface-dark border border-border-dark rounded-md flex items-center justify-center">
              <span className="material-icons-round text-slate-500 text-base">add_card</span>
            </div>
            <p className="text-white text-sm font-medium">Use a new card</p>
          </div>
        </label>
      </div>

      {/* New card form */}
      {payMethod === "new" && (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-900 mb-1">Card details</h2>
          <p className="text-slate-500 text-xs mb-3">
            This is a demo — no real payment will be processed.
          </p>

          {/* Cardholder name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Cardholder name
            </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="Full name on card"
              className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Card number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Card number
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full border border-border-dark rounded-lg py-3 px-3 pr-12 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-mono tracking-wider"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-icons-round text-slate-500 text-xl">
                credit_card
              </span>
            </div>
          </div>

          {/* Expiry + CVC */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Expiry date
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">CVC</label>
              <div className="relative">
                <input
                  type="text"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  maxLength={4}
                  className="w-full border border-border-dark rounded-lg py-3 px-3 pr-10 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm font-mono"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-icons-round text-slate-500 text-base">
                  lock
                </span>
              </div>
            </div>
          </div>

          {/* Save card checkbox */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="accent-primary rounded"
            />
            <span className="text-sm text-slate-700">Save this card for future payments</span>
          </label>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm flex items-center gap-2">
          <span className="material-icons-round text-base">error_outline</span>
          {error}
        </div>
      )}

      {/* Security note */}
      <div className="flex items-center gap-2 px-1">
        <span className="material-icons-round text-slate-500 text-base">verified_user</span>
        <p className="text-xs text-slate-500">
          Payments are securely processed. Your card details are encrypted end-to-end.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-purple-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-4 rounded-lg shadow-[0_0_12px_rgba(168,85,247,0.25)] hover:shadow-[0_0_20px_rgba(168,85,247,0.35)] transition-all duration-200 text-sm flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing payment…
          </>
        ) : (
          <>
            <span className="material-icons-round text-lg">lock</span>
            Pay ${amount}
          </>
        )}
      </button>
    </form>
  );
}
