"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <div
      className="rounded-2xl p-8 shadow-2xl border border-white/10"
      style={{ background: "rgba(255,255,255,0.08)", backdropFilter: "blur(16px)" }}
    >
      <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
      <p className="text-purple-200/70 text-sm mb-8">Sign in to your account</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-purple-100/80 mb-1.5">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all border border-white/15"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-purple-100/80">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-purple-300 hover:text-pink-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all border border-white/15"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
        </div>

        {error && (
          <div className="rounded-xl px-4 py-3 text-sm text-red-300 border border-red-400/30"
               style={{ background: "rgba(239,68,68,0.1)" }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full text-white font-semibold py-3 px-4 rounded-full transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/30 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)" }}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <p className="text-center text-sm text-white/40 mt-6">
        New to Fraser Valley Chess?{" "}
        <Link href="/register" className="text-purple-300 hover:text-pink-300 font-medium transition-colors">
          Create an account
        </Link>
      </p>
    </div>
  );
}
