import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const LEVEL_NAMES = ["Pawn", "Knight", "Bishop", "Rook", "Queen", "King"];

const RANK_STYLES: Record<number, { bg: string; text: string; icon: string }> = {
  1: { bg: "bg-yellow-500/20 border-yellow-500/30", text: "text-yellow-400", icon: "🥇" },
  2: { bg: "bg-slate-400/10 border-slate-400/20", text: "text-slate-700", icon: "🥈" },
  3: { bg: "bg-orange-600/15 border-orange-600/25", text: "text-orange-400", icon: "🥉" },
};

// Age group boundaries (years)
const AGE_GROUPS = [
  { label: "Under 8", value: "u8", min: 0, max: 7 },
  { label: "8–11", value: "u12", min: 8, max: 11 },
  { label: "12–15", value: "u16", min: 12, max: 15 },
  { label: "16+", value: "open", min: 16, max: 99 },
];

function getAge(dob: string | null): number | null {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default async function StudentLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; age?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { location: locationFilter, age: ageFilter } = await searchParams;

  // Find current student for highlighting
  const { data: currentStudent } = await supabase
    .from("students")
    .select("id")
    .eq("user_id", user.id)
    .single();

  // Fetch all locations for the filter dropdown
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
    .order("name");

  // Build student query
  let studentIds: string[] | null = null;

  if (locationFilter) {
    // Students who are enrolled in a course at this location
    const { data: courses } = await supabase
      .from("courses")
      .select("id")
      .eq("location_id", locationFilter);

    const courseIds = (courses ?? []).map((c) => c.id);

    if (courseIds.length > 0) {
      const { data: enrollments } = await supabase
        .from("enrollments")
        .select("student_id")
        .in("course_id", courseIds)
        .in("status", ["active", "trial"]);

      studentIds = [...new Set((enrollments ?? []).map((e) => e.student_id))];
    } else {
      studentIds = [];
    }
  }

  // Fetch students with DOB for age filtering
  let query = supabase
    .from("students")
    .select("id, full_name, total_points, current_level, date_of_birth")
    .order("total_points", { ascending: false })
    .limit(50);

  if (studentIds !== null) {
    if (studentIds.length === 0) {
      // No students at this location
      return renderPage([], currentStudent?.id, locations ?? [], locationFilter, ageFilter);
    }
    query = query.in("id", studentIds);
  }

  const { data: students } = await query;

  // Apply age group filter client-side (DOB-based)
  let filtered = students ?? [];
  if (ageFilter) {
    const group = AGE_GROUPS.find((g) => g.value === ageFilter);
    if (group) {
      filtered = filtered.filter((s) => {
        const age = getAge(s.date_of_birth);
        if (age === null) return false;
        return age >= group.min && age <= group.max;
      });
    }
  }

  const ranked = filtered.map((s, i) => ({ ...s, rank: i + 1 }));

  return renderPage(ranked, currentStudent?.id, locations ?? [], locationFilter, ageFilter);
}

function renderPage(
  ranked: any[],
  currentStudentId: string | undefined,
  locations: { id: string; name: string }[],
  locationFilter: string | undefined,
  ageFilter: string | undefined
) {
  function buildUrl(params: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    const qs = p.toString();
    return `/student/leaderboard${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Leaderboard</h1>
        <p className="text-slate-500 text-sm mt-1">Top students ranked by total points earned.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Location filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Location:</span>
          <Link
            href={buildUrl({ age: ageFilter })}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !locationFilter
                ? "bg-primary/15 border-primary/30 text-primary"
                : "border-border-dark text-slate-500 hover:border-slate-600"
            }`}
          >
            All
          </Link>
          {locations.map((loc) => (
            <Link
              key={loc.id}
              href={buildUrl({ location: loc.id, age: ageFilter })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                locationFilter === loc.id
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-border-dark text-slate-500 hover:border-slate-600"
              }`}
            >
              {loc.name}
            </Link>
          ))}
        </div>

        {/* Age group filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Age:</span>
          <Link
            href={buildUrl({ location: locationFilter })}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              !ageFilter
                ? "bg-primary/15 border-primary/30 text-primary"
                : "border-border-dark text-slate-500 hover:border-slate-600"
            }`}
          >
            All
          </Link>
          {AGE_GROUPS.map((g) => (
            <Link
              key={g.value}
              href={buildUrl({ location: locationFilter, age: g.value })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                ageFilter === g.value
                  ? "bg-primary/15 border-primary/30 text-primary"
                  : "border-border-dark text-slate-500 hover:border-slate-600"
              }`}
            >
              {g.label}
            </Link>
          ))}
        </div>
      </div>

      {ranked.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-12 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">leaderboard</span>
          <p className="text-slate-500 font-medium">No students found</p>
          <p className="text-slate-500 text-sm mt-1">Try adjusting the filters, or earn points by attending classes!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {ranked.map((student) => {
            const isMe = currentStudentId === student.id;
            const rankStyle = RANK_STYLES[student.rank];
            const levelName =
              LEVEL_NAMES[Math.min(student.current_level ?? 0, LEVEL_NAMES.length - 1)] ?? "Pawn";
            const initials = student.full_name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

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
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isMe ? "bg-primary/30" : "bg-gradient-to-br from-primary/20 to-purple/10"
                  }`}
                >
                  <span className={`font-bold text-sm ${isMe ? "text-primary" : "text-slate-700"}`}>
                    {initials}
                  </span>
                </div>

                {/* Name + level */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-semibold text-sm ${isMe ? "text-primary" : "text-white"}`}>
                      {student.full_name}
                      {isMe && <span className="ml-1.5 text-xs text-primary font-normal">(you)</span>}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500">
                    {levelName} · Level {(student.current_level ?? 0) + 1}
                  </p>
                </div>

                {/* Points */}
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      rankStyle ? rankStyle.text : isMe ? "text-primary" : "text-white"
                    }`}
                  >
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
