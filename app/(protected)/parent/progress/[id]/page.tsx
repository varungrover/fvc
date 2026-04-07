import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProgressClient from "./ProgressClient";

const LEVEL_NAMES = ["Pawn", "Knight", "Bishop", "Rook", "Queen", "King"];

export default async function StudentProgressPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify the student belongs to the parent (or role is admin)
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  
  const { data: student } = await supabase
    .from("students")
    .select("*, locations(name)")
    .eq("id", params.id)
    .single();

  if (!student) redirect("/dashboard");

  // If parent, check ownership
  if (profile?.role === "parent" && student.parent_id !== user.id) {
    redirect("/dashboard");
  }

  // Get active enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, status, courses(title, type, level)")
    .eq("student_id", student.id)
    .in("status", ["active", "trial"]);

  // Get recent attendance
  const { data: attendance } = await supabase
    .from("attendance")
    .select("status, is_late, checked_in_at, notes, sessions(start_at, courses(title))")
    .eq("student_id", student.id)
    .order("checked_in_at", { ascending: false })
    .limit(10);

  // Gamification data
  const [{ data: allBadges }, { data: earnedBadges }, { data: recentPoints }] = await Promise.all([
    supabase.from("badges").select("*").order("points_threshold"),
    supabase.from("student_badges").select("badge_id, awarded_at").eq("student_id", student.id),
    supabase
      .from("point_transactions")
      .select("points, reason, created_at")
      .eq("student_id", student.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  return (
    <div className="p-8">
      <div className="mb-6 flex space-x-2 text-sm text-slate-500">
        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-300">Progress Report</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{student.full_name}'s Progress</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review attendance, current courses, and recent feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Student Details & Enrollments */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card-dark border border-border-dark rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Student Profile</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Location</p>
                <p className="text-sm text-slate-300">{student.locations?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Grade</p>
                <p className="text-sm text-slate-300">{student.grade || "N/A"}</p>
              </div>
              {student.medical_notes && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Medical Notes</p>
                  <p className="text-sm text-slate-300">{student.medical_notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card-dark border border-border-dark rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Current Enrollments</h2>
            {!enrollments || enrollments.length === 0 ? (
              <p className="text-sm text-slate-500">No active enrollments.</p>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enr: any) => (
                  <div key={enr.id} className="pb-4 border-b border-border-dark last:border-0 last:pb-0">
                    <p className="text-sm font-semibold text-white">{enr.courses?.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${enr.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                        {enr.status}
                      </span>
                      {enr.courses?.level && (
                        <span className="text-[10px] bg-surface-dark text-slate-400 border border-border-dark px-2 py-0.5 rounded-full">
                          {enr.courses.level}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attendance & Stats */}
        <div className="md:col-span-2 space-y-6">
          <ProgressClient attendance={attendance || []} />
        </div>
      </div>

      {/* Achievements Section */}
      {(() => {
        const totalPoints = student.total_points ?? 0;
        const level = Math.min(student.current_level ?? 0, LEVEL_NAMES.length - 1);
        const levelName = LEVEL_NAMES[level] ?? "Pawn";
        const pointsPerLevel = 100;
        const pointsIntoLevel = totalPoints % pointsPerLevel;
        const progressPct = (pointsIntoLevel / pointsPerLevel) * 100;
        const earnedIds = new Set((earnedBadges ?? []).map((b: any) => b.badge_id));

        return (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-white mb-4">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Level + points */}
              <div className="bg-card-dark border border-border-dark rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-purple/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-round text-primary text-[28px]">military_tech</span>
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">{levelName}</p>
                    <p className="text-slate-400 text-sm">Level {level + 1} · {totalPoints} pts total</p>
                  </div>
                </div>
                {level < LEVEL_NAMES.length - 1 ? (
                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Progress to {LEVEL_NAMES[level + 1]}</span>
                      <span>{pointsIntoLevel}/{pointsPerLevel}</span>
                    </div>
                    <div className="h-2 bg-surface-dark rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-indigo rounded-full"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-caution font-semibold">Maximum level reached!</p>
                )}

                {/* Recent point log */}
                {(recentPoints ?? []).length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Recent</p>
                    {(recentPoints ?? []).map((tx: any, i: number) => (
                      <div key={i} className="flex justify-between items-center">
                        <p className="text-xs text-slate-400 capitalize">{tx.reason?.replace(/_/g, " ")}</p>
                        <span className="text-xs font-bold text-success">+{tx.points}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="bg-card-dark border border-border-dark rounded-xl p-6">
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-4">Badges</p>
                {(allBadges ?? []).length === 0 ? (
                  <p className="text-sm text-slate-500">No badges defined yet.</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {(allBadges ?? []).map((badge: any) => {
                      const earned = earnedIds.has(badge.id);
                      return (
                        <div
                          key={badge.id}
                          title={badge.description}
                          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all ${
                            earned
                              ? "border-primary/30 bg-primary/5"
                              : "border-border-dark bg-surface-dark opacity-40"
                          }`}
                        >
                          <span className={`material-icons-round text-[22px] ${earned ? "text-primary" : "text-slate-600"}`}>
                            {badge.icon ?? "emoji_events"}
                          </span>
                          <p className="text-[10px] font-semibold text-center text-slate-300 leading-tight">
                            {badge.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
