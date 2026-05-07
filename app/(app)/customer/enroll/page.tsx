import { createClient } from "@/lib/supabase/server";
import EnrollClient from "./EnrollClient";
import { listDiscountTiers } from "@/lib/db/discounts";

export default async function EnrollPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Get the customer record for this user
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("profile_id", user?.id)
    .single();

  if (!customer) {
    return <div>Customer record not found. Please complete your profile.</div>;
  }

  // 2. Parallel fetch for speed using the correct customer.id
  const [
    { data: levels },
    { data: members },
    { data: batches },
    discountTiers
  ] = await Promise.all([
    supabase.from("product_variants").select("*"),
    supabase.from("members").select("*").eq("customer_id", customer.id),
    supabase.from("batches").select("*"),
    listDiscountTiers(supabase)
  ]);

  return (
    <EnrollClient 
      initialData={{ 
        levels: levels || [], 
        members: members || [], 
        batches: batches || [], 
        discountTiers,
        customerId: customer.id 
      }} 
    />
  );
}
