import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const LEVEL_NAMES = ["Pawn", "Knight", "Bishop", "Rook", "Queen", "King"];

const RANK_STYLES: Record<number, { bg: string; text: string; icon: string }> = {
  1: { bg: "bg-yellow-500/20 border-yellow-500/30", text: "text-yellow-400", icon: "🥇" },
  2: { bg: "bg-slate-400/10 border-slate-400/20", text: "text-slate-300", icon: "🥈" },
  3: { bg: "bg-orange-600/15 border-orange-600/25", text: "text-orange-400", icon: "🥉" },
};

export default async function StudentLeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Find current student for highlighting
  const { data: currentStudent } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .single();

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, total_points, current_level")
    .order("total_points", { ascending: false })
    .limit(50);

  const ranked = (students ?? []).map((s, i) => ({ ...s, rank: i + 1 }));

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-slate-400 text-sm mt-1">Top students ranked by total points earned.</p>
      </div>

      {ranked.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl p-12 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">leaderboard</span>
          <p className="text-slate-400 font-medium">No students yet</p>
          <p className="text-slate-500 text-sm mt-1">Earn points by attending classes and completing lessons!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranked.map((student) => {
            const isMe = currentStudent?.id === student.id;
            const rankStyle = RANK_STYLES[student.rank];
            const levelName = LEVEL_NAMES[Math.min(student.current_level ?? 0, LEVEL_NAMES.length - 1)] ?? "Pawn";
            const initials = student.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

            return (
              <div
                key={student.id}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                  isMe
                    ? "bg-primary/10 border-primary/30"
                    : rankStyle
                    ? `${rankStyle.bg} border`
                    : "bg-card-dark border-border-dark"
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center flex-shrink-0">
                  {rankStyle ? (
                    <span className="text-xl">{rankStyle.icon}</span>
                  ) : (
                    <span className="text-sm font-bold text-slate-500">#{student.rank}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isMe ? "bg-primary/30" : "bg-gradient-to-br from-primary/20 to-purple/10"
                }`}>
                  <span className={`font-bold text-sm ${isMe ? "text-primary" : "text-slate-300"}`}>{initials}</span>
                </div>

                {/* Name + level */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${isMe ? "text-primary" : "text-white"}`}>
                      {student.full_name}
                      {isMe && <span className="ml-1.5 text-xs text-primary font-normal">(you)</span>}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">{levelName} · Level {(student.current_level ?? 0) + 1}</p>
                </div>

                {/* Points */}
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-bold ${rankStyle ? rankStyle.text : isMe ? "text-primary" : "text-white"}`}>
                    {student.total_points ?? 0}
                  </p>
                  <p className="text-[10px] text-slate-500">points</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
