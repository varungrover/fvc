import { SupabaseClient } from '@supabase/supabase-js';
import type { Holiday } from '@/lib/types';

/**
 * HOLIDAYS DATA-ACCESS LAYER
 */

export async function listHolidays(supabase: SupabaseClient, ownershipId?: string, locationId?: string): Promise<Holiday[]> {
  let query = supabase.from('holidays').select('*');

  // Fetch global holidays
  query = query.or(`ownership_id.is.null,and(ownership_id.eq.${ownershipId}),and(location_id.eq.${locationId})`);

  const { data, error } = await query.order('holiday_date');

  if (error) throw error;
  return data.map(h => ({
    id: h.id,
    ownershipId: h.ownership_id,
    locationId: h.location_id,
    holidayDate: h.holiday_date,
    description: h.description
  }));
}

export async function createHoliday(supabase: SupabaseClient, holiday: Omit<Holiday, 'id'>): Promise<Holiday> {
  const { data, error } = await supabase
    .from('holidays')
    .insert({
      holiday_date: holiday.holidayDate,
      description: holiday.description,
      ownership_id: holiday.ownershipId,
      location_id: holiday.locationId
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    ownershipId: data.ownership_id,
    locationId: data.location_id,
    holidayDate: data.holiday_date,
    description: data.description
  };
}
