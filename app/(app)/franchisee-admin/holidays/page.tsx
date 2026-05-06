import { createClient } from "@/lib/supabase/server";
import HolidaysClient from "../../../admin/holidays/HolidaysClient";

export default async function FranchiseeHolidaysPage() {
  const supabase = await createClient();
  
  // Get current user session to find ownershipId
  const { data: { session } } = await supabase.auth.getSession();
  const ownershipId = session?.user?.app_metadata?.ownership_id;

  // 1. Fetch holidays (API will handle RLS)
  const { data: holidays } = await supabase
    .from("holidays")
    .select("*")
    .order("holiday_date");

  // 2. Fetch own ownership only
  const { data: ownerships } = await supabase
    .from("ownerships")
    .select("id, full_name")
    .eq("id", ownershipId);

  // 3. Fetch own locations only
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
    .eq("ownership_id", ownershipId)
    .order("name");

  // Map to camelCase
  const mappedHolidays = (holidays || []).map((h: any) => ({
    id: h.id,
    holidayDate: h.holiday_date,
    description: h.description,
    ownershipId: h.ownership_id,
    locationId: h.location_id
  }));

  return (
    <HolidaysClient 
      initialHolidays={mappedHolidays as any} 
      ownerships={ownerships as any || []} 
      locations={locations as any || []}
    />
  );
}
