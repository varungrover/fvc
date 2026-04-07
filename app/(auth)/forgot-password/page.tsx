"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) {
    return (
      <div className="bg-card-dark border border-border-dark rounded-2xl p-8 shadow-xl text-center">
        <div className="w-14 h-14 bg-success/10 border border-success/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-icons-round text-success">mark_email_read</span>
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Check your inbox</h1>
        <p className="text-slate-400 text-sm mb-6">
          We sent a password reset link to <span className="text-white font-medium">{email}</span>.
          Check your spam folder if you don&apos;t see it.
        </p>
        <Link
          href="/login"
          className="text-primary hover:text-blue-400 text-sm font-medium transition-colors"
        >
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card-dark border border-border-dark rounded-2xl p-8 shadow-xl">
      <h1 className="text-2xl font-bold text-white mb-1">Reset your password</h1>
      <p className="text-slate-400 text-sm mb-8">
        Enter your email and we&apos;ll send you a reset link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg shadow-[0_0_10px_rgba(43,108,238,0.2)] transition-all duration-200"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        <Link href="/login" className="text-primary hover:text-blue-400 font-medium transition-colors">
          ← Back to sign in
        </Link>
      </p>
    </div>
  );
}
