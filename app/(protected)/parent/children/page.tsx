import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ChildrenPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Children</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your children&apos;s profiles</p>
        </div>
        <Link
          href="/parent/children/add"
          className="flex items-center gap-2 bg-primary hover:bg-purple-600 text-white font-medium py-2.5 px-4 rounded-lg shadow-[0_0_10px_rgba(168,85,247,0.2)] transition-all duration-200 text-sm"
        >
          <span className="material-icons-round text-[18px]">add</span>
          Add Child
        </Link>
      </div>

      {!students || students.length === 0 ? (
        <div className="bg-card-dark border border-border-dark rounded-xl p-10 text-center max-w-md">
          <span className="material-icons-round text-4xl text-slate-600 mb-3 block">family_restroom</span>
          <p className="text-slate-300 font-medium">No children added yet</p>
          <p className="text-slate-500 text-sm mt-1 mb-5">Add a child profile to get started with enrollments.</p>
          <Link
            href="/parent/children/add"
            className="inline-flex items-center gap-2 bg-primary hover:bg-purple-600 text-white font-medium py-2.5 px-5 rounded-lg transition-all duration-200 text-sm"
          >
            <span className="material-icons-round text-[18px]">add</span>
            Add your first child
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {students.map((student) => {
            const age = student.date_of_birth
              ? Math.floor((Date.now() - new Date(student.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
              : null;
            const initials = student.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

            return (
              <div key={student.id} className="bg-card-dark border border-border-dark rounded-xl p-5 hover:border-primary/40 transition-all duration-200 group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/30 to-indigo/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{initials}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{student.full_name}</p>
                    <p className="text-slate-500 text-xs">
                      {age ? `${age} years old` : "Age not set"}{student.grade ? ` · Grade ${student.grade}` : ""}
                    </p>
                  </div>
                </div>
                {student.cfc_id && (
                  <p className="text-xs text-slate-500 mb-4">CFC ID: <span className="text-slate-300">{student.cfc_id}</span></p>
                )}
                <Link
                  href={`/parent/children/${student.id}`}
                  className="flex items-center gap-1.5 text-sm text-primary hover:text-purple-300 font-medium transition-colors"
                >
                  <span className="material-icons-round text-[16px]">edit</span>
                  Edit profile
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
