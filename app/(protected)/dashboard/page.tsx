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

  // ── COACH DASHBOARD ──────────────────────────────────────────────────────
  if (role === "coach") {
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const todayEnd = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString();

    const [{ data: todaySessions }, { data: upcomingSessions }, { data: recentAttendance }] =
      await Promise.all([
        supabase
          .from("sessions")
          .select("id, start_at, end_at, notes, courses(title, type, locations(name))")
          .eq("coach_id", user.id)
          .gte("start_at", todayStart)
          .lte("start_at", todayEnd)
          .order("start_at"),
        supabase
          .from("sessions")
          .select("id, start_at, end_at, courses(title, type)")
          .eq("coach_id", user.id)
          .gte("start_at", new Date().toISOString())
          .lte("start_at", weekEnd)
          .order("start_at")
          .limit(5),
        supabase
          .from("attendance")
          .select("status, is_late, sessions!inner(coach_id)")
          .eq("sessions.coach_id", user.id)
          .gte("checked_in_at", new Date(Date.now() - 30 * 86400000).toISOString()),
      ]);

    const presentCount = (recentAttendance ?? []).filter(
      (a: any) => a.status === "present" || a.status === "late"
    ).length;
    const totalAtt = recentAttendance?.length ?? 0;
    const attRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;

    function fmt(dt: string) {
      return new Date(dt).toLocaleTimeString("en-CA", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    function fmtDate(dt: string) {
      const d = new Date(dt);
      const t = new Date();
      if (d.toDateString() === t.toDateString()) return "Today";
      return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
    }

    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Good morning, {name} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Here&apos;s what&apos;s happening today.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Today's sessions", value: todaySessions?.length ?? 0, icon: "event", color: "primary" },
            { label: "This week", value: upcomingSessions?.length ?? 0, icon: "calendar_month", color: "success" },
            { label: "Attendance rate (30d)", value: `${attRate}%`, icon: "how_to_reg", color: "warning" },
          ].map((s) => (
            <div key={s.label} className="bg-card-dark border border-border-dark rounded-xl p-5">
              <div className={`w-10 h-10 rounded-xl bg-${s.color}/15 flex items-center justify-center mb-3`}>
                <span className={`material-icons-round text-${s.color} text-xl`}>{s.icon}</span>
              </div>
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Today's Sessions */}
          <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Today&apos;s Sessions</h2>
              <Link href="/coach/schedule" className="text-xs text-primary hover:text-blue-400">View schedule →</Link>
            </div>
            {!todaySessions || todaySessions.length === 0 ? (
              <div className="px-5 py-10 text-center text-slate-500 text-sm">No sessions today</div>
            ) : (
              <div className="divide-y divide-border-dark">
                {todaySessions.map((s: any) => (
                  <div key={s.id} className="px-5 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{s.courses?.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{fmt(s.start_at)} – {fmt(s.end_at)}</p>
                      </div>
                      <Link
                        href={`/coach/attendance?session=${s.id}`}
                        className="text-xs font-medium text-primary hover:text-blue-400 flex items-center gap-1"
                      >
                        <span className="material-icons-round text-sm">how_to_reg</span>
                        Attendance
                      </Link>
                    </div>
                    {s.courses?.locations?.name && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span className="material-icons-round text-[13px]">location_on</span>
                        {s.courses.locations.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming this week */}
          <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-dark">
              <h2 className="text-base font-bold text-white">Upcoming This Week</h2>
            </div>
            {!upcomingSessions || upcomingSessions.length === 0 ? (
              <div className="px-5 py-10 text-center text-slate-500 text-sm">No upcoming sessions</div>
            ) : (
              <div className="divide-y divide-border-dark">
                {upcomingSessions.map((s: any) => (
                  <div key={s.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons-round text-primary text-sm">school</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{s.courses?.title}</p>
                      <p className="text-xs text-slate-500">{fmtDate(s.start_at)} · {fmt(s.start_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Attendance", href: "/coach/attendance", icon: "how_to_reg" },
            { label: "My Schedule", href: "/coach/schedule", icon: "calendar_month" },
            { label: "Trials", href: "/coach/trials", icon: "person_add" },
            { label: "Leave Request", href: "/coach/leave", icon: "event_busy" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border-dark bg-surface-dark hover:bg-surface-hover text-slate-300 text-sm font-medium transition-all"
            >
              <span className="material-icons-round text-slate-400 text-lg">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // ── PARENT DASHBOARD ─────────────────────────────────────────────────────
  if (role === "parent") {
    const now = new Date().toISOString();
    const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString();

    const [{ data: children }, { data: enrollments }, { data: upcomingSessions }, { data: recentAttendance }, { data: events }] =
      await Promise.all([
        supabase.from("students").select("id, full_name, grade").eq("parent_id", user.id),
        supabase
          .from("enrollments")
          .select("id, status, student_id, courses(title, type)")
          .in("status", ["active", "trial"])
          .in(
            "student_id",
            (await supabase.from("students").select("id").eq("parent_id", user.id)).data?.map((s) => s.id) ?? []
          ),
        supabase
          .from("sessions")
          .select("id, start_at, end_at, courses!inner(title, locations(name)), enrollments!inner(student_id, students(full_name))")
          .gte("start_at", now)
          .lte("start_at", weekAhead)
          .eq("status", "scheduled")
          .in(
            "enrollments.student_id",
            (await supabase.from("students").select("id").eq("parent_id", user.id)).data?.map((s) => s.id) ?? []
          )
          .order("start_at")
          .limit(5),
        supabase
          .from("attendance")
          .select("status, is_late, student_id, checked_in_at, sessions(start_at, courses(title))")
          .in(
            "student_id",
            (await supabase.from("students").select("id").eq("parent_id", user.id)).data?.map((s) => s.id) ?? []
          )
          .order("checked_in_at", { ascending: false })
          .limit(10),
        supabase
          .from("events")
          .select("id, title, type, event_date, price")
          .gte("event_date", new Date().toISOString().split("T")[0])
          .order("event_date")
          .limit(3),
      ]);

    const lateCount = (recentAttendance ?? []).filter((a: any) => a.is_late).length;
    const absentCount = (recentAttendance ?? []).filter((a: any) => a.status === "absent").length;

    const notifications: { icon: string; color: string; text: string }[] = [];
    if (lateCount > 0)
      notifications.push({ icon: "schedule", color: "text-warning", text: `${lateCount} late arrival${lateCount > 1 ? "s" : ""} in recent sessions` });
    if (absentCount > 0)
      notifications.push({ icon: "cancel", color: "text-error", text: `${absentCount} absence${absentCount > 1 ? "s" : ""} recorded recently` });
    if ((enrollments ?? []).some((e: any) => e.status === "trial"))
      notifications.push({ icon: "info", color: "text-primary", text: "You have active trial enrollments — consider converting to full" });

    function fmt(dt: string) {
      return new Date(dt).toLocaleTimeString("en-CA", { hour: "numeric", minute: "2-digit", hour12: true });
    }
    function fmtDate(dt: string) {
      const d = new Date(dt);
      const t = new Date();
      if (d.toDateString() === t.toDateString()) return "Today";
      return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
    }
    function fmtEventDate(dt: string) {
      return new Date(dt).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
    }

    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Hi, {name} 👋</h1>
          <p className="text-slate-400 text-sm mt-1">Here&apos;s everything for your family.</p>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="mb-6 space-y-2">
            {notifications.map((n, i) => (
              <div key={i} className="bg-card-dark border border-border-dark rounded-xl px-4 py-3 flex items-center gap-3">
                <span className={`material-icons-round ${n.color} text-lg`}>{n.icon}</span>
                <p className="text-sm text-slate-300">{n.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Children cards */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-white">Children</h2>
            <Link href="/parent/children" className="text-xs text-primary hover:text-blue-400">Manage →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(children ?? []).map((child: any) => {
              const childEnrollments = (enrollments ?? []).filter((e: any) => e.student_id === child.id);
              const active = childEnrollments.filter((e: any) => e.status === "active").length;
              const trial = childEnrollments.filter((e: any) => e.status === "trial").length;
              const initials = child.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
              return (
                <div key={child.id} className="bg-card-dark border border-border-dark rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{child.full_name}</p>
                      {child.grade && <p className="text-xs text-slate-500">Grade {child.grade}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {active > 0 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">{active} active</span>}
                    {trial > 0 && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning">{trial} trial</span>}
                    {childEnrollments.length === 0 && <span className="text-xs text-slate-500">Not enrolled</span>}
                  </div>
                  <Link
                    href={`/parent/progress/${child.id}`}
                    className="mt-3 text-xs text-primary hover:text-blue-400 flex items-center gap-1"
                  >
                    <span className="material-icons-round text-[14px]">insights</span>
                    View progress
                  </Link>
                </div>
              );
            })}
            <Link
              href="/parent/children/add"
              className="bg-surface-dark border border-dashed border-border-dark rounded-xl p-5 flex flex-col items-center justify-center gap-2 hover:bg-surface-hover hover:border-primary/40 transition-all text-slate-500 hover:text-primary"
            >
              <span className="material-icons-round text-2xl">add_circle_outline</span>
              <span className="text-xs font-medium">Add child</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming sessions */}
          <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Upcoming Sessions</h2>
              <Link href="/parent/enrollments" className="text-xs text-primary hover:text-blue-400">All →</Link>
            </div>
            {!upcomingSessions || upcomingSessions.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">No sessions this week</div>
            ) : (
              <div className="divide-y divide-border-dark">
                {upcomingSessions.map((s: any) => (
                  <div key={s.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">{s.courses?.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{fmtDate(s.start_at)} · {fmt(s.start_at)}</p>
                      </div>
                      <Link
                        href="/student/checkin"
                        className="text-xs text-primary hover:text-blue-400 flex items-center gap-0.5 mt-0.5"
                      >
                        <span className="material-icons-round text-[13px]">how_to_reg</span>
                        Check in
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Events */}
          <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border-dark flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Upcoming Events</h2>
              <Link href="/events" className="text-xs text-primary hover:text-blue-400">See all →</Link>
            </div>
            {!events || events.length === 0 ? (
              <div className="px-5 py-8 text-center text-slate-500 text-sm">No upcoming events</div>
            ) : (
              <div className="divide-y divide-border-dark">
                {events.map((e: any) => (
                  <div key={e.id} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center flex-shrink-0 text-center">
                      <span className="text-purple-400 text-xs font-bold leading-none">{fmtEventDate(e.event_date)}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{e.title}</p>
                      <p className="text-xs text-slate-500 capitalize">{e.type.replace("_", " ")} · {e.price > 0 ? `$${e.price}` : "Free"}</p>
                    </div>
                    <Link href="/events" className="text-xs text-primary hover:text-blue-400">RSVP</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Browse Courses", href: "/courses", icon: "school" },
            { label: "Payments", href: "/parent/payments", icon: "receipt_long" },
            { label: "Book Feedback", href: "/parent/feedback", icon: "forum" },
            { label: "Events", href: "/events", icon: "emoji_events" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border border-border-dark bg-surface-dark hover:bg-surface-hover text-slate-300 text-sm font-medium transition-all"
            >
              <span className="material-icons-round text-slate-400 text-lg">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Default dashboard for other roles (student, etc.)
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
