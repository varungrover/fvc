import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STATUS_STYLES: Record<string, { label: string; classes: string }> = {
  trial: { label: "Trial", classes: "bg-caution/10 text-caution" },
  active: { label: "Active", classes: "bg-success/10 text-success" },
  pending_payment: { label: "Pending", classes: "bg-warning/10 text-warning" },
  cancelled: { label: "Cancelled", classes: "bg-error/10 text-error" },
  completed: { label: "Completed", classes: "bg-slate-700 text-slate-400" },
};

export default async function AdminStudentsPage({
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

  // Get all students with parent info and enrollment counts
  let query = supabase
    .from("students")
    .select(`
      id, full_name, date_of_birth, grade, cfc_id, created_at,
      profiles!students_parent_id_fkey(full_name, email, phone),
      enrollments(id, status, courses(title))
    `)
    .order("full_name");

  if (q) {
    query = query.ilike("full_name", `%${q}%`);
  }

  const { data: students } = await query;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Student Management</h1>
          <p className="text-slate-400 text-sm mt-1">
            View and manage all students across locations.
          </p>
        </div>
        <span className="text-xs text-slate-500 bg-surface-dark border border-border-dark rounded-lg px-3 py-2 font-medium">
          {students?.length ?? 0} student{(students?.length ?? 0) !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Search */}
      <form className="mb-6">
        <div className="relative max-w-md">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-slate-500 text-xl">
            search
          </span>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search students by name..."
            className="w-full border border-border-dark rounded-lg py-2.5 pl-10 pr-4 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
          />
        </div>
      </form>

      {/* Students list */}
      {!students || students.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl p-12 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">
            person_off
          </span>
          <p className="text-slate-400 font-medium">
            {q ? "No students match your search" : "No students registered yet"}
          </p>
        </div>
      ) : (
        <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="bg-[#151c2b] border-b border-border-dark">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Student
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Parent
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Grade
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    CFC ID
                  </th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Enrollments
                  </th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {students.map((student: any) => {
                  const parent = student.profiles;
                  const enrollments = student.enrollments ?? [];
                  const activeCount = enrollments.filter(
                    (e: any) => e.status === "active" || e.status === "trial"
                  ).length;
                  const initials = student.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-card-hover transition-colors duration-150"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{initials}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {student.full_name}
                            </p>
                            {student.date_of_birth && (
                              <p className="text-xs text-slate-500">
                                DOB: {student.date_of_birth}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-slate-300">{parent?.full_name ?? "—"}</p>
                        <p className="text-xs text-slate-500">{parent?.email ?? ""}</p>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-300">
                        {student.grade ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-400 font-mono">
                        {student.cfc_id ?? "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {enrollments.length === 0 ? (
                            <span className="text-xs text-slate-600">None</span>
                          ) : (
                            enrollments.map((e: any) => {
                              const style =
                                STATUS_STYLES[e.status] ?? {
                                  label: e.status,
                                  classes: "bg-slate-700 text-slate-400",
                                };
                              return (
                                <span
                                  key={e.id}
                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${style.classes}`}
                                  title={e.courses?.title}
                                >
                                  {e.courses?.title?.slice(0, 20) ?? "Course"} — {style.label}
                                </span>
                              );
                            })
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          href={`/admin/students/${student.id}`}
                          className="text-xs text-primary hover:text-purple-300 font-medium transition-colors"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-border-dark">
            {students.map((student: any) => {
              const parent = student.profiles;
              const initials = student.full_name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <div key={student.id} className="px-5 py-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">{initials}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{student.full_name}</p>
                      <p className="text-xs text-slate-500">
                        Grade: {student.grade ?? "—"} · Parent: {parent?.full_name ?? "—"}
                      </p>
                    </div>
                    <Link
                      href={`/admin/students/${student.id}`}
                      className="text-xs text-primary font-medium"
                    >
                      View
                    </Link>
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
