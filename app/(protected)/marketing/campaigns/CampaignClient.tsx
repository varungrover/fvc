"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const LIST_OPTIONS = [
  { value: "active_students", label: "Active Students" },
  { value: "trial_leads", label: "Trial Leads" },
  { value: "lapsed", label: "Lapsed Students" },
  { value: "all_leads", label: "All Leads" },
];

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-700 text-slate-300",
  sent: "bg-success/10 text-success",
};

type Campaign = {
  id: string;
  title: string;
  subject: string;
  body: string;
  list_type: string;
  status: string;
  recipient_count: number | null;
  sent_at: string | null;
  created_at: string;
};

type Location = { id: string; name: string };

const EMPTY_FORM = {
  title: "",
  subject: "",
  body: "",
  list_type: "active_students",
  location_id: "",
};

export default function CampaignClient({
  initialCampaigns,
  locations,
  defaultList,
}: {
  initialCampaigns: Campaign[];
  locations: Location[];
  defaultList?: string;
}) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY_FORM, list_type: defaultList ?? "active_students" });

  const inputClass =
    "w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm";

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const { error: err } = await supabase.from("email_campaigns").insert({
      title: form.title.trim(),
      subject: form.subject.trim(),
      body: form.body.trim(),
      list_type: form.list_type,
      location_id: form.location_id || null,
      status: "draft",
    });

    if (err) { setError(err.message); setLoading(false); return; }
    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  async function handleSend(campaign: Campaign) {
    setSending(campaign.id);
    const supabase = createClient();

    // Mock send — mark as sent with a simulated recipient count
    // (Real email sending would call Resend/SendGrid here)
    const mockCount = Math.floor(Math.random() * 80) + 20;
    await supabase.from("email_campaigns").update({
      status: "sent",
      recipient_count: mockCount,
      sent_at: new Date().toISOString(),
    }).eq("id", campaign.id);

    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaign.id
          ? { ...c, status: "sent", recipient_count: mockCount, sent_at: new Date().toISOString() }
          : c
      )
    );
    setSending(null);
  }

  return (
    <div className="space-y-6">
      {/* Create button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-primary hover:bg-purple-600 text-white font-medium py-2.5 px-5 rounded-lg text-sm shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all"
        >
          <span className="material-icons-round text-lg">add</span>
          New campaign
        </button>
      )}

      {/* Compose form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-card-dark border border-primary/30 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-white">New Campaign</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
              <span className="material-icons-round text-[20px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Campaign title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="e.g. Spring Enrollment Reminder" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email subject *</label>
              <input required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={inputClass} placeholder="e.g. Don't miss spring classes!" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Send to *</label>
              <select value={form.list_type} onChange={(e) => setForm({ ...form, list_type: e.target.value })} className={inputClass}>
                {LIST_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Location (optional)</label>
              <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })} className={inputClass}>
                <option value="">All locations</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Email body *</label>
              <textarea
                required
                rows={6}
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                className={inputClass}
                placeholder="Write your message here…"
              />
            </div>
          </div>

          {error && <p className="text-error text-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="bg-primary hover:bg-purple-600 disabled:opacity-60 text-white font-medium py-2.5 px-6 rounded-lg text-sm">
              {loading ? "Saving…" : "Save as draft"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border-dark text-slate-300 hover:text-white py-2.5 px-5 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Campaigns list */}
      <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-dark">
          <h2 className="text-base font-bold text-white">All Campaigns ({campaigns.length})</h2>
        </div>

        {campaigns.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-500 text-sm">
            No campaigns yet — create your first one.
          </div>
        ) : (
          <div className="divide-y divide-border-dark">
            {campaigns.map((c) => (
              <div key={c.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-semibold text-white">{c.title}</p>
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status] ?? ""}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-1">Subject: {c.subject}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="material-icons-round text-[12px]">group</span>
                        {LIST_OPTIONS.find((o) => o.value === c.list_type)?.label ?? c.list_type}
                      </span>
                      {c.status === "sent" && c.recipient_count !== null && (
                        <span className="flex items-center gap-1 text-success">
                          <span className="material-icons-round text-[12px]">check_circle</span>
                          Sent to {c.recipient_count} recipients
                        </span>
                      )}
                      {c.sent_at && (
                        <span>{new Date(c.sent_at).toLocaleDateString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                      )}
                      {!c.sent_at && (
                        <span>Created {new Date(c.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}</span>
                      )}
                    </div>
                  </div>
                  {c.status === "draft" && (
                    <button
                      onClick={() => handleSend(c)}
                      disabled={sending === c.id}
                      className="flex items-center gap-2 bg-success hover:bg-emerald-600 disabled:opacity-60 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                    >
                      {sending === c.id ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <>
                          <span className="material-icons-round text-[16px]">send</span>
                          Send now
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Body preview */}
                <div className="mt-3 bg-surface-dark border border-border-dark rounded-lg px-4 py-3">
                  <p className="text-xs text-slate-400 line-clamp-2">{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
