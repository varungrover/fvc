import { SupabaseClient } from '@supabase/supabase-js';
import type { Planet, Level, CourseVariant } from '@/lib/types';

/**
 * CATALOG DATA-ACCESS LAYER
 * 
 * Maps public.planets, public.products, and public.product_variants
 * to TypeScript domain types.
 */

// --- Planets ---

export async function listPlanets(supabase: SupabaseClient): Promise<Planet[]> {
  const { data, error } = await supabase
    .from('planets')
    .select('*')
    .order('name');

  if (error) throw error;
  return data.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    isActive: p.is_active
  }));
}

export async function createPlanet(supabase: SupabaseClient, planet: Omit<Planet, 'id' | 'isActive'>): Promise<Planet> {
  const { data, error } = await supabase
    .from('planets')
    .insert({
      name: planet.name,
      description: planet.description,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    isActive: data.is_active
  };
}

// --- Levels (Products) ---

export async function listLevels(supabase: SupabaseClient, planetId: string): Promise<Level[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('planet_id', planetId)
    .order('sort_order');

  if (error) throw error;
  return data.map(p => ({
    id: p.id,
    planetId: p.planet_id,
    productClassId: p.product_class_id,
    name: p.name,
    sortOrder: p.sort_order,
    isActive: p.is_active
  }));
}

// --- Variants ---

export async function listVariants(supabase: SupabaseClient, productId: string): Promise<CourseVariant[]> {
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .order('frequency_per_week');

  if (error) throw error;
  return data.map(v => ({
    id: v.id,
    levelId: v.product_id,
    frequencyPerWeek: v.frequency_per_week,
    price: Number(v.price),
    setupFee: Number(v.setup_fee),
    imageUrl: v.image_url,
    isActive: v.is_active
  }));
}
