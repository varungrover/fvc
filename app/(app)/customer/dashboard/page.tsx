import { createClient } from "@/lib/supabase/server";
import CustomerDashboardClient from "./CustomerDashboardClient";

export default async function CustomerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Get the customer record
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("profile_id", user?.id)
    .single();

  if (!customer) {
    return <div>Customer profile not found. Please contact support.</div>;
  }

  // 2. Fetch real members and enrollments
  const [
    { data: members },
    { data: enrollments },
    { data: invoices }
  ] = await Promise.all([
    supabase.from("members").select("*").eq("customer_id", customer.id),
    supabase.from("enrollments").select("*, product_variants(*), batches(*)").eq("customer_id", customer.id),
    supabase.from("invoices").select("*").eq("customer_id", customer.id).order("issued_at", { ascending: false })
  ]);

  return (
    <CustomerDashboardClient 
      customer={customer}
      members={members || []}
      enrollments={enrollments || []}
      invoices={invoices || []}
      userName={user?.user_metadata?.full_name || "Parent"}
    />
  );
}
