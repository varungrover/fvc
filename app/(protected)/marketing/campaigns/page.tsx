import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CampaignClient from "./CampaignClient";

export default async function MarketingCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ list?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { list } = await searchParams;

  const [{ data: campaigns }, { data: locations }] = await Promise.all([
    supabase
      .from("email_campaigns")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("locations").select("id, name").order("name"),
  ]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
        <p className="text-slate-400 text-sm mt-1">
          Create and send targeted campaigns to your marketing lists.
        </p>
      </div>
      <CampaignClient
        initialCampaigns={campaigns ?? []}
        locations={locations ?? []}
        defaultList={list}
      />
    </div>
  );
}
