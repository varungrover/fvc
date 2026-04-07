"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Session = {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  notes: string | null;
  courses: { id: string; title: string; type: string; locations: { name: string } | null } | null;
};

type EnrolledStudent = {
  studentId: string;
  studentName: string;
  enrollmentStatus: string;
};

type AttendanceRecord = {
  id: string;
  session_id: string;
  student_id: string;
  status: string;
  checked_in_at: string | null;
  is_late: boolean;
  coach_confirmed: boolean;
  coach_override: boolean;
  notes: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; classes: string; icon: string }> = {
  present: { label: "Present", classes: "bg-success/10 text-success", icon: "check_circle" },
  late: { label: "Late", classes: "bg-warning/10 text-warning", icon: "schedule" },
  absent: { label: "Absent", classes: "bg-error/10 text-error", icon: "cancel" },
  excused: { label: "Excused", classes: "bg-slate-700 text-slate-400", icon: "info" },
};

export default function CoachAttendanceClient({
  sessions,
  activeSessionId,
  enrolledStudents,
  attendanceRecords,
}: {
  sessions: Session[];
  activeSessionId: string | null;
  enrolledStudents: EnrolledStudent[];
  attendanceRecords: AttendanceRecord[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [localAttendance, setLocalAttendance] = useState<Record<string, AttendanceRecord>>(
    () => {
      const map: Record<string, AttendanceRecord> = {};
      for (const a of attendanceRecords) {
        map[a.student_id] = a;
      }
      return map;
    }
  );

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  async function markAttendance(
    studentId: string,
    status: "present" | "late" | "absent" | "excused"
  ) {
    if (!activeSessionId) return;
    setLoading(studentId);

    const supabase = createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("attendance")
      .upsert(
        {
          session_id: activeSessionId,
          student_id: studentId,
          status,
          checked_in_at: status !== "absent" ? now : null,
          is_late: status === "late",
          coach_confirmed: true,
          coach_override: true,
          updated_at: now,
        },
        { onConflict: "session_id,student_id" }
      )
      .select()
      .single();

    if (!error && data) {
      setLocalAttendance((prev) => ({ ...prev, [studentId]: data }));
    }

    setLoading(null);
  }

  async function toggleCoachConfirm(studentId: string) {
    const record = localAttendance[studentId];
    if (!record) return;
    setLoading(studentId + "-confirm");

    const supabase = createClient();
    const { data, error } = await supabase
      .from("attendance")
      .update({
        coach_confirmed: !record.coach_confirmed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", record.id)
      .select()
      .single();

    if (!error && data) {
      setLocalAttendance((prev) => ({ ...prev, [studentId]: data }));
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
    return d.toLocaleDateString("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  const presentCount = Object.values(localAttendance).filter(
    (a) => a.status === "present" || a.status === "late"
  ).length;
  const confirmedCount = Object.values(localAttendance).filter(
    (a) => a.coach_confirmed
  ).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Session selector */}
      <div className="lg:col-span-1">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Sessions
        </h2>
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-500">No sessions in range</p>
          ) : (
            sessions.map((session) => {
              const course = session.courses as any;
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  onClick={() => router.push(`/coach/attendance?session=${session.id}`)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                    isActive
                      ? "border-primary/40 bg-primary/5 shadow-[0_0_8px_rgba(43,108,238,0.1)]"
                      : "border-border-dark bg-card-dark hover:bg-card-hover"
                  }`}
                >
                  <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-white"}`}>
                    {course?.title ?? "Session"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {formatDate(session.start_at)} · {formatTime(session.start_at)}
                  </p>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Attendance panel */}
      <div className="lg:col-span-3">
        {!activeSession ? (
          <div className="bg-card-dark border border-border-dark rounded-xl p-12 text-center">
            <span className="material-icons-round text-[48px] text-slate-600 block mb-3">
              calendar_today
            </span>
            <p className="text-slate-400 font-medium">Select a session to mark attendance</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Session header */}
            <div className="bg-card-dark border border-border-dark rounded-xl p-5 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {(activeSession.courses as any)?.title}
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  {formatDate(activeSession.start_at)} · {formatTime(activeSession.start_at)}–
                  {formatTime(activeSession.end_at)}
                  {(activeSession.courses as any)?.locations?.name &&
                    ` · ${(activeSession.courses as any).locations.name}`}
                </p>
              </div>
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-success">{presentCount}</p>
                  <p className="text-xs text-slate-500">Present</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-400">
                    {enrolledStudents.length - presentCount}
                  </p>
                  <p className="text-xs text-slate-500">Absent</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{confirmedCount}</p>
                  <p className="text-xs text-slate-500">Confirmed</p>
                </div>
              </div>
            </div>

            {/* Student list */}
            {enrolledStudents.length === 0 ? (
              <div className="bg-card-dark border border-border-dark rounded-xl p-10 text-center">
                <p className="text-slate-400 text-sm">No enrolled students for this course</p>
              </div>
            ) : (
              <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
                <div className="divide-y divide-border-dark">
                  {enrolledStudents.map((student) => {
                    const record = localAttendance[student.studentId];
                    const statusCfg = record
                      ? STATUS_CONFIG[record.status] ?? STATUS_CONFIG.absent
                      : null;
                    const isLoadingStudent =
                      loading === student.studentId ||
                      loading === student.studentId + "-confirm";

                    const initials = student.studentName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2);

                    return (
                      <div
                        key={student.studentId}
                        className="flex items-center gap-4 px-5 py-4 flex-wrap hover:bg-card-hover transition-colors"
                      >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{initials}</span>
                        </div>

                        {/* Name */}
                        <div className="flex-1 min-w-[120px]">
                          <p className="text-sm font-semibold text-white">{student.studentName}</p>
                          <p className="text-xs text-slate-500 capitalize">
                            {student.enrollmentStatus}
                          </p>
                        </div>

                        {/* Current status */}
                        {record ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${statusCfg?.classes}`}
                            >
                              <span className="material-icons-round text-[12px]">
                                {statusCfg?.icon}
                              </span>
                              {statusCfg?.label}
                              {record.checked_in_at && (
                                <span className="opacity-70 ml-1">
                                  {formatTime(record.checked_in_at)}
                                </span>
                              )}
                            </span>
                            {record.is_late && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                {Math.floor(
                                  (new Date(record.checked_in_at!).getTime() -
                                    new Date(activeSession.start_at).getTime()) /
                                    60000
                                )}
                                m late
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 font-medium">Not checked in</span>
                        )}

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => markAttendance(student.studentId, "present")}
                            disabled={isLoadingStudent}
                            title="Mark Present"
                            className={`p-1.5 rounded-lg transition-all text-sm ${
                              record?.status === "present" && !record?.is_late
                                ? "bg-success text-white"
                                : "text-slate-400 hover:text-success hover:bg-success/10"
                            }`}
                          >
                            <span className="material-icons-round text-[18px]">check_circle</span>
                          </button>
                          <button
                            onClick={() => markAttendance(student.studentId, "late")}
                            disabled={isLoadingStudent}
                            title="Mark Late"
                            className={`p-1.5 rounded-lg transition-all ${
                              record?.status === "late"
                                ? "bg-warning text-white"
                                : "text-slate-400 hover:text-warning hover:bg-warning/10"
                            }`}
                          >
                            <span className="material-icons-round text-[18px]">schedule</span>
                          </button>
                          <button
                            onClick={() => markAttendance(student.studentId, "absent")}
                            disabled={isLoadingStudent}
                            title="Mark Absent"
                            className={`p-1.5 rounded-lg transition-all ${
                              record?.status === "absent"
                                ? "bg-error text-white"
                                : "text-slate-400 hover:text-error hover:bg-error/10"
                            }`}
                          >
                            <span className="material-icons-round text-[18px]">cancel</span>
                          </button>
                          <button
                            onClick={() => markAttendance(student.studentId, "excused")}
                            disabled={isLoadingStudent}
                            title="Mark Excused"
                            className={`p-1.5 rounded-lg transition-all ${
                              record?.status === "excused"
                                ? "bg-slate-600 text-white"
                                : "text-slate-400 hover:text-slate-300 hover:bg-slate-700"
                            }`}
                          >
                            <span className="material-icons-round text-[18px]">info</span>
                          </button>

                          {/* Coach confirm */}
                          {record && (
                            <button
                              onClick={() => toggleCoachConfirm(student.studentId)}
                              disabled={isLoadingStudent}
                              title={record.coach_confirmed ? "Unconfirm" : "Confirm attendance"}
                              className={`p-1.5 rounded-lg transition-all ml-1 ${
                                record.coach_confirmed
                                  ? "bg-primary/20 text-primary"
                                  : "text-slate-500 hover:text-primary hover:bg-primary/10"
                              }`}
                            >
                              <span className="material-icons-round text-[18px]">
                                {record.coach_confirmed ? "verified" : "verified_user"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
