import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ROLE_STYLES: Record<string, { label: string; classes: string }> = {
  coach: { label: "Coach", classes: "bg-primary/10 text-primary" },
  admin: { label: "Admin", classes: "bg-purple/10 text-purple" },
};

const LEAVE_STATUS: Record<string, { label: string; classes: string }> = {
  pending: { label: "Pending", classes: "bg-warning/10 text-warning" },
  approved: { label: "Approved", classes: "bg-success/10 text-success" },
  rejected: { label: "Rejected", classes: "bg-error/10 text-error" },
};

export default async function AdminStaffPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: staff }, { data: leaves }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, role, created_at")
      .in("role", ["coach", "admin"])
      .order("role")
      .order("full_name"),
    supabase
      .from("coach_leaves")
      .select("id, coach_id, start_date, end_date, reason, status")
      .order("start_date", { ascending: false }),
  ]);

  const leavesByCoach: Record<string, typeof leaves> = {};
  for (const leave of leaves ?? []) {
    if (!leavesByCoach[leave.coach_id]) leavesByCoach[leave.coach_id] = [];
    leavesByCoach[leave.coach_id]!.push(leave);
  }

  const pendingCount = (leaves ?? []).filter((l) => l.status === "pending").length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Staff</h1>
          <p className="text-slate-400 text-sm mt-1">Coaches and admins at this location.</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <span className="text-xs font-semibold bg-warning/10 text-warning border border-warning/20 rounded-lg px-3 py-2">
              {pendingCount} pending leave request{pendingCount !== 1 ? "s" : ""}
            </span>
          )}
          <span className="text-xs text-slate-500 bg-surface-dark border border-border-dark rounded-lg px-3 py-2 font-medium">
            {staff?.length ?? 0} staff members
          </span>
        </div>
      </div>

      {!staff || staff.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl p-12 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">badge</span>
          <p className="text-slate-400 font-medium">No staff members yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {staff.map((member: any) => {
            const roleStyle = ROLE_STYLES[member.role] ?? { label: member.role, classes: "bg-slate-700 text-slate-400" };
            const memberLeaves = leavesByCoach[member.id] ?? [];
            const pendingLeaves = memberLeaves.filter((l) => l.status === "pending");
            const initials = member.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
            const joined = new Date(member.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });

            return (
              <div key={member.id} className="bg-card-dark border border-border-dark rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-indigo/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-semibold">{member.full_name}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleStyle.classes}`}>
                        {roleStyle.label}
                      </span>
                      {pendingLeaves.length > 0 && (
                        <span className="text-xs font-semibold bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                          {pendingLeaves.length} leave pending
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <span className="material-icons-round text-[14px] text-slate-500">email</span>
                        {member.email}
                      </span>
                      {member.phone && (
                        <span className="flex items-center gap-1">
                          <span className="material-icons-round text-[14px] text-slate-500">phone</span>
                          {member.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-500">
                        <span className="material-icons-round text-[14px]">calendar_today</span>
                        Joined {joined}
                      </span>
                    </div>

                    {/* Leave requests for coaches */}
                    {member.role === "coach" && memberLeaves.length > 0 && (
                      <div className="mt-3 space-y-1.5">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave requests</p>
                        {memberLeaves.slice(0, 3).map((leave: any) => {
                          const s = LEAVE_STATUS[leave.status] ?? { label: leave.status, classes: "bg-slate-700 text-slate-400" };
                          return (
                            <div key={leave.id} className="flex items-center gap-3 bg-surface-dark rounded-lg px-3 py-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.classes}`}>{s.label}</span>
                              <span className="text-xs text-slate-300">
                                {leave.start_date} → {leave.end_date}
                              </span>
                              {leave.reason && (
                                <span className="text-xs text-slate-500 truncate">{leave.reason}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
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
