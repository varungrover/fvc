import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckInClient from "./CheckInClient";

export default async function StudentCheckInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get students belonging to this parent
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("parent_id", user.id);

  if (!students || students.length === 0) {
    return (
      <div className="p-8 max-w-xl">
        <h1 className="text-2xl font-bold text-white mb-6">Class Check-In</h1>
        <div className="bg-card-dark border border-border-dark rounded-xl p-10 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">
            person_off
          </span>
          <p className="text-slate-400 font-medium">No student profiles found</p>
          <p className="text-slate-500 text-sm mt-1">
            Add a child profile first to enable check-in.
          </p>
        </div>
      </div>
    );
  }

  const studentIds = students.map((s) => s.id);

  // Get today's + upcoming sessions for enrolled students (within 2 hours either side of now)
  const windowStart = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const windowEnd = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id,
      student_id,
      courses!inner(
        id, title, type,
        sessions(
          id, start_at, end_at, status, notes,
          profiles!sessions_coach_id_fkey(full_name)
        ),
        locations(name)
      )
    `)
    .in("student_id", studentIds)
    .in("status", ["active", "trial"]);

  // Flatten into a list of (session, student, course) objects filtered to window
  type SessionEntry = {
    sessionId: string;
    studentId: string;
    studentName: string;
    courseId: string;
    courseTitle: string;
    courseType: string;
    locationName: string;
    startAt: string;
    endAt: string;
    coachName: string | null;
    notes: string | null;
  };

  const sessionEntries: SessionEntry[] = [];

  for (const enrollment of enrollments ?? []) {
    const course = enrollment.courses as any;
    const student = students.find((s) => s.id === enrollment.student_id);
    if (!student) continue;

    for (const session of course.sessions ?? []) {
      if (session.status !== "scheduled") continue;
      if (session.start_at < windowStart || session.start_at > windowEnd) continue;

      sessionEntries.push({
        sessionId: session.id,
        studentId: student.id,
        studentName: student.full_name,
        courseId: course.id,
        courseTitle: course.title,
        courseType: course.type,
        locationName: course.locations?.name ?? "—",
        startAt: session.start_at,
        endAt: session.end_at,
        coachName: session.profiles?.full_name ?? null,
        notes: session.notes,
      });
    }
  }

  // Deduplicate by sessionId+studentId
  const unique = Array.from(
    new Map(sessionEntries.map((e) => [`${e.sessionId}-${e.studentId}`, e])).values()
  ).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  // Get existing attendance records for these sessions
  const sessionIds = unique.map((e) => e.sessionId);
  const { data: existingAttendance } = sessionIds.length
    ? await supabase
        .from("attendance")
        .select("session_id, student_id, status, checked_in_at, is_late, coach_confirmed")
        .in("session_id", sessionIds)
        .in("student_id", studentIds)
    : { data: [] };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Class Check-In</h1>
        <p className="text-slate-400 text-sm mt-1">
          Mark your child present for today&apos;s sessions.
        </p>
      </div>

      <CheckInClient
        sessions={unique}
        existingAttendance={existingAttendance ?? []}
      />
    </div>
  );
}
