"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type DNCEntry = {
  id: string;
  email: string;
  reason: string | null;
  added_at: string;
};

export default function DNCClient({ initialEntries }: { initialEntries: DNCEntry[] }) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { error: err } = await supabase.from("do_not_contact").insert({
      email: email.trim().toLowerCase(),
      reason: reason.trim() || null,
    });

    if (err) {
      setError(err.code === "23505" ? "This email is already on the DNC list." : err.message);
      setLoading(false);
      return;
    }

    setEmail("");
    setReason("");
    setLoading(false);
    router.refresh();
  }

  async function handleRemove(id: string) {
    setRemoving(id);
    const supabase = createClient();
    await supabase.from("do_not_contact").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    setRemoving(null);
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form onSubmit={handleAdd} className="bg-card-dark border border-border-dark rounded-xl p-6">
        <h2 className="text-base font-bold text-white mb-4">Add to DNC List</h2>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-medium text-slate-400 mb-1">Email address *</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@example.com"
              className="w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-xs font-medium text-slate-400 mb-1">Reason</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Opted out, unsubscribed, etc."
              className="w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-error hover:bg-red-600 disabled:opacity-60 text-white font-medium py-2.5 px-5 rounded-lg text-sm flex items-center gap-2 transition-all"
          >
            <span className="material-icons-round text-[16px]">block</span>
            {loading ? "Adding…" : "Add to DNC"}
          </button>
        </div>
        {error && <p className="text-error text-sm mt-3 bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>}
      </form>

      {/* DNC table */}
      <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-dark flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Do-Not-Contact List</h2>
            <p className="text-xs text-slate-500 mt-0.5">These addresses are excluded from all campaign sends.</p>
          </div>
          <span className="text-sm font-bold text-error">{entries.length}</span>
        </div>

        {entries.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <span className="material-icons-round text-[40px] text-slate-700 block mb-2">check_circle</span>
            <p className="text-slate-500 text-sm">No opt-outs yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50 border-b border-border-dark">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reason</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Added</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {entries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-card-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-white font-mono">{entry.email}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-400">{entry.reason ?? "—"}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-500">
                        {new Date(entry.added_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleRemove(entry.id)}
                        disabled={removing === entry.id}
                        className="text-xs text-slate-500 hover:text-error transition-colors font-medium"
                      >
                        {removing === entry.id ? "Removing…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
