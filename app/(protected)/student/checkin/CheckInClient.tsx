"use client";

import { useState } from "react";
import { checkInAction } from "@/app/actions/checkin";

const TYPE_COLORS: Record<string, string> = {
  lesson: "bg-primary/15 text-primary",
  club: "bg-success/15 text-success",
  camp: "bg-warning/15 text-warning",
  tournament: "bg-purple/15 text-purple",
};

type SessionEntry = {
  sessionId: string;
  studentId: string;
  studentName: string;
  courseTitle: string;
  courseType: string;
  locationName: string;
  startAt: string;
  endAt: string;
  coachName: string | null;
  notes: string | null;
};

type AttendanceRecord = {
  session_id: string;
  student_id: string;
  status: string;
  checked_in_at: string | null;
  is_late: boolean;
  coach_confirmed: boolean;
};

export default function CheckInClient({
  sessions,
  existingAttendance,
}: {
  sessions: SessionEntry[];
  existingAttendance: AttendanceRecord[];
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const [checkedIn, setCheckedIn] = useState<Record<string, AttendanceRecord>>(
    () => {
      const map: Record<string, AttendanceRecord> = {};
      for (const a of existingAttendance) {
        map[`${a.session_id}-${a.student_id}`] = a;
      }
      return map;
    }
  );

  function getKey(sessionId: string, studentId: string) {
    return `${sessionId}-${studentId}`;
  }

  function getSessionStatus(session: SessionEntry) {
    const start = new Date(session.startAt);
    const end = new Date(session.endAt);
    const now = new Date();
    if (now < start) return "upcoming";
    if (now > end) return "ended";
    return "active";
  }

  function getMinutesLate(startAt: string) {
    const diff = (Date.now() - new Date(startAt).getTime()) / 60000;
    return Math.floor(diff);
  }

  async function handleCheckIn(session: SessionEntry) {
    const key = getKey(session.sessionId, session.studentId);
    setLoading(key);

    const result = await checkInAction(session.sessionId, session.studentId);

    if (result.ok && result.status && result.checkedInAt) {
      setCheckedIn((prev) => ({
        ...prev,
        [key]: {
          session_id: session.sessionId,
          student_id: session.studentId,
          status: result.status!,
          checked_in_at: result.checkedInAt!,
          is_late: result.isLate ?? false,
          coach_confirmed: false,
        },
      }));
    }

    setLoading(null);
  }

  function formatTime(dt: string) {
    return new Date(dt).toLocaleTimeString("en-CA", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDate(dt: string) {
    const d = new Date(dt);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-card-dark border border-border-dark rounded-xl p-12 text-center">
        <span className="material-icons-round text-[48px] text-slate-600 block mb-3">
          event_busy
        </span>
        <p className="text-slate-400 font-medium">No sessions available for check-in</p>
        <p className="text-slate-500 text-sm mt-1">
          Sessions appear here up to 2 hours before they start.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => {
        const key = getKey(session.sessionId, session.studentId);
        const attendance = checkedIn[key];
        const sessionStatus = getSessionStatus(session);
        const isLoadingThis = loading === key;
        const minutesLate = getMinutesLate(session.startAt);

        return (
          <div
            key={key}
            className={`bg-card-dark border rounded-xl p-5 transition-all duration-200 ${
              attendance
                ? attendance.is_late
                  ? "border-warning/40"
                  : "border-success/40 shadow-[0_0_12px_rgba(16,185,129,0.08)]"
                : "border-border-dark"
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${TYPE_COLORS[session.courseType] ?? TYPE_COLORS.lesson}`}
                >
                  <span className="material-icons-round text-lg">school</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{session.courseTitle}</p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {formatDate(session.startAt)} · {formatTime(session.startAt)}–
                    {formatTime(session.endAt)}
                  </p>
                </div>
              </div>

              {/* Session status badge */}
              {sessionStatus === "active" && !attendance && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success animate-pulse">
                  In progress
                </span>
              )}
              {sessionStatus === "upcoming" && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  Upcoming
                </span>
              )}
              {sessionStatus === "ended" && !attendance && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                  Ended
                </span>
              )}
            </div>

            {/* Details row */}
            <div className="flex items-center gap-4 mb-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <span className="material-icons-round text-[14px]">location_on</span>
                {session.locationName}
              </span>
              {session.coachName && (
                <span className="flex items-center gap-1">
                  <span className="material-icons-round text-[14px]">person</span>
                  {session.coachName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="material-icons-round text-[14px]">child_care</span>
                {session.studentName}
              </span>
            </div>

            {/* Late warning */}
            {!attendance && sessionStatus !== "ended" && minutesLate > 0 && minutesLate <= 60 && (
              <div className="bg-warning/10 border border-warning/20 rounded-lg px-3 py-2 mb-4 flex items-center gap-2">
                <span className="material-icons-round text-warning text-sm">schedule</span>
                <p className="text-xs text-warning font-medium">
                  Session started {minutesLate} min ago — this will be marked as late
                </p>
              </div>
            )}

            {/* Attendance result */}
            {attendance ? (
              <div
                className={`rounded-lg px-4 py-3 flex items-center gap-3 ${
                  attendance.is_late
                    ? "bg-warning/10 border border-warning/20"
                    : "bg-success/10 border border-success/20"
                }`}
              >
                <span
                  className={`material-icons-round text-xl ${attendance.is_late ? "text-warning" : "text-success"}`}
                >
                  {attendance.is_late ? "schedule" : "check_circle"}
                </span>
                <div>
                  <p
                    className={`text-sm font-semibold ${attendance.is_late ? "text-warning" : "text-success"}`}
                  >
                    {attendance.is_late ? "Checked in — Late" : "Checked in — Present"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    at {formatTime(attendance.checked_in_at!)}
                    {attendance.coach_confirmed && " · Confirmed by coach ✓"}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleCheckIn(session)}
                disabled={isLoadingThis || sessionStatus === "ended"}
                className={`w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  sessionStatus === "ended"
                    ? "bg-surface-dark text-slate-600 cursor-not-allowed"
                    : sessionStatus === "active"
                    ? "bg-success hover:bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    : "bg-primary hover:bg-blue-600 text-white shadow-[0_0_10px_rgba(43,108,238,0.2)]"
                }`}
              >
                {isLoadingThis ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Checking in…
                  </>
                ) : sessionStatus === "ended" ? (
                  "Check-in window closed"
                ) : (
                  <>
                    <span className="material-icons-round text-lg">how_to_reg</span>
                    Mark Present
                  </>
                )}
              </button>
            )}
          </div>
        );
      })}

      <p className="text-xs text-slate-500 text-center pt-2">
        Check-in earns <span className="text-success font-semibold">10 pts</span> (on time) or{" "}
        <span className="text-warning font-semibold">5 pts</span> (late).
        Arrivals more than 10 minutes after start are marked late.
      </p>
    </div>
  );
}
