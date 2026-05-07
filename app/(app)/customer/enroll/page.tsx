import { createClient } from "@/lib/supabase/server";
import EnrollClient from "./EnrollClient";

export default async function EnrollPage() {
  const supabase = await createClient();
  
  // Fetch levels, members, etc.
  const { data: levels } = await supabase.from("product_variants").select("*");
  const { data: members } = await supabase.from("members").select("*");

  return (
    <EnrollClient 
      initialData={{ levels, members }} 
    />
  );
}
