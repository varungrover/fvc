import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ROLE_STYLES: Record<string, { label: string; classes: string }> = {
  parent: { label: "Parent", classes: "bg-slate-700 text-slate-300" },
  student: { label: "Student", classes: "bg-indigo/10 text-indigo" },
  coach: { label: "Coach", classes: "bg-primary/10 text-primary" },
  admin: { label: "Admin", classes: "bg-purple/10 text-purple" },
  super_admin: { label: "Super Admin", classes: "bg-error/10 text-error" },
  marketing: { label: "Marketing", classes: "bg-success/10 text-success" },
};

export default async function SuperAdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const { q, role } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let query = supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, created_at")
    .order("created_at", { ascending: false });

  if (role) query = query.eq("role", role);
  if (q) query = query.ilike("full_name", `%${q}%`);

  const { data: profiles } = await query;

  const roleCounts: Record<string, number> = {};
  for (const p of profiles ?? []) {
    roleCounts[p.role] = (roleCounts[p.role] ?? 0) + 1;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 text-sm mt-1">All users across all locations.</p>
        </div>
        <span className="text-xs text-slate-500 bg-surface-dark border border-border-dark rounded-lg px-3 py-2 font-medium">
          {profiles?.length ?? 0} users
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form className="flex-1 min-w-[200px]">
          {role && <input type="hidden" name="role" value={role} />}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-icons-round text-slate-500 text-xl">search</span>
            <input
              type="text"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by name..."
              className="w-full border border-border-dark rounded-lg py-2.5 pl-10 pr-4 bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
            />
          </div>
        </form>
        <div className="flex gap-2 flex-wrap">
          {[undefined, "parent", "student", "coach", "admin", "super_admin", "marketing"].map((r) => {
            const label = r ? (ROLE_STYLES[r]?.label ?? r) : "All";
            const isActive = role === r || (!role && !r);
            return (
              <a
                key={r ?? "all"}
                href={r ? `?role=${r}${q ? `&q=${q}` : ""}` : `?${q ? `q=${q}` : ""}`}
                className={`text-xs font-semibold px-3 py-2 rounded-lg border transition-all ${
                  isActive
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-surface-dark border-border-dark text-slate-400 hover:text-white"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>
      </div>

      {!profiles || profiles.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl p-12 text-center">
          <span className="material-icons-round text-[48px] text-slate-600 block mb-3">manage_accounts</span>
          <p className="text-slate-400 font-medium">No users found</p>
        </div>
      ) : (
        <div className="bg-card-dark border border-border-dark rounded-xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="bg-[#151c2b] border-b border-border-dark">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Phone</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-dark">
                {profiles.map((profile: any) => {
                  const roleStyle = ROLE_STYLES[profile.role] ?? { label: profile.role, classes: "bg-slate-700 text-slate-400" };
                  const initials = profile.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
                  const joined = new Date(profile.created_at).toLocaleDateString("en-CA", { year: "numeric", month: "short", day: "numeric" });
                  return (
                    <tr key={profile.id} className="hover:bg-card-hover transition-colors duration-150">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-indigo/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary text-xs font-bold">{initials}</span>
                          </div>
                          <p className="text-sm font-medium text-white">{profile.full_name}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleStyle.classes}`}>{roleStyle.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-slate-300">{profile.email}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{profile.phone ?? "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{joined}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-border-dark">
            {profiles.map((profile: any) => {
              const roleStyle = ROLE_STYLES[profile.role] ?? { label: profile.role, classes: "bg-slate-700 text-slate-400" };
              const initials = profile.full_name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "?";
              return (
                <div key={profile.id} className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-indigo/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-xs font-bold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{profile.full_name}</p>
                      <p className="text-xs text-slate-500 truncate">{profile.email}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleStyle.classes}`}>{roleStyle.label}</span>
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
