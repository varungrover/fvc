import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DNCClient from "./DNCClient";

export default async function DNCPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: entries } = await supabase
    .from("do_not_contact")
    .select("*")
    .order("added_at", { ascending: false });

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Do-Not-Contact List</h1>
        <p className="text-slate-500 text-sm mt-1">
          Email addresses excluded from all campaign sends.
        </p>
      </div>
      <DNCClient initialEntries={entries ?? []} />
    </div>
  );
}
