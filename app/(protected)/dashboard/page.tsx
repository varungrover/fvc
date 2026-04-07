import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "parent";
  const name = profile?.full_name?.split(" ")[0] ?? "there";

  // Admin / super_admin dashboard
  if (role === "admin" || role === "super_admin") {
    const [
      { count: totalStudents },
      { count: totalEnrollments },
      { count: activeCourses },
      { count: totalSessions },
      { data: recentEnrollments },
      { data: courses },
    ] = await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("enrollments").select("*", { count: "exact", head: true }),
      supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("status", "active"),
      supabase.from("sessions").select("*", { count: "exact", head: true }),
      supabase
        .from("enrollments")
        .select("id, status, enrolled_at, students(full_name), courses(title, type)")
        .order("enrolled_at", { ascending: false })
        .limit(5),
      supabase
        .from("courses")
        .select("id, title, type, status, price_monthly, locations(name)")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const stats = [
      {
        label: "Total Students",
        value: totalStudents ?? 0,
        icon: "groups",
        color: "primary",
        href: "/admin/students",
      },
      {
        label: "Active Enrollments",
        value: totalEnrollments ?? 0,
        icon: "assignment_turned_in",
        color: "success",
        href: "/admin/students",
      },
      {
        label: "Active Courses",
        value: activeCourses ?? 0,
        icon: "school",
        color: "indigo",
        href: "/admin/courses",
      },
      {
        label: "Sessions Scheduled",
        value: totalSessions ?? 0,
        icon: "event",
        color: "purple",
        href: "/admin/sessions",
      },
    ];

    const colorMap: Record<string, string> = {
      primary: "bg-primary/15 text-primary",
      success: "bg-success/15 text-success",
      indigo: "bg-indigo/15 text-indigo",
      purple: "bg-purple/15 text-purple",
    };
    const borderMap: Record<string, string> = {
      primary: "hover:border-primary/40",
      success: "hover:border-emerald-500/40",
      indigo: "hover:border-indigo/40",
      purple: "hover:border-purple/40",
    };

    const statusStyles: Record<string, string> = {
      trial: "bg-caution/10 text-caution",
      active: "bg-success/10 text-success",
      pending_payment: "bg-warning/10 text-warning",
      cancelled: "bg-error/10 text-error",
    };

    const typeLabels: Record<string, string> = {
      lesson: "Lesson",
      club: "Club",
      camp: "Camp",
      tournament: "Tournament",
    };

    return (
      <div className="p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">
            Welcome back, {name}. Here&apos;s your overview.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className={`bg-card-dark rounded-xl border border-border-dark p-5 flex items-start gap-4 ${borderMap[stat.color]} hover:shadow-xl transition-all duration-300 cursor-pointer group`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${colorMap[stat.color]} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
              >
                <span className="material-icons-round text-xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-white mt-0.5">{stat.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent enrollments */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Recent Enrollments</h2>
              <Link
                href="/admin/students"
                className="text-xs text-primary hover:text-blue-400 font-medium transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="bg-card-dark border border-border-dark rounded-xl divide-y divide-border-dark overflow-hidden">
              {recentEnrollments && recentEnrollments.length > 0 ? (
                recentEnrollments.map((e: any) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-card-hover transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {e.students?.full_name}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {e.courses?.title}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${statusStyles[e.status] ?? "bg-slate-700 text-slate-400"}`}
                    >
                      {e.status?.replace("_", " ")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-slate-500 text-sm">
                  No enrollments yet
                </div>
              )}
            </div>
          </div>

          {/* Active courses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Active Courses</h2>
              <Link
                href="/admin/courses"
                className="text-xs text-primary hover:text-blue-400 font-medium transition-colors"
              >
                Manage →
              </Link>
            </div>
            <div className="bg-card-dark border border-border-dark rounded-xl divide-y divide-border-dark overflow-hidden">
              {courses && courses.length > 0 ? (
                courses.map((c: any) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-card-hover transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {c.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {(c.locations as any)?.name ?? "—"} · {typeLabels[c.type] ?? c.type}
                      </p>
                    </div>
                    {c.price_monthly && (
                      <span className="text-sm text-slate-300 font-medium flex-shrink-0">
                        ${c.price_monthly}/mo
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-5 py-8 text-center text-slate-500 text-sm">
                  No active courses
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-base font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/admin/courses"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-primary hover:bg-blue-600 text-white text-sm font-medium transition-all duration-200 shadow-[0_0_10px_rgba(43,108,238,0.2)]"
            >
              <span className="material-icons-round text-xl">add_circle</span>
              Create Course
            </Link>
            <Link
              href="/admin/sessions"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border-dark bg-surface-dark hover:bg-surface-hover text-slate-200 text-sm font-medium transition-all"
            >
              <span className="material-icons-round text-slate-400 text-xl">calendar_month</span>
              Schedule Sessions
            </Link>
            <Link
              href="/admin/coupons"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border-dark bg-surface-dark hover:bg-surface-hover text-slate-200 text-sm font-medium transition-all"
            >
              <span className="material-icons-round text-slate-400 text-xl">local_offer</span>
              Manage Coupons
            </Link>
            <Link
              href="/admin/merchandise"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border-dark bg-surface-dark hover:bg-surface-hover text-slate-200 text-sm font-medium transition-all"
            >
              <span className="material-icons-round text-slate-400 text-xl">inventory_2</span>
              Merchandise Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Default dashboard for other roles (parent, student, coach, etc.)
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Hi, {name} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">
          Welcome to your {role.replace("_", " ")} dashboard.
        </p>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl p-6 text-center max-w-md">
        <span className="material-icons-round text-4xl text-slate-600 mb-3 block">
          construction
        </span>
        <p className="text-slate-300 font-medium">Dashboard coming soon</p>
        <p className="text-slate-500 text-sm mt-1">
          This section will be built in the next stage.
        </p>
      </div>
    </div>
  );
}
