import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LeadsClient from "./LeadsClient";

export default async function MarketingLeadsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: leads }, { data: locations }] = await Promise.all([
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("locations").select("id, name").order("name"),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Lead Database</h1>
        <p className="text-slate-400 text-sm mt-1">
          Track prospects from first contact to enrollment.
        </p>
      </div>
      <LeadsClient initialLeads={leads ?? []} locations={locations ?? []} />
    </div>
  );
}
