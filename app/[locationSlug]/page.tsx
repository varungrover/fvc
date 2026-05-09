import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/home/LandingPage";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ locationSlug: string }>;
}

export default async function LocationPage({ params }: Props) {
  const { locationSlug } = await params;
  const supabase = await createClient();

  // 1. Fetch this specific location by slug
  const { data: location } = await supabase
    .from("locations")
    .select("*")
    .eq("slug", locationSlug)
    .eq("is_active", true)
    .single();

  if (!location) notFound();

  // 2. Fetch Tenant
  const { data: tenant } = await supabase
    .from("ownerships")
    .select("*")
    .eq("id", location.ownership_id)
    .single();

  if (!tenant) notFound();

  // 3. Fetch all active locations (for the picker on the global page)
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("is_active", true);

  // 4. Fetch Planets
  const { data: planets } = await supabase
    .from("planets")
    .select("*")
    .eq("is_active", true);

  // 5. Fetch Products
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true);

  // 6. Fetch Variants
  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .eq("is_active", true);

  // 7. Fetch Offerings — only for THIS location
  const { data: offerings } = await supabase
    .from("location_course_offerings")
    .select("*")
    .eq("location_id", location.id)
    .eq("is_active", true);

  return (
    <LandingPage
      initialTenant={tenant}
      initialLocations={locations || []}
      initialPlanets={planets || []}
      initialLevels={products || []}
      initialVariants={variants || []}
      initialOfferings={offerings || []}
      forcedLocationId={location.id}
    />
  );
}



export async function generateMetadata({ params }: Props) {
  const { locationSlug } = await params;
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data: location } = await supabase
    .from("locations")
    .select("name, city")
    .eq("slug", locationSlug)
    .single();

  return {
    title: location ? `${location.name} Programs | Mentora` : "Location Not Found",
    description: location
      ? `Explore chess, math, science and more at our ${location.city} center.`
      : "",
  };
}
