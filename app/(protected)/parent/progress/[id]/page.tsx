import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProgressClient from "./ProgressClient";

export default async function StudentProgressPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify the student belongs to the parent (or role is admin)
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  
  const { data: student } = await supabase
    .from("students")
    .select("*, locations(name)")
    .eq("id", params.id)
    .single();

  if (!student) redirect("/dashboard");

  // If parent, check ownership
  if (profile?.role === "parent" && student.parent_id !== user.id) {
    redirect("/dashboard");
  }

  // Get active enrollments
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("id, status, courses(title, type, level)")
    .eq("student_id", student.id)
    .in("status", ["active", "trial"]);

  // Get recent attendance
  const { data: attendance } = await supabase
    .from("attendance")
    .select("status, is_late, checked_in_at, notes, sessions(start_at, courses(title))")
    .eq("student_id", student.id)
    .order("checked_in_at", { ascending: false })
    .limit(10);

  return (
    <div className="p-8">
      <div className="mb-6 flex space-x-2 text-sm text-slate-500">
        <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="text-slate-300">Progress Report</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{student.full_name}'s Progress</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review attendance, current courses, and recent feedback.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Student Details & Enrollments */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card-dark border border-border-dark rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Student Profile</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Location</p>
                <p className="text-sm text-slate-300">{student.locations?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Grade</p>
                <p className="text-sm text-slate-300">{student.grade || "N/A"}</p>
              </div>
              {student.medical_notes && (
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Medical Notes</p>
                  <p className="text-sm text-slate-300">{student.medical_notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card-dark border border-border-dark rounded-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Current Enrollments</h2>
            {!enrollments || enrollments.length === 0 ? (
              <p className="text-sm text-slate-500">No active enrollments.</p>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enr: any) => (
                  <div key={enr.id} className="pb-4 border-b border-border-dark last:border-0 last:pb-0">
                    <p className="text-sm font-semibold text-white">{enr.courses?.title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${enr.status === 'active' ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'}`}>
                        {enr.status}
                      </span>
                      {enr.courses?.level && (
                        <span className="text-[10px] bg-surface-dark text-slate-400 border border-border-dark px-2 py-0.5 rounded-full">
                          {enr.courses.level}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attendance & Stats */}
        <div className="md:col-span-2 space-y-6">
          <ProgressClient attendance={attendance || []} />
        </div>
      </div>
    </div>
  );
}
