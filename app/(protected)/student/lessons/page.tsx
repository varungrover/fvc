import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function formatTime(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

export default async function StudentLessonsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Look up the student record linked to this auth user
  const { data: student } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("user_id", user.id)
    .single();

  let enrollments: any[] = [];

  if (student) {
    const { data } = await supabase
      .from("enrollments")
      .select(`
        id, status, enrolled_at,
        courses(id, title, type, day_of_week, start_time, end_time, locations(name))
      `)
      .eq("student_id", student.id)
      .in("status", ["active", "trial"])
      .order("enrolled_at", { ascending: false });
    enrollments = data ?? [];
  }

  const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
    trial: { label: "Trial", classes: "bg-caution/10 text-caution" },
    active: { label: "Active", classes: "bg-success/10 text-success" },
  };

  if (!student) {
    return (
      <div className="p-8 max-w-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Lessons</h1>
          <p className="text-slate-500 text-sm mt-1">Your enrolled courses and schedule.</p>
        </div>
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-10 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">menu_book</span>
          <p className="text-slate-700 font-medium">Account not linked yet</p>
          <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto">
            Your parent needs to complete the student login setup from their account. Ask them to go to My Children and set up your login.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Lessons</h1>
        <p className="text-slate-500 text-sm mt-1">Your enrolled courses and schedule.</p>
      </div>

      {enrollments.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-10 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">menu_book</span>
          <p className="text-slate-500 font-medium">No active lessons</p>
          <p className="text-slate-500 text-sm mt-1">Ask your parent to enroll you in a course.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enrollments.map((e: any) => {
            const course = e.courses;
            const status = STATUS_STYLES[e.status] ?? { label: e.status, classes: "bg-slate-700 text-slate-500" };
            return (
              <div key={e.id} className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons-round text-primary text-xl">school</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-gray-900 font-semibold">{course?.title ?? "Course"}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.classes}`}>{status.label}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
                        {course?.day_of_week && (
                          <span className="flex items-center gap-1">
                            <span className="material-icons-round text-[13px]">schedule</span>
                            {course.day_of_week}s · {formatTime(course.start_time)}–{formatTime(course.end_time)}
                          </span>
                        )}
                        {course?.locations?.name && (
                          <span className="flex items-center gap-1">
                            <span className="material-icons-round text-[13px]">location_on</span>
                            {course.locations.name}
                          </span>
                        )}
                      </div>
                    </div>
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
