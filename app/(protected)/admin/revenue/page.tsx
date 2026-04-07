import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function fmt(n: number) {
  return n.toLocaleString("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
}

export default async function AdminRevenuePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, status, enrolled_at, courses(id, title, type, price_monthly)")
    .order("enrolled_at", { ascending: false });

  const all = enrollments ?? [];

  const active = all.filter((e) => e.status === "active");
  const trial = all.filter((e) => e.status === "trial");
  const pending = all.filter((e) => e.status === "pending_payment");
  const cancelled = all.filter((e) => e.status === "cancelled");

  const mrr = active.reduce((sum, e) => {
    const course = e.courses as any;
    return sum + (Number(course?.price_monthly) || 0);
  }, 0);

  const pendingRevenue = pending.reduce((sum, e) => {
    const course = e.courses as any;
    return sum + (Number(course?.price_monthly) || 0);
  }, 0);

  // Revenue by course (active only)
  const byCourse: Record<string, { title: string; type: string; count: number; revenue: number }> = {};
  for (const e of active) {
    const course = e.courses as any;
    if (!course) continue;
    if (!byCourse[course.id]) {
      byCourse[course.id] = { title: course.title, type: course.type, count: 0, revenue: 0 };
    }
    byCourse[course.id].count++;
    byCourse[course.id].revenue += Number(course.price_monthly) || 0;
  }
  const courseBreakdown = Object.values(byCourse).sort((a, b) => b.revenue - a.revenue);

  const stats = [
    { label: "Monthly Recurring Revenue", value: fmt(mrr), icon: "bar_chart", color: "text-success", bg: "bg-success/10" },
    { label: "Active Enrollments", value: active.length.toString(), icon: "check_circle", color: "text-primary", bg: "bg-primary/10" },
    { label: "Pending Payments", value: fmt(pendingRevenue), icon: "schedule", color: "text-warning", bg: "bg-warning/10" },
    { label: "Trial Students", value: trial.length.toString(), icon: "person_add", color: "text-caution", bg: "bg-caution/10" },
  ];

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Revenue</h1>
        <p className="text-slate-400 text-sm mt-1">Enrollment revenue overview across all courses.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-card-dark border border-border-dark rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <span className={`material-icons-round text-xl ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment status breakdown */}
        <div className="bg-card-dark border border-border-dark rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Enrollment Breakdown</h2>
          <div className="space-y-3">
            {[
              { label: "Active", count: active.length, classes: "bg-success/10 text-success" },
              { label: "Trial", count: trial.length, classes: "bg-caution/10 text-caution" },
              { label: "Pending Payment", count: pending.length, classes: "bg-warning/10 text-warning" },
              { label: "Cancelled", count: cancelled.length, classes: "bg-error/10 text-error" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${row.classes}`}>{row.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-surface-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/50 rounded-full"
                      style={{ width: all.length ? `${(row.count / all.length) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white w-6 text-right">{row.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by course */}
        <div className="bg-card-dark border border-border-dark rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Revenue by Course</h2>
          {courseBreakdown.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No active enrollments yet</p>
          ) : (
            <div className="space-y-3">
              {courseBreakdown.map((c) => (
                <div key={c.title} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{c.title}</p>
                    <p className="text-xs text-slate-500 capitalize">{c.type} · {c.count} active</p>
                  </div>
                  <span className="text-sm font-semibold text-success flex-shrink-0">{fmt(c.revenue)}/mo</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent enrollments */}
      <div className="mt-6 bg-card-dark border border-border-dark rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border-dark">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recent Enrollments</h2>
        </div>
        {all.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No enrollments yet</p>
        ) : (
          <div className="divide-y divide-border-dark">
            {all.slice(0, 10).map((e: any) => {
              const course = e.courses as any;
              const STATUS: Record<string, string> = {
                active: "bg-success/10 text-success",
                trial: "bg-caution/10 text-caution",
                pending_payment: "bg-warning/10 text-warning",
                cancelled: "bg-error/10 text-error",
                completed: "bg-slate-700 text-slate-400",
              };
              return (
                <div key={e.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-card-hover transition-colors">
                  <div>
                    <p className="text-sm font-medium text-white">{course?.title ?? "Unknown course"}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(e.enrolled_at).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {course?.price_monthly && (
                      <span className="text-sm text-slate-300">${course.price_monthly}/mo</span>
                    )}
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS[e.status] ?? "bg-slate-700 text-slate-400"}`}>
                      {e.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
