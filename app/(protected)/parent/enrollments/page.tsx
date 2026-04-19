import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  trial: { label: "Trial", classes: "bg-caution/10 text-caution" },
  active: { label: "Active", classes: "bg-success/10 text-success" },
  pending_payment: { label: "Pending payment", classes: "bg-warning/10 text-warning" },
  cancelled: { label: "Cancelled", classes: "bg-error/10 text-error" },
  completed: { label: "Completed", classes: "bg-slate-700 text-slate-400" },
};

const TYPE_LABELS: Record<string, string> = {
  lesson: "Lesson",
  club: "Club",
  camp: "Camp",
  tournament: "Tournament",
};

function formatTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

export default async function MyEnrollmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch all enrollments for all children of this parent
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      id, status, enrolled_at, trial_date,
      students!inner(id, full_name, parent_id),
      courses(id, title, type, day_of_week, start_time, end_time, price_monthly, locations(name, city))
    `)
    .eq("students.parent_id", user.id)
    .order("enrolled_at", { ascending: false });

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Enrollments</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your children's course enrollments.</p>
        </div>
        <Link
          href="/courses"
          className="flex items-center gap-2 bg-primary hover:bg-purple-600 text-white font-medium py-2.5 px-4 rounded-lg text-sm shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all"
        >
          <span className="material-icons-round text-[18px]">add</span>
          Browse courses
        </Link>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl p-12 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 mb-3 block">school</span>
          <p className="text-slate-400 font-medium">No enrollments yet</p>
          <p className="text-slate-500 text-sm mt-1 mb-5">Browse available courses and enroll your children.</p>
          <Link
            href="/courses"
            className="bg-primary hover:bg-purple-600 text-white font-medium py-2.5 px-5 rounded-lg text-sm transition-all"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment: any) => {
            const course = enrollment.courses;
            const student = enrollment.students;
            const status = STATUS_STYLES[enrollment.status] ?? { label: enrollment.status, classes: "bg-slate-700 text-slate-400" };
            const loc = course?.locations;

            return (
              <div
                key={enrollment.id}
                className="bg-card-dark border border-border-dark rounded-xl p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.classes}`}>
                        {status.label}
                      </span>
                      {course?.type && (
                        <span className="text-xs text-slate-500 font-medium">
                          {TYPE_LABELS[course.type] ?? course.type}
                        </span>
                      )}
                    </div>

                    <h3 className="text-white font-bold text-base leading-snug">
                      {course?.title ?? "Unknown course"}
                    </h3>

                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="material-icons-round text-[14px] text-slate-500">person</span>
                      <span className="text-slate-400 text-sm">{student?.full_name}</span>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                      {course?.day_of_week && (
                        <span className="flex items-center gap-1">
                          <span className="material-icons-round text-[14px]">schedule</span>
                          {course.day_of_week}s · {formatTime(course.start_time)}–{formatTime(course.end_time)}
                        </span>
                      )}
                      {loc && (
                        <span className="flex items-center gap-1">
                          <span className="material-icons-round text-[14px]">location_on</span>
                          {loc.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {course?.price_monthly && (
                      <span className="text-slate-300 text-sm font-semibold">
                        ${course.price_monthly}<span className="text-slate-500 font-normal">/mo</span>
                      </span>
                    )}

                    {enrollment.status === "trial" && (
                      <Link
                        href={`/checkout?enrollment=${enrollment.id}`}
                        className="text-xs font-semibold text-primary hover:text-purple-300 transition-colors"
                      >
                        Upgrade to full →
                      </Link>
                    )}

                    {enrollment.status === "pending_payment" && (
                      <Link
                        href={`/checkout?enrollment=${enrollment.id}`}
                        className="text-xs font-semibold bg-primary/15 text-primary hover:bg-primary/25 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Complete payment →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
