import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import EditChildForm from "./EditChildForm";

export default async function EditChildPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: student } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .eq("parent_id", user.id)
    .single();

  if (!student) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/parent/children" className="text-slate-400 hover:text-white transition-colors">
          <span className="material-icons-round text-[20px]">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Child Profile</h1>
          <p className="text-slate-400 text-sm mt-0.5">{student.full_name}</p>
        </div>
      </div>
      <EditChildForm student={student} />
    </div>
  );
}
