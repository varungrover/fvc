import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listMembers } from "@/lib/db/members";
import MembersClient from "./MembersClient";

export const metadata = {
  title: "My Members - LMS",
};

export default async function MembersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get the customer ID for the current user
  const { data: customerData } = await supabase
    .from("customers")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (!customerData) {
    // Should not happen for a valid customer due to triggers, but handle gracefully
    return <div style={{ padding: 24 }}>Customer profile not found. Please contact support.</div>;
  }

  const members = await listMembers(supabase, customerData.id, {
    id: user.id,
    email: user.email!,
    role: "customer" as const,
    ownershipId: null,
    fullName: "",
    mustChangePassword: false,
  });

  return (
    <MembersClient 
      initialMembers={members} 
      customerId={customerData.id} 
    />
  );
}
