import { createClient } from "@/lib/supabase/server";
import CoursesClient from "./CoursesClient";

export const metadata = {
  title: "Courses | Mentora Admin",
};

export default async function CoursesPage() {
  const supabase = await createClient();

  // Fetch Planets -> Products (Levels) -> Product Variants (Pricing)
  const { data: planets, error } = await supabase
    .from("planets")
    .select(`
      id,
      name,
      description,
      is_active,
      products (
        id,
        planet_id,
        product_class_id,
        name,
        sort_order,
        is_active,
        product_variants (
          id,
          product_id,
          name,
          frequency_per_week,
          price,
          setup_fee,
          is_active
        )
      )
    `)
    .order("name");

  if (error) {
    console.error("Error fetching courses catalog:", error);
    return <div>Error loading courses. Please try again.</div>;
  }

  const mappedPlanets = (planets || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    isActive: p.is_active,
    products: (p.products || []).map((prod: any) => ({
      id: prod.id,
      planetId: prod.planet_id,
      productClassId: prod.product_class_id,
      name: prod.name,
      sortOrder: prod.sort_order,
      isActive: prod.is_active,
      product_variants: (prod.product_variants || []).map((v: any) => ({
        id: v.id,
        levelId: v.product_id,
        name: v.name,
        frequencyPerWeek: v.frequency_per_week,
        price: Number(v.price),
        setupFee: Number(v.setup_fee),
        isActive: v.is_active,
      })),
    })),
  }));

  return <CoursesClient initialPlanets={mappedPlanets as any} />;
}
