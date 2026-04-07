import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EnrollForm from "./EnrollForm";

export default async function EnrollPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: course }, { data: students }] = await Promise.all([
    supabase
      .from("courses")
      .select("id, title, type, price_trial, price_monthly, locations(name)")
      .eq("id", id)
      .eq("status", "active")
      .single(),
    supabase
      .from("students")
      .select("id, full_name")
      .eq("parent_id", user.id)
      .order("full_name"),
  ]);

  if (!course) notFound();

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href={`/courses/${id}`} className="text-slate-400 hover:text-white transition-colors">
          <span className="material-icons-round text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Enroll in course</h1>
          <p className="text-slate-400 text-sm mt-0.5">{course.title}</p>
        </div>
      </div>

      <EnrollForm course={course as any} students={students ?? []} />
    </div>
  );
}
