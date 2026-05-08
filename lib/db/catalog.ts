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

export async function updatePlanet(supabase: SupabaseClient, id: string, patch: Partial<Planet>): Promise<Planet> {
  const { data, error } = await supabase
    .from('planets')
    .update({
      name: patch.name,
      description: patch.description,
      is_active: patch.isActive
    })
    .eq('id', id)
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

export async function createLevel(supabase: SupabaseClient, level: Omit<Level, 'id' | 'isActive'>): Promise<Level> {
  const { data, error } = await supabase
    .from('products')
    .insert({
      planet_id: level.planetId,
      product_class_id: level.productClassId,
      name: level.name,
      sort_order: level.sortOrder,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    planetId: data.planet_id,
    productClassId: data.product_class_id,
    name: data.name,
    sortOrder: data.sort_order,
    isActive: data.is_active
  };
}

export async function updateLevel(supabase: SupabaseClient, id: string, patch: Partial<Level>): Promise<Level> {
  const { data, error } = await supabase
    .from('products')
    .update({
      name: patch.name,
      sort_order: patch.sortOrder,
      is_active: patch.isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    planetId: data.planet_id,
    productClassId: data.product_class_id,
    name: data.name,
    sortOrder: data.sort_order,
    isActive: data.is_active
  };
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

export async function createVariant(supabase: SupabaseClient, variant: Omit<CourseVariant, 'id' | 'isActive'>): Promise<CourseVariant> {
  const { data, error } = await supabase
    .from('product_variants')
    .insert({
      product_id: variant.levelId,
      name: (variant as any).name || (variant.frequencyPerWeek ? variant.frequencyPerWeek + 'x per week' : 'Default Variant'),
      frequency_per_week: variant.frequencyPerWeek,
      price: variant.price,
      setup_fee: variant.setupFee ?? 0,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    levelId: data.product_id,
    frequencyPerWeek: data.frequency_per_week,
    price: Number(data.price),
    setupFee: Number(data.setup_fee),
    isActive: data.is_active
  };
}

export async function updateVariant(supabase: SupabaseClient, id: string, patch: Partial<CourseVariant>): Promise<CourseVariant> {
  const { data, error } = await supabase
    .from('product_variants')
    .update({
      frequency_per_week: patch.frequencyPerWeek,
      price: patch.price,
      setup_fee: patch.setupFee,
      is_active: patch.isActive,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    levelId: data.product_id,
    frequencyPerWeek: data.frequency_per_week,
    price: Number(data.price),
    setupFee: Number(data.setup_fee),
    isActive: data.is_active
  };
}
