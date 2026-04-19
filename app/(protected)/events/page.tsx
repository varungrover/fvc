import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EventListClient from "./EventListClient";

export default async function EventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Get active events
  const { data: events } = await supabase
    .from("events")
    .select("*, locations(name)")
    .gte("event_date", new Date().toISOString().split("T")[0])
    .order("event_date", { ascending: true });

  // Get user's children if parent
  let children: any[] = [];
  let userRegistrations: any[] = [];
  if (profile?.role === "parent") {
    const { data: c } = await supabase.from("students").select("id, full_name").eq("parent_id", user.id);
    children = c || [];

    const { data: r } = await supabase
      .from("event_registrations")
      .select("event_id, student_id, status")
      .eq("parent_id", user.id);
    userRegistrations = r || [];
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Events & Workshops</h1>
        <p className="text-slate-500 text-sm mt-1">
          Register for upcoming tournaments, camps, and workshops.
        </p>
      </div>

      <EventListClient 
        events={events || []}
        userRole={profile?.role || "parent"}
        userId={user.id}
        childrenList={children}
        initialRegistrations={userRegistrations}
      />
    </div>
  );
}
