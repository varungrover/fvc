import { createClient } from "@/lib/supabase/server";
import EnrollClient from "./EnrollClient";
import { listDiscountTiers } from "@/lib/db/discounts";

export default async function EnrollPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Parallel fetch for speed
  const [
    { data: levels },
    { data: members },
    { data: batches },
    discountTiers
  ] = await Promise.all([
    supabase.from("product_variants").select("*"),
    supabase.from("members").select("*").eq("customer_id", user?.id),
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
        customerId: user?.id 
      }} 
    />
  );
}
