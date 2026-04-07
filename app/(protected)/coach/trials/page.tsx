import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function CoachTrialsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get courses taught by this coach
  const { data: courses } = await supabase
    .from("sessions")
    .select("course_id")
    .eq("coach_id", user.id);
  const courseIds = [...new Set((courses || []).map((c: any) => c.course_id))];

  // Get trial enrollments for these courses
  let trials: any[] = [];
  if (courseIds.length > 0) {
    const { data } = await supabase
      .from("enrollments")
      .select("id, status, created_at, students(full_name, grade, parent_id), courses(title)")
      .in("course_id", courseIds)
      .eq("status", "trial")
      .order("created_at", { ascending: false });
    trials = data || [];
  }

  // Get parent details for the trials
  const parentIds = [...new Set(trials.map((t: any) => t.students?.parent_id).filter(Boolean))];
  let parents = [];
  if (parentIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .in("id", parentIds);
    parents = data || [];
  }

  const trialsWithParents = trials.map(t => ({
    ...t,
    parent: parents.find((p: any) => p.id === t.students?.parent_id)
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Trial Management</h1>
        <p className="text-slate-400 text-sm mt-1">
          Review active trial students in your courses and follow up with parents.
        </p>
      </div>

      {trialsWithParents.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl p-8 text-center text-slate-400">
          No active trial students in your courses.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trialsWithParents.map((t) => (
            <div key={t.id} className="bg-card-dark border border-border-dark rounded-xl p-5 relative">
              <span className="absolute top-4 right-4 bg-warning/10 text-warning px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border border-warning/20">
                ACTIVE TRIAL
              </span>
              
              <h3 className="text-lg font-bold text-white mb-0.5">{t.students?.full_name}</h3>
              <p className="text-sm font-medium text-slate-300">{t.courses?.title}</p>
              {t.students?.grade && <p className="text-xs text-slate-500 mt-1">Grade {t.students.grade}</p>}

              <div className="mt-4 pt-4 border-t border-border-dark space-y-2">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Parent Contact</p>
                {t.parent ? (
                  <>
                    <p className="text-sm text-slate-200 font-medium">{t.parent.full_name}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5"><span className="material-icons-round text-sm">email</span> {t.parent.email}</p>
                    {t.parent.phone && (
                      <p className="text-xs text-slate-400 flex items-center gap-1.5"><span className="material-icons-round text-sm">phone</span> {t.parent.phone}</p>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-slate-500 italic">No parent info</p>
                )}
              </div>

              <div className="mt-5 flex gap-2">
                {t.parent?.email && (
                  <a href={`mailto:${t.parent.email}`} className="flex-1 bg-surface-dark hover:bg-surface-hover border border-border-dark text-white text-xs font-medium py-2 rounded-lg transition-colors flex justify-center items-center gap-1.5">
                    <span className="material-icons-round text-[14px]">mail</span>
                    Email
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
