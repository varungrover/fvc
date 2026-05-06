import { SupabaseClient } from '@supabase/supabase-js';
import type { LocationCourseOffering } from '@/lib/types';

/**
 * OFFERINGS DATA-ACCESS LAYER
 * 
 * Maps public.location_course_offerings to TypeScript domain types.
 */

export async function listOfferings(supabase: SupabaseClient, locationId: string): Promise<LocationCourseOffering[]> {
  const { data, error } = await supabase
    .from('location_course_offerings')
    .select('*')
    .eq('location_id', locationId);

  if (error) throw error;
  return data.map(o => ({
    id: o.id,
    locationId: o.location_id,
    productVariantId: o.product_variant_id,
    price: Number(o.price),
    setupFee: Number(o.setup_fee),
    isActive: o.is_active
  }));
}

export async function upsertOffering(
  supabase: SupabaseClient, 
  offering: Omit<LocationCourseOffering, 'id'>
): Promise<LocationCourseOffering> {
  const { data, error } = await supabase
    .from('location_course_offerings')
    .upsert({
      location_id: offering.locationId,
      product_variant_id: offering.productVariantId,
      price: offering.price,
      setup_fee: offering.setupFee,
      is_active: offering.isActive
    }, {
      onConflict: 'location_id, product_variant_id'
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    locationId: data.location_id,
    productVariantId: data.product_variant_id,
    price: Number(data.price),
    setupFee: Number(data.setup_fee),
    isActive: data.is_active
  };
}
