import Link from "next/link";

export default function CheckoutPage() {
  return (
    <div className="p-8 max-w-xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Checkout</h1>
        <p className="text-slate-400 text-sm mt-1">Complete your enrollment payment.</p>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <span className="material-icons-round text-primary text-[32px]">payments</span>
        </div>
        <h2 className="text-lg font-bold text-white">Payment coming soon</h2>
        <p className="text-slate-400 text-sm max-w-sm mx-auto">
          Stripe payment processing will be integrated in the next stage. Your enrollment has been saved — we'll notify you when payment is ready.
        </p>
        <Link
          href="/parent/enrollments"
          className="inline-flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-all mt-2"
        >
          View my enrollments
        </Link>
      </div>
    </div>
  );
}
