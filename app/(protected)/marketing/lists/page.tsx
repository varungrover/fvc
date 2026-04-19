import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type Segment = {
  key: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  count: number;
  members: { name: string; email: string; detail: string }[];
};

export default async function MarketingListsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Active students — enrolled with status 'active'
  const { data: activeEnrollments } = await supabase
    .from("enrollments")
    .select("student_id, students(full_name, profiles!students_parent_id_fkey(email)), courses(title)")
    .eq("status", "active");

  // Trial leads — enrolled with status 'trial'
  const { data: trialEnrollments } = await supabase
    .from("enrollments")
    .select("student_id, students(full_name, profiles!students_parent_id_fkey(email)), courses(title)")
    .eq("status", "trial");

  // Lapsed — students with enrollments but none currently active
  const { data: allStudents } = await supabase
    .from("students")
    .select("id, full_name, parent_id, profiles!students_parent_id_fkey(email)");

  const activeStudentIds = new Set(
    (activeEnrollments ?? []).map((e) => e.student_id)
  );
  const trialStudentIds = new Set(
    (trialEnrollments ?? []).map((e) => e.student_id)
  );
  const lapsedStudents = (allStudents ?? []).filter(
    (s) => !activeStudentIds.has(s.id) && !trialStudentIds.has(s.id)
  );

  // All leads from the leads table
  const { data: leads } = await supabase
    .from("leads")
    .select("full_name, email, status, source")
    .order("created_at", { ascending: false });

  // Dedup active students by parent email
  const activeMap = new Map<string, { name: string; email: string; detail: string }>();
  for (const e of activeEnrollments ?? []) {
    const s = e.students as any;
    const email = s?.profiles?.email ?? "";
    if (email && !activeMap.has(email)) {
      activeMap.set(email, {
        name: s?.full_name ?? "",
        email,
        detail: (e.courses as any)?.title ?? "",
      });
    }
  }

  const trialMap = new Map<string, { name: string; email: string; detail: string }>();
  for (const e of trialEnrollments ?? []) {
    const s = e.students as any;
    const email = s?.profiles?.email ?? "";
    if (email && !trialMap.has(email)) {
      trialMap.set(email, {
        name: s?.full_name ?? "",
        email,
        detail: (e.courses as any)?.title ?? "",
      });
    }
  }

  const segments: Segment[] = [
    {
      key: "active_students",
      label: "Active Students",
      description: "Parents of currently enrolled students",
      icon: "school",
      color: "text-success",
      count: activeMap.size,
      members: [...activeMap.values()],
    },
    {
      key: "trial_leads",
      label: "Trial Leads",
      description: "Students on a trial enrollment — ready to convert",
      icon: "hourglass_top",
      color: "text-warning",
      count: trialMap.size,
      members: [...trialMap.values()],
    },
    {
      key: "lapsed",
      label: "Lapsed Students",
      description: "Students with no active or trial enrollment",
      icon: "person_off",
      color: "text-error",
      count: lapsedStudents.length,
      members: lapsedStudents.map((s: any) => ({
        name: s.full_name,
        email: s.profiles?.email ?? "",
        detail: "No active enrollment",
      })),
    },
    {
      key: "all_leads",
      label: "All Leads",
      description: "Everyone in the prospect pipeline",
      icon: "person_add",
      color: "text-primary",
      count: (leads ?? []).length,
      members: (leads ?? []).map((l) => ({
        name: l.full_name,
        email: l.email,
        detail: `${l.source.replace(/_/g, " ")} · ${l.status.replace(/_/g, " ")}`,
      })),
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Marketing Lists</h1>
        <p className="text-slate-500 text-sm mt-1">
          Segmented audiences for targeted campaigns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {segments.map((seg) => (
          <div key={seg.key} className="bg-card-dark border border-border-dark rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border-dark flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`material-icons-round text-[22px] ${seg.color}`}>{seg.icon}</span>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{seg.label}</p>
                  <p className="text-slate-500 text-xs">{seg.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${seg.color}`}>{seg.count}</p>
                <p className="text-xs text-slate-500">contacts</p>
              </div>
            </div>

            {/* Member preview */}
            <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
              {seg.members.length === 0 ? (
                <p className="px-5 py-4 text-sm text-slate-500">No contacts in this segment.</p>
              ) : (
                seg.members.slice(0, 8).map((m, i) => (
                  <div key={i} className="px-5 py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">{m.name}</p>
                      <p className="text-xs text-slate-500 truncate">{m.email}</p>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">{m.detail}</span>
                  </div>
                ))
              )}
              {seg.members.length > 8 && (
                <p className="px-5 py-2 text-xs text-slate-500 text-center">
                  +{seg.members.length - 8} more
                </p>
              )}
            </div>

            {/* Footer CTA */}
            <div className="px-5 py-3 border-t border-border-dark bg-surface-dark/40">
              <Link
                href={`/marketing/campaigns?list=${seg.key}`}
                className="text-xs font-semibold text-primary hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <span className="material-icons-round text-[14px]">campaign</span>
                Send campaign to this list
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
