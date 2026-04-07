import { createClient } from "@/lib/supabase/server";
import FeedbackBookingClient from "./FeedbackBookingClient";
import { redirect } from "next/navigation";

export default async function ParentFeedbackPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get parent's children
  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, locations(id, name)")
    .eq("parent_id", user.id);

  // Get past bookings
  const { data: bookings } = await supabase
    .from("feedback_bookings")
    .select("*, students(full_name), locations(name)")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Coach Feedback & Meeting</h1>
          <p className="text-slate-400 text-sm mt-1">
            Request a 1-on-1 meeting or written feedback for your child.
          </p>
        </div>
      </div>

      <FeedbackBookingClient
        parentId={user.id}
        students={students || []}
        initialBookings={bookings || []}
      />
    </div>
  );
}
