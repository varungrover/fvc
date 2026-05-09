import { createClient } from "@/lib/supabase/server";
import CoursesPage from "@/components/courses/CoursesPage";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ locationSlug: string }>;
  searchParams: Promise<{ planet?: string; q?: string }>;
}

export default async function LocationCoursesPage({ params, searchParams }: Props) {
  const { locationSlug } = await params;
  const { planet: planetId, q } = await searchParams;
  const supabase = await createClient();

  // Fetch location by slug
  const { data: location } = await supabase
    .from("locations")
    .select("*")
    .eq("slug", locationSlug)
    .eq("is_active", true)
    .single();

  if (!location) notFound();

  // Fetch tenant
  const { data: tenant } = await supabase
    .from("ownerships")
    .select("*")
    .eq("id", location.ownership_id)
    .single();

  if (!tenant) notFound();

  // Fetch all planets
  const { data: planets } = await supabase
    .from("planets")
    .select("*")
    .eq("is_active", true)
    .order("name");

  // Fetch all offerings for this location
  const { data: offerings } = await supabase
    .from("location_course_offerings")
    .select("*")
    .eq("location_id", location.id)
    .eq("is_active", true);

  // Fetch all products that have offerings at this location
  const offeredVariantIds = (offerings || []).map((o: any) => o.product_variant_id);

  const { data: variants } = await supabase
    .from("product_variants")
    .select("*")
    .in("id", offeredVariantIds.length > 0 ? offeredVariantIds : ["none"])
    .eq("is_active", true);

  const offeredProductIds = [...new Set((variants || []).map((v: any) => v.product_id))];

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", offeredProductIds.length > 0 ? offeredProductIds : ["none"])
    .eq("is_active", true)
    .order("sort_order");

  return (
    <CoursesPage
      location={location}
      tenant={tenant}
      planets={planets || []}
      products={products || []}
      variants={variants || []}
      offerings={offerings || []}
      initialPlanetId={planetId ?? null}
      initialSearch={q ?? ""}
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
    title: location ? `Courses at ${location.name} | Mentora` : "Courses",
    description: location
      ? `Browse all available programs and courses at our ${location.city} center.`
      : "",
  };
}
