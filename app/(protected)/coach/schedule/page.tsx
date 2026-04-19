import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CoachScheduleClient from "./CoachScheduleClient";

export default async function CoachSchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get sessions assigned to this coach
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, course_id, coach_id, start_at, end_at, status, notes, courses(title, type, locations(name))")
    .eq("coach_id", user.id)
    .order("start_at", { ascending: true });

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">
            View your upcoming classes and lessons.
          </p>
        </div>
      </div>
      <CoachScheduleClient sessions={sessions || []} />
    </div>
  );
}
