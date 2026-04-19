import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoyaltyClient from "./LoyaltyClient";

export default async function LoyaltyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: rules } = await supabase
    .from("loyalty_rules")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Loyalty Program</h1>
        <p className="text-slate-500 text-sm mt-1">
          Define rules that automatically reward students for attendance, referrals, and achievements.
        </p>
      </div>
      <LoyaltyClient initialRules={rules ?? []} />
    </div>
  );
}
