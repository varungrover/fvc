import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  const role = profile?.role ?? "parent";
  const name = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Hi, {name} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">
          Welcome to your {role.replace("_", " ")} dashboard.
        </p>
      </div>

      <div className="bg-card-dark border border-border-dark rounded-xl p-6 text-center max-w-md">
        <span className="material-icons-round text-4xl text-slate-600 mb-3 block">construction</span>
        <p className="text-slate-300 font-medium">Dashboard coming soon</p>
        <p className="text-slate-500 text-sm mt-1">
          This section will be built in the next stage.
        </p>
      </div>
    </div>
  );
}
