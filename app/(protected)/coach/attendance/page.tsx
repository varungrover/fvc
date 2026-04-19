import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoachAttendanceClient from "./CoachAttendanceClient";

export default async function CoachAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  const { session: selectedSessionId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get today's + recent sessions (past 7 days + next 7 days) for all courses
  const rangeStart = new Date(Date.now() - 7 * 86400000).toISOString();
  const rangeEnd = new Date(Date.now() + 7 * 86400000).toISOString();

  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      id, start_at, end_at, status, notes,
      courses(id, title, type, locations(name))
    `)
    .gte("start_at", rangeStart)
    .lte("start_at", rangeEnd)
    .eq("status", "scheduled")
    .order("start_at", { ascending: false });

  // Pick session to show: from URL param, or the most recent/current
  const activeSessionId =
    selectedSessionId ?? sessions?.[0]?.id ?? null;

  let attendanceRecords: any[] = [];
  let enrolledStudents: any[] = [];

  if (activeSessionId) {
    const activeSession = sessions?.find((s) => s.id === activeSessionId);
    const courseId = (activeSession?.courses as any)?.id;

    // Get all enrolled students for this session's course
    if (courseId) {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("student_id, status, students(id, full_name)")
        .eq("course_id", courseId)
        .in("status", ["active", "trial"]);

      enrolledStudents = (enrollments ?? []).map((e: any) => ({
        studentId: e.student_id,
        studentName: e.students?.full_name ?? "Unknown",
        enrollmentStatus: e.status,
      }));
    }

    // Get existing attendance for this session
    const { data: att } = await supabase
      .from("attendance")
      .select("*")
      .eq("session_id", activeSessionId);

    attendanceRecords = att ?? [];
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-slate-500 text-sm mt-1">
          Mark and confirm student attendance for sessions.
        </p>
      </div>

      <CoachAttendanceClient
        sessions={(sessions ?? []) as any[]}
        activeSessionId={activeSessionId}
        enrolledStudents={enrolledStudents}
        attendanceRecords={attendanceRecords}
      />
    </div>
  );
}
