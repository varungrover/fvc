import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const TYPE_LABELS: Record<string, string> = {
  lesson: "Lesson",
  club: "Club",
  camp: "Camp",
  tournament: "Tournament",
};

const TYPE_COLORS: Record<string, string> = {
  lesson: "bg-primary/15 text-primary",
  club: "bg-success/15 text-success",
  camp: "bg-warning/15 text-warning",
  tournament: "bg-purple/15 text-purple",
};

const SKILL_LABELS: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  open: "Open to all",
};

function formatTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function formatAge(min: number | null, max: number | null) {
  if (!min && !max) return "All ages";
  if (!max) return `${min}+`;
  if (!min) return `Up to ${max}`;
  return `Ages ${min}–${max}`;
}

function formatDuration(start: string | null, end: string | null) {
  if (!start || !end) return "";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: course } = await supabase
    .from("courses")
    .select("*, locations(name, address, city, province, phone)")
    .eq("id", id)
    .eq("status", "active")
    .single();

  if (!course) notFound();

  const loc = course.locations as any;

  return (
    <div className="p-8 max-w-3xl">
      {/* Back */}
      <Link href="/courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
        <span className="material-icons-round text-[18px]">arrow_back</span>
        Back to courses
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${TYPE_COLORS[course.type] ?? "bg-slate-700 text-slate-300"}`}>
            {TYPE_LABELS[course.type] ?? course.type}
          </span>
          {course.skill_level && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 capitalize">
              {SKILL_LABELS[course.skill_level] ?? course.skill_level}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">{course.title}</h1>
        <p className="text-slate-400 leading-relaxed">{course.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {/* Details card */}
        <div className="md:col-span-2 bg-card-dark border border-border-dark rounded-xl p-5 space-y-4">
          <h2 className="text-base font-bold text-white">Course Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Age group</p>
              <p className="text-sm text-slate-200 font-medium">{formatAge(course.age_min, course.age_max)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Skill level</p>
              <p className="text-sm text-slate-200 font-medium capitalize">{SKILL_LABELS[course.skill_level] ?? course.skill_level ?? "—"}</p>
            </div>
            {course.day_of_week && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Schedule</p>
                <p className="text-sm text-slate-200 font-medium">{course.day_of_week}s</p>
              </div>
            )}
            {course.start_time && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Time</p>
                <p className="text-sm text-slate-200 font-medium">
                  {formatTime(course.start_time)}–{formatTime(course.end_time)}
                  <span className="text-slate-500 ml-1">({formatDuration(course.start_time, course.end_time)})</span>
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Class size</p>
              <p className="text-sm text-slate-200 font-medium">Max {course.max_students} students</p>
            </div>
          </div>

          {loc && (
            <div className="border-t border-border-dark pt-4">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Location</p>
              <p className="text-sm text-white font-medium">{loc.name}</p>
              {loc.address && (
                <p className="text-sm text-slate-400">{loc.address}, {loc.city}, {loc.province}</p>
              )}
              {loc.phone && (
                <p className="text-sm text-slate-400 mt-0.5">{loc.phone}</p>
              )}
            </div>
          )}
        </div>

        {/* Pricing + CTA */}
        <div className="bg-card-dark border border-border-dark rounded-xl p-5 flex flex-col">
          <h2 className="text-base font-bold text-white mb-4">Pricing</h2>

          <div className="space-y-3 flex-1">
            <div className="bg-success/5 border border-success/20 rounded-lg p-3">
              <p className="text-success text-sm font-semibold">
                {Number(course.price_trial) === 0 ? "Free trial class" : `$${course.price_trial} trial`}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">Try before committing</p>
            </div>

            {course.price_monthly && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-primary text-sm font-semibold">${course.price_monthly}<span className="text-slate-500 font-normal">/month</span></p>
                <p className="text-slate-500 text-xs mt-0.5">Full enrollment</p>
              </div>
            )}
          </div>

          <Link
            href={`/courses/${course.id}/enroll`}
            className="mt-5 w-full bg-primary hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg shadow-[0_0_10px_rgba(43,108,238,0.2)] transition-all duration-200 text-sm text-center"
          >
            Enroll now
          </Link>
          <p className="text-xs text-slate-600 text-center mt-2">No commitment for trial class</p>
        </div>
      </div>
    </div>
  );
}
