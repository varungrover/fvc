import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SessionSchedulerClient from "./SessionSchedulerClient";

export default async function AdminSessionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: sessions }, { data: courses }, { data: coaches }] = await Promise.all([
    supabase
      .from("sessions")
      .select("*, courses(title, type), profiles!sessions_coach_id_fkey(full_name)")
      .order("start_at", { ascending: true }),
    supabase
      .from("courses")
      .select("id, title, type")
      .eq("status", "active")
      .order("title"),
    supabase
      .from("profiles")
      .select("id, full_name")
      .eq("role", "coach")
      .order("full_name"),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Session Scheduler</h1>
        <p className="text-slate-500 text-sm mt-1">
          Schedule and manage individual class sessions.
        </p>
      </div>

      <SessionSchedulerClient
        initialSessions={sessions ?? []}
        courses={courses ?? []}
        coaches={coaches ?? []}
      />
    </div>
  );
}
