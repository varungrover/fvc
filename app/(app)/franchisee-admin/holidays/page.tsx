import { createClient } from "@/lib/supabase/server";
import HolidaysClient from "../../admin/holidays/HolidaysClient";

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

  // 2. Fetch own ownership + corporate ownership (so we can show TLP names)
  const { data: ownerships } = await supabase
    .from("ownerships")
    .select("id, full_name")
    .or(`id.eq.${ownershipId},ownership_type.eq.corporate`);

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

  const mappedOwnerships = (ownerships || []).map((o: any) => ({
    id: o.id,
    fullName: o.full_name
  }));

  const mappedLocations = (locations || []).map((l: any) => ({
    id: l.id,
    name: l.name
  }));

  return (
    <HolidaysClient 
      initialHolidays={mappedHolidays as any} 
      ownerships={mappedOwnerships as any} 
      locations={mappedLocations as any}
    />
  );
}
