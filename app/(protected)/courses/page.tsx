import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CourseFilters from "./CourseFilters";
import { Suspense } from "react";

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

const SKILL_COLORS: Record<string, string> = {
  beginner: "bg-success/10 text-success",
  intermediate: "bg-caution/10 text-caution",
  advanced: "bg-error/10 text-error",
  open: "bg-slate-700 text-slate-700",
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

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; skill?: string; location?: string }>;
}) {
  const { type, skill, location } = await searchParams;
  const supabase = await createClient();

  const [{ data: locations }, coursesResult] = await Promise.all([
    supabase.from("locations").select("id, name, city").eq("is_active", true).order("name"),
    (async () => {
      let query = supabase
        .from("courses")
        .select("*, locations(name, city)")
        .eq("status", "active")
        .order("created_at", { ascending: true });

      if (type) query = query.eq("type", type);
      if (skill) query = query.eq("skill_level", skill);
      if (location) query = query.eq("location_id", location);

      return query;
    })(),
  ]);

  const courses = coursesResult.data ?? [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Course Browser</h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse and enroll your children in lessons, clubs, camps, and tournaments.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <CourseFilters locations={locations ?? []} />
        </Suspense>
      </div>

      {/* Results */}
      {courses.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <span className="material-icons-round text-[48px] mb-3 block">school</span>
          <p className="font-medium">No courses found</p>
          <p className="text-sm mt-1">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.map((course: any) => (
            <Link
              key={course.id}
              href={`/courses/${course.id}`}
              className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-5 hover:border-primary/40 hover:bg-card-hover hover:shadow-md transition-all duration-200 group flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[course.type] ?? "bg-slate-700 text-slate-700"}`}
                >
                  {TYPE_LABELS[course.type] ?? course.type}
                </span>
                {course.skill_level && (
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${SKILL_COLORS[course.skill_level] ?? "bg-slate-700 text-slate-700"}`}
                  >
                    {course.skill_level}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-gray-900 font-bold text-base mb-2 group-hover:text-primary transition-colors leading-snug">
                {course.title}
              </h3>

              {/* Description */}
              <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-4">
                {course.description}
              </p>

              {/* Meta */}
              <div className="space-y-1.5 text-sm text-slate-500 border-t border-border-dark pt-4">
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-[16px] text-slate-500">person</span>
                  {formatAge(course.age_min, course.age_max)}
                </div>
                {course.day_of_week && (
                  <div className="flex items-center gap-2">
                    <span className="material-icons-round text-[16px] text-slate-500">schedule</span>
                    {course.day_of_week}s · {formatTime(course.start_time)}–{formatTime(course.end_time)}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-[16px] text-slate-500">location_on</span>
                  {(course.locations as any)?.name ?? "—"}
                </div>
              </div>

              {/* Price */}
              <div className="mt-4 flex items-center justify-between">
                <div>
                  {Number(course.price_trial) === 0 ? (
                    <span className="text-success text-sm font-semibold">Free trial</span>
                  ) : (
                    <span className="text-slate-700 text-sm font-semibold">${course.price_trial} trial</span>
                  )}
                  {course.price_monthly && (
                    <span className="text-slate-500 text-sm"> · ${course.price_monthly}/mo</span>
                  )}
                </div>
                <span className="material-icons-round text-slate-600 group-hover:text-primary transition-colors text-[20px]">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
