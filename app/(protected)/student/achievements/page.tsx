import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const LEVEL_NAMES = ["Pawn", "Knight", "Bishop", "Rook", "Queen", "King"];

export default async function StudentAchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Look up student linked to this auth user
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name, total_points, current_level")
    .eq("user_id", user.id)
    .single();

  const [{ data: allBadges }, { data: earnedBadges }, { data: recentPoints }] = await Promise.all([
    supabase.from("badges").select("*").order("points_threshold"),
    student
      ? supabase.from("student_badges").select("badge_id, awarded_at").eq("student_id", student.id)
      : Promise.resolve({ data: [] }),
    student
      ? supabase.from("point_transactions").select("points, reason, created_at").eq("student_id", student.id).order("created_at", { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
  ]);

  const earnedIds = new Set((earnedBadges ?? []).map((b: any) => b.badge_id));
  const totalPoints = student?.total_points ?? 0;
  const level = Math.min(student?.current_level ?? 0, LEVEL_NAMES.length - 1);
  const levelName = LEVEL_NAMES[level] ?? "Pawn";

  // Points to next level (simple threshold: 100 per level)
  const pointsPerLevel = 100;
  const pointsIntoLevel = totalPoints % pointsPerLevel;
  const progressPct = (pointsIntoLevel / pointsPerLevel) * 100;

  if (!student) {
    return (
      <div className="p-8 max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
          <p className="text-slate-500 text-sm mt-1">Your points, badges, and progress.</p>
        </div>
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-10 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">emoji_events</span>
          <p className="text-slate-700 font-medium">Account not linked yet</p>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            Ask your parent to complete the student login setup from their account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
        <p className="text-slate-500 text-sm mt-1">Your points, badges, and progress.</p>
      </div>

      {/* Level + points card */}
      <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-purple/20 flex items-center justify-center flex-shrink-0">
            <span className="material-icons-round text-primary text-[32px]">military_tech</span>
          </div>
          <div>
            <p className="text-gray-900 font-bold text-xl">{levelName}</p>
            <p className="text-slate-500 text-sm">Level {level + 1} · {totalPoints} total points</p>
          </div>
        </div>
        {level < LEVEL_NAMES.length - 1 && (
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Progress to {LEVEL_NAMES[level + 1]}</span>
              <span>{pointsIntoLevel}/{pointsPerLevel} pts</span>
            </div>
            <div className="h-2 bg-surface-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-indigo rounded-full transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}
        {level >= LEVEL_NAMES.length - 1 && (
          <p className="text-xs text-caution font-semibold">Maximum level reached!</p>
        )}
      </div>

      {/* Badges */}
      {(allBadges ?? []).length > 0 && (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Badges</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {(allBadges ?? []).map((badge: any) => {
              const earned = earnedIds.has(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    earned
                      ? "border-primary/30 bg-primary/5"
                      : "border-border-dark bg-surface-dark opacity-40"
                  }`}
                  title={badge.description}
                >
                  <span className={`material-icons-round text-[28px] ${earned ? "text-primary" : "text-slate-600"}`}>
                    {badge.icon ?? "emoji_events"}
                  </span>
                  <p className="text-xs font-semibold text-center text-slate-700 leading-tight">{badge.name}</p>
                  <p className="text-[10px] text-slate-500">{badge.points_threshold} pts</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent point transactions */}
      {(recentPoints ?? []).length > 0 && (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border-dark">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recent Points</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {(recentPoints ?? []).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm text-white font-medium capitalize">{tx.reason?.replace(/_/g, " ")}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(tx.created_at).toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <span className="text-sm font-bold text-success">+{tx.points}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPoints === 0 && (earnedBadges ?? []).length === 0 && (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-8 text-center">
          <span className="material-icons-round text-[40px] text-slate-600 block mb-2">stars</span>
          <p className="text-slate-500 text-sm">Attend classes and complete lessons to earn points and badges!</p>
        </div>
      )}
    </div>
  );
}
