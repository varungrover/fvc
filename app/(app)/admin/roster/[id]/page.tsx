import { createClient } from "@/lib/supabase/server";
import RosterBuilder from "./RosterBuilder";
import { getRoster } from "@/lib/db/rosters";

export default async function RosterDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const roster = await getRoster(supabase, params.id);
  
  // Fetch coaches and batches for the builder
  const { data: coaches } = await supabase.from("profiles").select("*").eq("role", "coach");
  const { data: batches } = await supabase.from("batches").select("*").eq("location_id", roster.location_id);

  return (
    <RosterBuilder 
      roster={roster} 
      coaches={coaches || []} 
      batches={batches || []} 
    />
  );
}
