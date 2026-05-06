import { createClient } from "@/lib/supabase/server";
import HolidaysClient from "./HolidaysClient";

export default async function AdminHolidaysPage() {
  const supabase = await createClient();

  // 1. Fetch holidays
  const { data: holidays } = await supabase
    .from("holidays")
    .select("*")
    .order("holiday_date");

  // 2. Fetch ownerships for scope selector
  const { data: ownerships } = await supabase
    .from("ownerships")
    .select("id, full_name")
    .order("full_name");

  // 3. Fetch locations for scope selector
  const { data: locations } = await supabase
    .from("locations")
    .select("id, name")
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
