import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/home/LandingPage";

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch Tenant (The Learning Planet)
  const { data: tenant } = await supabase
    .from("ownerships")
    .select("*")
    .eq("slug", "learning-planet")
    .single();

  if (!tenant) return <div>Tenant not found</div>;

  // 2. Fetch Locations
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("is_active", true);

  // 3. Fetch Planets
  const { data: planets } = await supabase
    .from("planets")
    .select("*")
    .eq("is_active", true);

  // 4. Fetch Products (these are the Levels in our UI)
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  // 5. Fetch Course Variants (Pricing)
  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("is_active", true);

  // 6. Fetch Location Offerings
  const { data: offerings } = await supabase
    .from("location_course_offerings")
    .select("*")
    .eq("is_active", true);

  return (
    <LandingPage 
      initialTenant={tenant}
      initialLocations={locations || []}
      initialPlanets={planets || []}
      initialLevels={products || []}
      initialVariants={variants || []}
      initialOfferings={offerings || []}
    />
  );
}
