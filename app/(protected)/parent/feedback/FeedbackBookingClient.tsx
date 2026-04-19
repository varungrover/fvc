"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function FeedbackBookingClient({ parentId, students, initialBookings }: { parentId: string, students: any[], initialBookings: any[] }) {
  const supabase = createClient();
  const [bookings, setBookings] = useState(initialBookings);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    studentId: students[0]?.id || "",
    preferredDate: "",
    preferredTime: "Afternoon (1pm - 5pm)",
    message: ""
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const student = students.find(s => s.id === formData.studentId);
    
    const { data, error: err } = await supabase
      .from("feedback_bookings")
      .insert({
        parent_id: parentId,
        student_id: formData.studentId,
        location_id: student?.locations?.id,
        preferred_date: formData.preferredDate || null,
        preferred_time: formData.preferredTime,
        message: formData.message,
        status: "pending"
      })
      .select("*, students(full_name), locations(name)")
      .single();

    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    
    setBookings([data, ...bookings]);
    setIsOpen(false);
    setFormData({ ...formData, message: "", preferredDate: "" });
  }

  function getStatusStyle(s: string) {
    switch (s) {
      case "pending": return "bg-warning/10 text-warning border-warning/20";
      case "confirmed": return "bg-primary/10 text-primary border-primary/20";
      case "completed": return "bg-success/10 text-success border-success/20";
      case "cancelled": return "bg-error/10 text-error border-error/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-gray-900 font-bold">Your Requests</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-primary hover:bg-purple-600 text-white text-sm font-medium rounded-xl flex items-center gap-2 transition-colors"
        >
          <span className="material-icons-round text-[18px]">add</span>
          New Request
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-8 text-center">
          <span className="material-icons-round text-4xl text-slate-600 mb-3">forum</span>
          <p className="text-white font-medium">No requests yet</p>
          <p className="text-slate-500 text-sm mt-1">You haven't requested any feedback meetings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-5 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-gray-900 font-semibold text-sm">{b.students?.full_name}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">{b.locations?.name || "Online"}</p>
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getStatusStyle(b.status)}`}>
                  {b.status}
                </span>
              </div>
              <p className="text-slate-700 text-sm flex-1">{b.message}</p>
              
              <div className="mt-4 pt-4 border-t border-border-dark space-y-1">
                {(b.preferred_date || b.preferred_time) && (
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="material-icons-round text-[14px]">schedule</span>
                    Prefers: {b.preferred_date ? new Date(b.preferred_date).toLocaleDateString() : ""} {b.preferred_time}
                  </p>
                )}
                {b.confirmed_at && (
                  <p className="text-xs text-success flex items-center gap-1.5">
                    <span className="material-icons-round text-[14px]">event_available</span>
                    Confirmed! See email for details.
                  </p>
                )}
                {b.admin_note && (
                  <div className="mt-2 bg-surface-dark p-2 rounded-lg border border-border-dark">
                    <p className="text-[11px] text-slate-500 uppercase font-bold mb-0.5">Admin Note</p>
                    <p className="text-xs text-slate-700">{b.admin_note}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal form */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card-dark border border-border-dark rounded-2xl shadow-sm w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-border-dark flex justify-between items-center bg-surface-dark">
              <h2 className="text-lg font-bold text-gray-900">Request Feedback Meeting</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <span className="material-icons-round">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 bg-error/10 border border-error/20 rounded-lg p-3 text-sm text-error flex items-center gap-2">
                  <span className="material-icons-round text-lg">error_outline</span>
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Child</label>
                  <select 
                    value={formData.studentId}
                    onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                    className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  >
                    {!students.length && <option value="">No children found</option>}
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.full_name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Preferred Date</label>
                    <input 
                      type="date"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({...formData, preferredDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1.5">Preferred Time</label>
                    <select 
                      value={formData.preferredTime}
                      onChange={(e) => setFormData({...formData, preferredTime: e.target.value})}
                      className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    >
                      <option>Morning (10am - 12pm)</option>
                      <option>Afternoon (1pm - 5pm)</option>
                      <option>Evening (5pm - 8pm)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">What would you like to discuss?</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="E.g., I'd like to check in on John's progress and see if he's ready for the next level."
                    className="w-full bg-surface-dark border border-border-dark rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-24 resize-none"
                    required
                  ></textarea>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-surface-dark hover:bg-surface-hover text-white text-sm font-medium rounded-xl transition-colors border border-border-dark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.studentId}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-purple-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading && <span className="material-icons-round animate-spin text-[18px]">autorenew</span>}
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
