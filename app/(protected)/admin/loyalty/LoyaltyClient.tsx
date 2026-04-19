"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const TRIGGER_TYPES = [
  { value: "classes_attended", label: "Classes attended" },
  { value: "referral", label: "Referral enrolled" },
  { value: "tournament_win", label: "Tournament win" },
  { value: "enrollment", label: "New enrollment" },
];

const REWARD_TYPES = [
  { value: "points", label: "Bonus points" },
  { value: "credit", label: "Account credit ($)" },
  { value: "free_class", label: "Free class" },
  { value: "coupon", label: "Auto-apply coupon" },
];

const TRIGGER_ICONS: Record<string, string> = {
  classes_attended: "school",
  referral: "group_add",
  tournament_win: "emoji_events",
  enrollment: "assignment_turned_in",
};

const REWARD_COLORS: Record<string, string> = {
  points: "text-primary",
  credit: "text-success",
  free_class: "text-warning",
  coupon: "text-purple",
};

type LoyaltyRule = {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_threshold: number | null;
  reward_type: string;
  reward_value: number | null;
  reward_label: string | null;
  is_active: boolean;
};

const EMPTY_FORM = {
  name: "",
  description: "",
  trigger_type: "classes_attended",
  trigger_threshold: "",
  reward_type: "points",
  reward_value: "",
  reward_label: "",
};

export default function LoyaltyClient({ initialRules }: { initialRules: LoyaltyRule[] }) {
  const router = useRouter();
  const [rules, setRules] = useState(initialRules);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const inputClass =
    "w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm";

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { error: err } = await supabase.from("loyalty_rules").insert({
      name: form.name.trim(),
      description: form.description.trim() || null,
      trigger_type: form.trigger_type,
      trigger_threshold: form.trigger_threshold ? parseInt(form.trigger_threshold) : null,
      reward_type: form.reward_type,
      reward_value: form.reward_value ? parseFloat(form.reward_value) : null,
      reward_label: form.reward_label.trim() || null,
      is_active: true,
    });

    if (err) { setError(err.message); setLoading(false); return; }

    setForm({ ...EMPTY_FORM });
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  async function toggleRule(rule: LoyaltyRule) {
    const supabase = createClient();
    await supabase.from("loyalty_rules").update({ is_active: !rule.is_active }).eq("id", rule.id);
    setRules((prev) => prev.map((r) => r.id === rule.id ? { ...r, is_active: !r.is_active } : r));
  }

  return (
    <div className="space-y-6">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary hover:bg-purple-600 text-white font-medium py-2.5 px-5 rounded-lg text-sm shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all"
        >
          <span className="material-icons-round text-lg">add</span>
          New rule
        </button>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-card-dark border border-primary/30 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-gray-900">New Loyalty Rule</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
              <span className="material-icons-round text-[20px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Rule name *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="e.g. 10-Class Milestone" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="What triggers this reward?" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Trigger *</label>
              <select value={form.trigger_type} onChange={(e) => setForm({ ...form, trigger_type: e.target.value })} className={inputClass}>
                {TRIGGER_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Threshold (count)</label>
              <input type="number" min={1} value={form.trigger_threshold} onChange={(e) => setForm({ ...form, trigger_threshold: e.target.value })} className={inputClass} placeholder="e.g. 10 classes" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Reward type *</label>
              <select value={form.reward_type} onChange={(e) => setForm({ ...form, reward_type: e.target.value })} className={inputClass}>
                {REWARD_TYPES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Reward value {form.reward_type === "points" ? "(pts)" : form.reward_type === "credit" ? "($)" : "(qty)"}
              </label>
              <input type="number" min={0} step="0.01" value={form.reward_value} onChange={(e) => setForm({ ...form, reward_value: e.target.value })} className={inputClass} placeholder="e.g. 500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-500 mb-1">Reward label (shown to students)</label>
              <input value={form.reward_label} onChange={(e) => setForm({ ...form, reward_label: e.target.value })} className={inputClass} placeholder="e.g. $20 account credit" />
            </div>
          </div>

          {error && <p className="text-error text-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="bg-primary hover:bg-purple-600 disabled:opacity-60 text-white font-medium py-2.5 px-6 rounded-lg text-sm">
              {loading ? "Saving…" : "Create rule"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border-dark text-slate-700 hover:text-white py-2.5 px-5 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Rules list */}
      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-card-dark border rounded-xl p-5 transition-all ${rule.is_active ? "border-border-dark" : "border-border-dark opacity-50"}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-surface-dark border border-border-dark flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-round text-slate-500 text-[20px]">
                    {TRIGGER_ICONS[rule.trigger_type] ?? "stars"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-gray-900 font-semibold text-sm">{rule.name}</p>
                    {!rule.is_active && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-500">Inactive</span>
                    )}
                  </div>
                  {rule.description && (
                    <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="material-icons-round text-[12px]">trigger</span>
                      {TRIGGER_TYPES.find((t) => t.value === rule.trigger_type)?.label}
                      {rule.trigger_threshold !== null && ` × ${rule.trigger_threshold}`}
                    </span>
                    <span className="text-slate-700">→</span>
                    <span className={`text-xs font-semibold flex items-center gap-1 ${REWARD_COLORS[rule.reward_type] ?? "text-white"}`}>
                      <span className="material-icons-round text-[12px]">card_giftcard</span>
                      {rule.reward_label ?? `${rule.reward_value} ${rule.reward_type}`}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => toggleRule(rule)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                  rule.is_active ? "text-error hover:bg-error/10" : "text-success hover:bg-success/10"
                }`}
              >
                {rule.is_active ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {rules.length === 0 && (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-12 text-center">
          <span className="material-icons-round text-[40px] text-slate-600 block mb-3">card_giftcard</span>
          <p className="text-slate-500 font-medium">No loyalty rules yet</p>
          <p className="text-slate-500 text-sm mt-1">Create rules to automatically reward students for attendance, referrals, and wins.</p>
        </div>
      )}
    </div>
  );
}
