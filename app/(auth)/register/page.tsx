"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role: "parent" },
      },
    });

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
      <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
      <p className="text-purple-200/70 text-sm mb-8">
        Register as a parent to enroll your children
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-100/80 mb-1.5">
            Full name
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Smith"
            className="w-full rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all border border-white/15"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
        </div>

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
          <label className="block text-sm font-medium text-purple-100/80 mb-1.5">
            Phone number <span className="text-white/30">(optional)</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 604 000 0000"
            className="w-full rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all border border-white/15"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-100/80 mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            className="w-full rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all border border-white/15"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-purple-100/80 mb-1.5">
            Confirm password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Creating account…" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm text-white/40 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-purple-300 hover:text-pink-300 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
