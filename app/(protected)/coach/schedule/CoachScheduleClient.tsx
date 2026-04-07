"use client";

import { useState } from "react";
import Link from "next/link";

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

export default function CoachScheduleClient({ sessions }: { sessions: any[] }) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDates = getWeekDates(weekOffset);
  const weekStart = weekDates[0];
  const weekEnd = weekDates[6];

  const weekSessions = sessions.filter((s) => {
    const d = new Date(s.start_at);
    return d >= weekStart && d <= new Date(weekEnd.getTime() + 86400000);
  });

  const weekLabel = `${weekStart.toLocaleDateString("en-CA", { month: "short", day: "numeric" })} — ${weekEnd.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setWeekOffset((w) => w - 1)}
          className="p-2 rounded-lg border border-border-dark hover:bg-surface-hover text-slate-400 hover:text-white transition-all"
        >
          <span className="material-icons-round text-xl">chevron_left</span>
        </button>
        <span className="text-sm font-semibold text-white min-w-[200px] text-center">
          {weekLabel}
        </span>
        <button
          onClick={() => setWeekOffset((w) => w + 1)}
          className="p-2 rounded-lg border border-border-dark hover:bg-surface-hover text-slate-400 hover:text-white transition-all"
        >
          <span className="material-icons-round text-xl">chevron_right</span>
        </button>
        <button
          onClick={() => setWeekOffset(0)}
          className="text-xs text-primary hover:text-blue-400 font-medium transition-colors ml-2"
        >
          Today
        </button>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
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
                    <p className="text-xs font-semibold text-slate-400 uppercase">{DAYS[i]}</p>
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
                          <Link
                            href={`/coach/attendance?session=${s.id}`}
                            key={s.id}
                            className={`block rounded-md border px-2 py-1.5 text-xs mb-1 cursor-pointer hover:opacity-80 transition-opacity ${TYPE_COLORS[type] ?? TYPE_COLORS.lesson}`}
                            title="Take Attendance"
                          >
                            <p className="font-semibold truncate">{s.courses?.title}</p>
                            {s.courses?.locations?.name && (
                              <p className="opacity-70 truncate text-[10px]"><span className="material-icons-round text-[10px] align-middle">location_on</span> {s.courses.locations.name}</p>
                            )}
                          </Link>
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
    </div>
  );
}
