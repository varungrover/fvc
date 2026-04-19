import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  trial: { label: "Trial", classes: "bg-caution/10 text-caution" },
  active: { label: "Active", classes: "bg-success/10 text-success" },
  pending_payment: { label: "Pending", classes: "bg-warning/10 text-warning" },
};

export default async function CoachStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get courses this coach teaches via their sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select("course_id")
    .eq("coach_id", user.id);

  const courseIds = [...new Set((sessions ?? []).map((s) => s.course_id))];

  let students: any[] = [];

  if (courseIds.length > 0) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select(`
        id, status,
        students(id, full_name, date_of_birth, grade, cfc_id),
        courses(id, title, type)
      `)
      .in("course_id", courseIds)
      .in("status", ["active", "trial", "pending_payment"])
      .order("status");

    // Deduplicate by student id, collecting their courses
    const byStudent: Record<string, any> = {};
    for (const e of enrollments ?? []) {
      const s = e.students as any;
      if (!s) continue;
      if (!byStudent[s.id]) {
        byStudent[s.id] = { ...s, enrollments: [] };
      }
      byStudent[s.id].enrollments.push({ status: e.status, course: e.courses });
    }
    students = Object.values(byStudent);
  }

  const filtered = q
    ? students.filter((s) => s.full_name.toLowerCase().includes(q.toLowerCase()))
    : students;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Students</h1>
          <p className="text-slate-500 text-sm mt-1">Students enrolled in courses you teach.</p>
        </div>
        <span className="text-xs text-slate-500 bg-surface-dark border border-border-dark rounded-lg px-3 py-2 font-medium">
          {students.length} student{students.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-slate-500 text-xl">search</span>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search students by name..."
            className="w-full border border-border-dark rounded-lg py-2.5 pl-10 pr-4 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
          />
        </div>
      </form>

      {courseIds.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-12 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">groups</span>
          <p className="text-slate-500 font-medium">No sessions assigned yet</p>
          <p className="text-slate-500 text-sm mt-1">Students will appear here once you are assigned to sessions.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-12 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">person_off</span>
          <p className="text-slate-500 font-medium">{q ? "No students match your search" : "No students enrolled yet"}</p>
        </div>
      ) : (
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="bg-[#151c2b] border-b border-border-dark">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Student</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Grade</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">CFC ID</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Enrolled In</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((student: any) => {
                  const initials = student.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
                  const age = student.date_of_birth
                    ? Math.floor((Date.now() - new Date(student.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                    : null;
                  return (
                    <tr key={student.id} className="hover:bg-card-hover hover:shadow-md transition-colors duration-150">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{initials}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{student.full_name}</p>
                            {age && <p className="text-xs text-slate-500">{age} years old</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-700">{student.grade ?? "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">{student.cfc_id ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {student.enrollments.map((e: any, i: number) => {
                            const s = STATUS_STYLES[e.status] ?? { label: e.status, classes: "bg-slate-700 text-slate-500" };
                            return (
                              <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.classes}`} title={e.course?.title}>
                                {e.course?.title?.slice(0, 22) ?? "Course"} — {s.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-gray-100">
            {filtered.map((student: any) => {
              const initials = student.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div key={student.id} className="px-5 py-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{student.full_name}</p>
                      <p className="text-xs text-slate-500">Grade: {student.grade ?? "—"}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 ml-11">
                    {student.enrollments.map((e: any, i: number) => {
                      const s = STATUS_STYLES[e.status] ?? { label: e.status, classes: "bg-slate-700 text-slate-500" };
                      return (
                        <span key={i} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.classes}`}>
                          {e.course?.title?.slice(0, 20) ?? "Course"} — {s.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
