"use server";

import { createClient } from "@/lib/supabase/server";
import { awardPoints } from "@/lib/gamification";

const LATE_THRESHOLD_MINUTES = 10;
const PRESENT_POINTS = 10;
const LATE_POINTS = 5;
const PERFECT_ATTENDANCE_COUNT = 10;

export type CheckInResult = {
  ok: boolean;
  status?: "present" | "late";
  isLate?: boolean;
  checkedInAt?: string;
  error?: string;
};

export async function checkInAction(
  sessionId: string,
  studentId: string
): Promise<CheckInResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Unauthorized" };

  // Fetch session start time
  const { data: session } = await supabase
    .from("sessions")
    .select("start_at")
    .eq("id", sessionId)
    .single();

  if (!session) return { ok: false, error: "Session not found" };

  const now = new Date();
  const minutesLate = Math.floor(
    (now.getTime() - new Date(session.start_at).getTime()) / 60000
  );
  const isLate = minutesLate > LATE_THRESHOLD_MINUTES;
  const status = isLate ? ("late" as const) : ("present" as const);

  // Upsert attendance record
  const { error } = await supabase.from("attendance").upsert(
    {
      session_id: sessionId,
      student_id: studentId,
      checked_in_at: now.toISOString(),
      status,
      is_late: isLate,
      updated_at: now.toISOString(),
    },
    { onConflict: "session_id,student_id" }
  );

  if (error) return { ok: false, error: error.message };

  // Award points for attendance
  const points = isLate ? LATE_POINTS : PRESENT_POINTS;
  await awardPoints(studentId, points, isLate ? "late_attendance" : "attendance");

  // Check Perfect Attendance badge (10 attended sessions)
  const { count } = await supabase
    .from("attendance")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .in("status", ["present", "late"]);

  if (count !== null && count >= PERFECT_ATTENDANCE_COUNT) {
    // Find Perfect Attendance badge
    const { data: perfBadge } = await supabase
      .from("badges")
      .select("id")
      .is("points_threshold", null)
      .eq("name", "Perfect Attendance")
      .single();

    if (perfBadge) {
      // Award if not already earned
      const { data: alreadyEarned } = await supabase
        .from("student_badges")
        .select("id")
        .eq("student_id", studentId)
        .eq("badge_id", perfBadge.id)
        .maybeSingle();

      if (!alreadyEarned) {
        await supabase
          .from("student_badges")
          .insert({ student_id: studentId, badge_id: perfBadge.id });
      }
    }
  }

  // Fire late notification edge function (non-blocking)
  if (isLate) {
    supabase.functions
      .invoke("notify-late-attendance", {
        body: {
          sessionId,
          studentId,
          minutesLate,
          checkedInAt: now.toISOString(),
        },
      })
      .catch(() => {});
  }

  return { ok: true, status, isLate, checkedInAt: now.toISOString() };
}
