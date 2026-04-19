"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Session = {
  id: string;
  course_id: string;
  coach_id: string | null;
  start_at: string;
  end_at: string;
  status: string;
  notes: string | null;
  courses: { title: string; type: string } | null;
  profiles: { full_name: string } | null;
};

type Course = { id: string; title: string; type: string };
type Coach = { id: string; full_name: string };

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const TYPE_COLORS: Record<string, string> = {
  lesson: "bg-primary/20 border-primary/40 text-primary",
  club: "bg-success/20 border-success/40 text-success",
  camp: "bg-warning/20 border-warning/40 text-warning",
  tournament: "bg-purple/20 border-purple/40 text-purple",
};

function getWeekDates(offset: number) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  return DAYS.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatHour(h: number) {
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12} ${ampm}`;
}

export default function SessionSchedulerClient({
  initialSessions,
  courses,
  coaches,
}: {
  initialSessions: Session[];
  courses: Course[];
  coaches: Coach[];
}) {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    course_id: courses[0]?.id ?? "",
    coach_id: "",
    date: "",
    start_time: "16:00",
    end_time: "17:30",
    notes: "",
  });

  const weekDates = getWeekDates(weekOffset);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  // Filter sessions to current week
  const weekSessions = initialSessions.filter((s) => {
    const d = new Date(s.start_at);
    return d >= weekStart && d <= new Date(weekEnd.getTime() + 86400000);
  });

  // Map sessions to grid positions
  function getSessionsForSlot(dayIndex: number, hour: number) {
    return weekSessions.filter((s) => {
      const d = new Date(s.start_at);
      return (
        d.getDay() === ((dayIndex + 1) % 7 || 7) &&
        d.getHours() === hour
      );
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const startAt = new Date(`${form.date}T${form.start_time}:00`);
    const endAt = new Date(`${form.date}T${form.end_time}:00`);

    const supabase = createClient();
    const { error: err } = await supabase.from("sessions").insert({
      course_id: form.course_id,
      coach_id: form.coach_id || null,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      notes: form.notes || null,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setShowForm(false);
    setLoading(false);
    router.refresh();
  }

  const weekLabel = `${weekStart.toLocaleDateString("en-CA", { month: "short", day: "numeric" })} — ${weekEnd.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="space-y-6">
      {/* Week navigation + create button */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-2 rounded-lg border border-border-dark hover:bg-surface-hover text-slate-500 hover:text-white transition-all"
          >
            <span className="material-icons-round text-xl">chevron_left</span>
          </button>
          <span className="text-sm font-semibold text-gray-900 min-w-[200px] text-center">
            {weekLabel}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-2 rounded-lg border border-border-dark hover:bg-surface-hover text-slate-500 hover:text-white transition-all"
          >
            <span className="material-icons-round text-xl">chevron_right</span>
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="text-xs text-primary hover:text-purple-300 font-medium transition-colors ml-2"
          >
            Today
          </button>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary hover:bg-purple-600 text-white font-medium py-2.5 px-4 rounded-lg text-sm shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all"
        >
          <span className="material-icons-round text-lg">add</span>
          Add session
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-card-dark border border-primary/30 rounded-xl p-5 space-y-4"
        >
          <h3 className="text-sm font-bold text-gray-900">Schedule a Session</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Course *</label>
              <select
                required
                value={form.course_id}
                onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                className="w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Coach</label>
              <select
                value={form.coach_id}
                onChange={(e) => setForm({ ...form, coach_id: e.target.value })}
                className="w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="">Unassigned</option>
                {coaches.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Date *</label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Start time *</label>
              <input
                type="time"
                required
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                className="w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">End time *</label>
              <input
                type="time"
                required
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                className="w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Notes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional"
                className="w-full border border-border-dark rounded-lg py-2.5 px-3 bg-surface-dark text-white placeholder-slate-500 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          {error && (
            <p className="text-error text-sm">{error}</p>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-purple-600 disabled:opacity-60 text-white font-medium py-2 px-5 rounded-lg text-sm transition-all"
            >
              {loading ? "Saving…" : "Create session"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-border-dark text-slate-700 hover:text-white py-2 px-4 rounded-lg text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Weekly grid */}
      <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day headers */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border-dark bg-[#151c2b]">
              <div className="px-2 py-3" />
              {weekDates.map((d, i) => {
                const isToday = d.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={i}
                    className={`px-3 py-3 text-center ${isToday ? "bg-primary/5" : ""}`}
                  >
                    <p className="text-xs font-semibold text-slate-500 uppercase">{DAYS[i]}</p>
                    <p className={`text-lg font-bold ${isToday ? "text-primary" : "text-white"}`}>
                      {d.getDate()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Time slots */}
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border-dark/50 min-h-[60px]"
              >
                <div className="px-2 py-2 text-xs text-slate-500 font-medium text-right pr-3 pt-3">
                  {formatHour(hour)}
                </div>
                {weekDates.map((d, dayIndex) => {
                  const dayOfWeek = d.getDay();
                  const slotSessions = weekSessions.filter((s) => {
                    const sd = new Date(s.start_at);
                    return (
                      sd.getDate() === d.getDate() &&
                      sd.getMonth() === d.getMonth() &&
                      sd.getHours() === hour
                    );
                  });

                  const isToday = d.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={dayIndex}
                      className={`border-l border-border-dark/50 p-1 ${isToday ? "bg-primary/[0.02]" : ""}`}
                    >
                      {slotSessions.map((s) => {
                        const type = s.courses?.type ?? "lesson";
                        return (
                          <div
                            key={s.id}
                            className={`rounded-md border px-2 py-1.5 text-xs mb-1 cursor-pointer hover:opacity-80 transition-opacity ${TYPE_COLORS[type] ?? TYPE_COLORS.lesson}`}
                          >
                            <p className="font-semibold truncate">{s.courses?.title}</p>
                            {s.profiles && (
                              <p className="opacity-70 truncate">{s.profiles.full_name}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session count */}
      <p className="text-xs text-slate-500 text-center">
        {weekSessions.length} session{weekSessions.length !== 1 ? "s" : ""} this week ·{" "}
        {initialSessions.length} total scheduled
      </p>
    </div>
  );
}
