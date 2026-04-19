"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SOURCES = ["manual", "social", "referral", "walk_in", "website"] as const;
const STATUSES = ["new", "contacted", "trial_booked", "enrolled", "lost"] as const;

const STATUS_STYLES: Record<string, string> = {
  new: "bg-primary/10 text-primary border-primary/20",
  contacted: "bg-warning/10 text-warning border-warning/20",
  trial_booked: "bg-purple/10 text-purple border-purple/20",
  enrolled: "bg-success/10 text-success border-success/20",
  lost: "bg-slate-700 text-slate-400 border-slate-600",
};

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  source: string;
  status: string;
  location_id: string | null;
  notes: string | null;
  created_at: string;
};

type Location = { id: string; name: string };

const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  source: "manual",
  status: "new",
  location_id: "",
  notes: "",
};

export default function LeadsClient({
  initialLeads,
  locations,
}: {
  initialLeads: Lead[];
  locations: Location[];
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const inputClass =
    "w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary text-sm";

  function openCreate() {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setError("");
    setShowForm(true);
  }

  function openEdit(lead: Lead) {
    setEditId(lead.id);
    setForm({
      full_name: lead.full_name,
      email: lead.email,
      phone: lead.phone ?? "",
      source: lead.source,
      status: lead.status,
      location_id: lead.location_id ?? "",
      notes: lead.notes ?? "",
    });
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      source: form.source,
      status: form.status,
      location_id: form.location_id || null,
      notes: form.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (editId) {
      const { error: err } = await supabase.from("leads").update(payload).eq("id", editId);
      if (err) { setError(err.message); setLoading(false); return; }
    } else {
      const { error: err } = await supabase.from("leads").insert(payload);
      if (err) { setError(err.message); setLoading(false); return; }
    }

    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  async function handleStatusChange(id: string, status: string) {
    const supabase = createClient();
    await supabase.from("leads").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.full_name.toLowerCase().includes(search.toLowerCase()) ||
      l.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="w-full pl-9 pr-3 py-2.5 bg-surface-dark border border-border-dark rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-border-dark bg-surface-dark text-sm text-white rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-primary hover:bg-purple-600 text-white font-medium py-2.5 px-5 rounded-lg text-sm shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all"
        >
          <span className="material-icons-round text-lg">add</span>
          Add lead
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card-dark border border-primary/30 rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-white">{editId ? "Edit Lead" : "Add Lead"}</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white">
              <span className="material-icons-round text-[20px]">close</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full name *</label>
              <input required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className={inputClass} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="jane@example.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+1 604 555 0100" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Source</label>
              <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className={inputClass}>
                {SOURCES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Location</label>
              <select value={form.location_id} onChange={(e) => setForm({ ...form, location_id: e.target.value })} className={inputClass}>
                <option value="">Any / unknown</option>
                {locations.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-400 mb-1">Notes</label>
              <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} placeholder="Any additional context…" />
            </div>
          </div>
          {error && <p className="text-error text-sm bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={loading} className="bg-primary hover:bg-purple-600 disabled:opacity-60 text-white font-medium py-2.5 px-6 rounded-lg text-sm">
              {loading ? "Saving…" : editId ? "Save changes" : "Add lead"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="border border-border-dark text-slate-300 hover:text-white py-2.5 px-5 rounded-lg text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-dark flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Leads ({filtered.length})</h2>
        </div>
        {filtered.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-500 text-sm">
            {leads.length === 0 ? "No leads yet — add your first one." : "No results match your filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-900/50 border-b border-border-dark">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Source</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Added</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {filtered.map((lead) => (
                  <tr key={lead.id} className="hover:bg-card-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-white">{lead.full_name}</p>
                      <p className="text-xs text-slate-500">{lead.email}</p>
                      {lead.phone && <p className="text-xs text-slate-600">{lead.phone}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-400 capitalize">{lead.source.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border bg-transparent cursor-pointer focus:outline-none ${STATUS_STYLES[lead.status] ?? ""}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="bg-card-dark text-white">{s.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs text-slate-500">
                        {new Date(lead.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => openEdit(lead)} className="text-slate-500 hover:text-white transition-colors">
                        <span className="material-icons-round text-[18px]">edit</span>
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
