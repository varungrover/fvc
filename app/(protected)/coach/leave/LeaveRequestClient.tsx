"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LeaveRequestClient({
  coachId,
  initialLeaves,
}: {
  coachId: string;
  initialLeaves: any[];
}) {
  const supabase = createClient();
  const [leaves, setLeaves] = useState(initialLeaves);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    start_date: "",
    end_date: "",
    reason: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("coach_leaves")
      .insert({
        coach_id: coachId,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
      })
      .select("*")
      .single();

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }

    setLeaves([data, ...leaves]);
    setShowForm(false);
    setFormData({ start_date: "", end_date: "", reason: "" });
  }

  function getStatusStyle(s: string) {
    if (s === "pending") return "bg-warning/10 text-warning border-warning/20";
    if (s === "approved") return "bg-success/10 text-success border-success/20";
    if (s === "rejected") return "bg-error/10 text-error border-error/20";
    return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-900 font-bold">Your Leave History</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary hover:bg-purple-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(168,85,247,0.2)]"
        >
          <span className="material-icons-round text-[18px]">add</span>
          New Leave Request
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card-dark border border-primary/30 rounded-xl p-5 mb-6">
          <h3 className="text-gray-900 font-bold mb-4">Request Leave</h3>
          {error && <div className="text-error text-sm mb-3">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Start Date</label>
              <input
                type="date"
                required
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">End Date</label>
              <input
                type="date"
                required
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Reason (Optional)</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="Vacation, personal, etc."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !formData.start_date || !formData.end_date}
              className="bg-primary hover:bg-purple-600 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
            >
              {loading ? "Submitting..." : "Submit request"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-500 hover:text-white px-4 py-2 text-sm transition-colors border border-border-dark rounded-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {leaves.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-8 text-center">
          <span className="material-icons-round text-4xl text-slate-600 mb-3">event_available</span>
          <p className="text-white font-medium">No leave requests</p>
          <p className="text-slate-500 text-sm mt-1">You haven't requested any time off yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaves.map((l) => (
            <div key={l.id} className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-gray-900 font-semibold text-sm">
                    {new Date(l.start_date).toLocaleDateString()} — {new Date(l.end_date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusStyle(l.status)}`}>
                  {l.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm flex-1">{l.reason || "No reason provided"}</p>
              
              {l.admin_note && (
                <div className="mt-4 pt-4 border-t border-border-dark">
                  <p className="text-[11px] text-slate-500 uppercase font-bold mb-0.5">Admin Note</p>
                  <p className="text-xs text-slate-700">{l.admin_note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
