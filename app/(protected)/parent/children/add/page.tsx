"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function AddChildPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    date_of_birth: "",
    grade: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    cfc_id: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const { error } = await supabase.from("students").insert({
      parent_id: user.id,
      full_name: form.full_name,
      date_of_birth: form.date_of_birth || null,
      grade: form.grade || null,
      emergency_contact_name: form.emergency_contact_name || null,
      emergency_contact_phone: form.emergency_contact_phone || null,
      cfc_id: form.cfc_id || null,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/parent/children");
    router.refresh();
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/parent/children" className="text-slate-400 hover:text-white transition-colors">
          <span className="material-icons-round text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add Child Profile</h1>
          <p className="text-slate-400 text-sm mt-0.5">Add a new child to your account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card-dark border border-border-dark rounded-xl p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Full name <span className="text-error">*</span></label>
          <input
            name="full_name" required value={form.full_name} onChange={handleChange}
            placeholder="Emma Smith"
            className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Date of birth</label>
            <input
              type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange}
              className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Grade</label>
            <input
              name="grade" value={form.grade} onChange={handleChange}
              placeholder="e.g. 5"
              className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div className="border-t border-border-dark pt-5">
          <p className="text-sm font-semibold text-slate-300 mb-4">Emergency Contact</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Contact name</label>
              <input
                name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange}
                placeholder="John Smith"
                className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Contact phone</label>
              <input
                name="emergency_contact_phone" value={form.emergency_contact_phone} onChange={handleChange}
                placeholder="+1 604 000 0000"
                className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border-dark pt-5">
          <label className="block text-sm font-medium text-slate-300 mb-1.5">
            CFC ID <span className="text-slate-500">(optional)</span>
          </label>
          <input
            name="cfc_id" value={form.cfc_id} onChange={handleChange}
            placeholder="Chess Federation of Canada ID"
            className="w-full border border-border-dark rounded-lg py-3 px-3 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
        </div>

        {error && (
          <div className="bg-error/10 border border-error/30 rounded-lg px-4 py-3 text-error text-sm">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit" disabled={loading}
            className="flex-1 bg-primary hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg shadow-[0_0_10px_rgba(43,108,238,0.2)] transition-all duration-200"
          >
            {loading ? "Saving…" : "Save child profile"}
          </button>
          <Link
            href="/parent/children"
            className="px-5 py-3 border border-border-dark rounded-lg text-slate-300 hover:text-white hover:bg-surface-hover font-medium text-sm transition-all duration-200 flex items-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
