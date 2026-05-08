import { createClient } from "@/lib/supabase/server";
import PlanetsClient from "./PlanetsClient";

export const metadata = {
  title: "Planets | Mentora Admin",
};

export default async function PlanetsPage() {
  const supabase = await createClient();

  const { data: planets, error } = await supabase
    .from("planets")
    .select("id, name, description, is_active")
    .order("name");

  if (error) {
    console.error("Error fetching planets:", error);
    return <div>Error loading planets. Please try again.</div>;
  }

  const mappedPlanets = (planets || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    isActive: p.is_active,
  }));

  return <PlanetsClient initialPlanets={mappedPlanets as any} />;
}
