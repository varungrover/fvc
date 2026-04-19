import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminAttendancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get all sessions with attendance summary (last 30 days)
  const since = new Date(Date.now() - 30 * 86400000).toISOString();

  const { data: sessions } = await supabase
    .from("sessions")
    .select(`
      id, start_at, end_at, status,
      courses(title, type, locations(name)),
      attendance(id, status, is_late, coach_confirmed)
    `)
    .gte("start_at", since)
    .order("start_at", { ascending: false });

  // Overall stats
  const allAttendance = (sessions ?? []).flatMap((s: any) => s.attendance ?? []);
  const totalRecords = allAttendance.length;
  const presentCount = allAttendance.filter(
    (a: any) => a.status === "present" || a.status === "late"
  ).length;
  const lateCount = allAttendance.filter((a: any) => a.status === "late").length;
  const absentCount = allAttendance.filter((a: any) => a.status === "absent").length;
  const attendanceRate =
    totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  function formatTime(dt: string) {
    return new Date(dt).toLocaleTimeString("en-CA", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  function formatDate(dt: string) {
    return new Date(dt).toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Last 30 days across all sessions.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
            <span className="material-icons-round text-primary text-xl">bar_chart</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{attendanceRate}%</p>
          <p className="text-xs text-slate-500 mt-1">Overall attendance rate</p>
        </div>
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center mb-3">
            <span className="material-icons-round text-success text-xl">check_circle</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{presentCount}</p>
          <p className="text-xs text-slate-500 mt-1">Present (incl. late)</p>
        </div>
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center mb-3">
            <span className="material-icons-round text-warning text-xl">schedule</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{lateCount}</p>
          <p className="text-xs text-slate-500 mt-1">Late arrivals</p>
        </div>
        <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-error/15 flex items-center justify-center mb-3">
            <span className="material-icons-round text-error text-xl">cancel</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{absentCount}</p>
          <p className="text-xs text-slate-500 mt-1">Absences</p>
        </div>
      </div>

      {/* Sessions breakdown */}
      <div className="bg-card-dark border border-border-dark rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border-dark">
          <h2 className="text-base font-bold text-gray-900">
            Session Breakdown ({sessions?.length ?? 0} sessions)
          </h2>
        </div>

        {!sessions || sessions.length === 0 ? (
          <div className="px-5 py-12 text-center text-slate-500 text-sm">
            No sessions in the last 30 days
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-[#151c2b] border-b border-border-dark">
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Session
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                  Date & Time
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden lg:table-cell">
                  Location
                </th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Present
                </th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                  Late
                </th>
                <th className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">
                  Absent
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session: any) => {
                const att = session.attendance ?? [];
                const present = att.filter(
                  (a: any) => a.status === "present" || a.status === "late"
                ).length;
                const late = att.filter((a: any) => a.status === "late").length;
                const absent = att.filter((a: any) => a.status === "absent").length;
                const total = att.length;
                const rate = total > 0 ? Math.round((present / total) * 100) : null;
                const course = session.courses as any;

                return (
                  <tr
                    key={session.id}
                    className="hover:bg-card-hover hover:shadow-md transition-colors duration-150"
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-800">{course?.title}</p>
                      <p className="text-xs text-slate-500 capitalize mt-0.5">{course?.type}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-sm text-slate-700">{formatDate(session.start_at)}</p>
                      <p className="text-xs text-slate-500">
                        {formatTime(session.start_at)}–{formatTime(session.end_at)}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-700 hidden lg:table-cell">
                      {course?.locations?.name ?? "—"}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm font-semibold text-success">{present}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center hidden md:table-cell">
                      <span className="text-sm font-semibold text-warning">{late}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center hidden md:table-cell">
                      <span className="text-sm font-semibold text-error">{absent}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {rate !== null ? (
                        <span
                          className={`text-sm font-bold ${
                            rate >= 80
                              ? "text-success"
                              : rate >= 60
                              ? "text-warning"
                              : "text-error"
                          }`}
                        >
                          {rate}%
                        </span>
                      ) : (
                        <span className="text-slate-600 text-sm">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
