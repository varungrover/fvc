import { createClient } from "@/lib/supabase/server";
import type { Batch } from "@/lib/types";

/**
 * Lists batches for a specific location and/or level.
 * FA/FM see all; XA see only their ownership's batches (enforced by RLS).
 */
export async function listBatches(locationId?: string, levelId?: string) {
  const supabase = await createClient();
  let query = supabase.from('batches').select('*');
  
  if (locationId) query = query.eq('location_id', locationId);
  if (levelId) query = query.eq('product_id', levelId);
  
  const { data, error } = await query
    .order('day_of_week')
    .order('start_time');

  if (error) {
    console.error('Error listing batches:', error);
    throw new Error('Failed to fetch batches');
  }
  
  return (data || []).map(b => ({
    id: b.id,
    locationId: b.location_id,
    levelId: b.product_id,
    dayOfWeek: b.day_of_week,
    startTime: b.start_time,
    endTime: b.end_time,
    maxCapacity: b.max_capacity,
    isActive: b.is_active,
    createdAt: b.created_at
  })) as Batch[];
}

/**
 * Creates a new recurring batch slot.
 */
export async function createBatch(batch: Omit<Batch, 'id' | 'createdAt'>) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('batches').insert({
    location_id: batch.locationId,
    product_id: batch.levelId,
    day_of_week: batch.dayOfWeek,
    start_time: batch.startTime,
    end_time: batch.endTime,
    max_capacity: batch.maxCapacity,
    is_active: true
  }).select().single();
  
  if (error) {
    console.error('Error creating batch:', error);
    throw new Error(error.message || 'Failed to create batch');
  }

  return {
    id: data.id,
    locationId: data.location_id,
    levelId: data.product_id,
    dayOfWeek: data.day_of_week,
    startTime: data.start_time,
    endTime: data.end_time,
    maxCapacity: data.max_capacity,
    isActive: data.is_active,
    createdAt: data.created_at
  } as Batch;
}

/**
 * Deactivates or deletes a batch.
 */
export async function deleteBatch(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('batches').delete().eq('id', id);
  if (error) throw error;
}
