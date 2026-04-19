import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LeaveRequestClient from "./LeaveRequestClient";

export default async function CoachLeavePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: leaves } = await supabase
    .from("coach_leaves")
    .select("*")
    .eq("coach_id", user.id)
    .order("start_date", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
          <p className="text-slate-500 text-sm mt-1">
            Submit dates when you are unavailable so admin can find covers.
          </p>
        </div>
      </div>

      <LeaveRequestClient coachId={user.id} initialLeaves={leaves || []} />
    </div>
  );
}
