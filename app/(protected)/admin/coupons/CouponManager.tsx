"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  used_count: number;
  applicable_to: string | null;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
};

export default function CouponManager({ initialCoupons }: { initialCoupons: Coupon[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    max_uses: "",
    applicable_to: "all",
    valid_from: "",
    valid_until: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: err } = await supabase.from("coupons").insert({
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      applicable_to: form.applicable_to,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
      is_active: true,
    });

    if (err) {
      setError(err.code === "23505" ? "A coupon with this code already exists." : err.message);
      setLoading(false);
      return;
    }

    setForm({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      max_uses: "",
      applicable_to: "all",
      valid_from: "",
      valid_until: "",
    });
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  async function toggleActive(coupon: Coupon) {
    const supabase = createClient();
    await supabase
      .from("coupons")
      .update({ is_active: !coupon.is_active })
      .eq("id", coupon.id);
    router.refresh();
  }

  const inputClass =
    "w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm";

  return (
    <div className="space-y-6">
      {/* Create button / form */}
      {showForm ? (
        <form
          onSubmit={handleCreate}
          className="bg-card-dark border border-primary/30 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-white">Create Coupon</h2>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <span className="material-icons-round text-[20px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Code *</label>
              <input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. SUMMER25"
                className={`${inputClass} uppercase font-mono tracking-wider`}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What's this coupon for?"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Discount type *
              </label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className={inputClass}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Value * ({form.discount_type === "percentage" ? "%" : "$"})
              </label>
              <input
                type="number"
                required
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                min={0}
                step={form.discount_type === "percentage" ? "1" : "0.01"}
                placeholder={form.discount_type === "percentage" ? "10" : "20.00"}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Max uses</label>
              <input
                type="number"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                placeholder="Unlimited"
                min={1}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Applies to</label>
              <select
                value={form.applicable_to}
                onChange={(e) => setForm({ ...form, applicable_to: e.target.value })}
                className={inputClass}
              >
                <option value="all">All course types</option>
                <option value="lesson">Lessons only</option>
                <option value="club">Clubs only</option>
                <option value="camp">Camps only</option>
                <option value="tournament">Tournaments only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Valid from</label>
              <input
                type="date"
                value={form.valid_from}
                onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Valid until</label>
              <input
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-blue-600 disabled:opacity-60 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-all"
            >
              {loading ? "Creating…" : "Create coupon"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-border-dark text-slate-300 hover:text-white py-2.5 px-5 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary hover:bg-blue-600 text-white font-medium py-2.5 px-5 rounded-lg text-sm shadow-[0_0_10px_rgba(43,108,238,0.2)] transition-all"
        >
          <span className="material-icons-round text-lg">add</span>
          Create coupon
        </button>
      )}

      {/* Coupons list */}
      <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-dark">
          <h2 className="text-base font-bold text-white">
            All Coupons ({initialCoupons.length})
          </h2>
        </div>

        {initialCoupons.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-500 text-sm">
            No coupons created yet
          </div>
        ) : (
          <div className="divide-y divide-border-dark">
            {initialCoupons.map((coupon) => {
              const isExpired =
                coupon.valid_until && new Date(coupon.valid_until) < new Date();
              const usedUp =
                coupon.max_uses !== null && coupon.used_count >= coupon.max_uses;

              return (
                <div
                  key={coupon.id}
                  className={`px-5 py-4 flex items-center gap-4 flex-wrap ${!coupon.is_active || isExpired ? "opacity-50" : ""}`}
                >
                  {/* Code badge */}
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <span className="text-sm font-bold font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-lg tracking-wider">
                      {coupon.code}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="flex-1 min-w-[200px]">
                    <p className="text-sm text-white">{coupon.description ?? "—"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}% off`
                        : `$${coupon.discount_value} off`}
                      {coupon.applicable_to && coupon.applicable_to !== "all"
                        ? ` · ${coupon.applicable_to}s only`
                        : " · all types"}
                    </p>
                  </div>

                  {/* Usage */}
                  <div className="text-right min-w-[80px]">
                    <p className="text-sm text-white font-medium">
                      {coupon.used_count}
                      {coupon.max_uses !== null && (
                        <span className="text-slate-500">/{coupon.max_uses}</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">used</p>
                  </div>

                  {/* Status */}
                  <div className="min-w-[80px]">
                    {isExpired ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-error/10 text-error">
                        Expired
                      </span>
                    ) : usedUp ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                        Used up
                      </span>
                    ) : coupon.is_active ? (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                        Disabled
                      </span>
                    )}
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                      coupon.is_active
                        ? "text-error hover:bg-error/10"
                        : "text-success hover:bg-success/10"
                    }`}
                  >
                    {coupon.is_active ? "Disable" : "Enable"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
