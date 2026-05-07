import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import OfferingsClient from "@/app/(app)/franchisee-admin/locations/[id]/offerings/OfferingsClient";

export default async function AdminLocationOfferingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch location details
  const { data: location } = await supabase
    .from("locations")
    .select("name, id")
    .eq("id", id)
    .single();

  if (!location) notFound();

  // 2. Fetch full catalog with variants
  const { data: planets } = await supabase
    .from("planets")
    .select(`
      id,
      name,
      products (
        id,
        planet_id,
        name,
        product_variants (
          id,
          product_id,
          frequency_per_week,
          price,
          setup_fee
        )
      )
    `)
    .order("name");

  // 3. Fetch current location overrides
  const { data: offerings } = await supabase
    .from("location_course_offerings")
    .select("*")
    .eq("location_id", id);

  // 4. Map everything together
  const catalogWithOfferings = (planets || []).map((p: any) => ({
    ...p,
    products: (p.products || []).map((prod: any) => ({
      ...prod,
      product_variants: (prod.product_variants || []).map((v: any) => ({
        id: v.id,
        levelId: v.product_id,
        frequencyPerWeek: v.frequency_per_week,
        price: Number(v.price),
        setupFee: Number(v.setup_fee),
        offering: (offerings || []).find((o: any) => o.product_variant_id === v.id)
      }))
    }))
  }));

  return (
    <OfferingsClient 
      locationName={location.name} 
      locationId={location.id}
      catalog={catalogWithOfferings as any}
      backHref="/admin/locations"
    />
  );
}
