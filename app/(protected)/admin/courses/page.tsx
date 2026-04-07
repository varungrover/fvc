import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CourseCreateForm from "./CourseCreateForm";

const TYPE_COLORS: Record<string, string> = {
  lesson: "bg-primary/15 text-primary",
  club: "bg-success/15 text-success",
  camp: "bg-warning/15 text-warning",
  tournament: "bg-purple/15 text-purple",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-success/10 text-success",
  draft: "bg-slate-700 text-slate-400",
  archived: "bg-error/10 text-error",
};

function formatTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: courses }, { data: locations }] = await Promise.all([
    supabase
      .from("courses")
      .select("*, locations(name, city), enrollments(id)")
      .order("created_at", { ascending: false }),
    supabase.from("locations").select("id, name, city").eq("is_active", true).order("name"),
  ]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Course Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            Create, edit, and manage courses.
          </p>
        </div>
      </div>

      {/* Create course form */}
      <div className="mb-8">
        <CourseCreateForm locations={locations ?? []} />
      </div>

      {/* Courses list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            All Courses ({courses?.length ?? 0})
          </h2>
        </div>

        {!courses || courses.length === 0 ? (
          <div className="bg-card-dark border border-border-dark rounded-xl p-12 text-center">
            <span className="material-icons-round text-[48px] text-slate-600 block mb-3">
              school
            </span>
            <p className="text-slate-400 font-medium">No courses created yet</p>
          </div>
        ) : (
          <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#151c2b] border-b border-border-dark">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Course
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                    Schedule
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                    Location
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                    Price
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Enrolled
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {courses.map((course: any) => (
                  <tr
                    key={course.id}
                    className="hover:bg-card-hover transition-colors duration-150"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[course.type] ?? "bg-slate-700 text-slate-400"}`}
                        >
                          {course.type}
                        </span>
                        <p className="text-sm font-medium text-white">{course.title}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      {course.day_of_week ? (
                        <p className="text-sm text-slate-300">
                          {course.day_of_week}s · {formatTime(course.start_time)}–
                          {formatTime(course.end_time)}
                        </p>
                      ) : (
                        <span className="text-sm text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-300 hidden md:table-cell">
                      {(course.locations as any)?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-white font-medium">
                        {course.price_monthly ? `$${course.price_monthly}/mo` : "Free"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-slate-300 font-medium">
                        {course.enrollments?.length ?? 0}
                        {course.max_students && (
                          <span className="text-slate-500">/{course.max_students}</span>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[course.status] ?? "bg-slate-700 text-slate-400"}`}
                      >
                        {course.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
