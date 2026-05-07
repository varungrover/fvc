import { SupabaseClient } from "@supabase/supabase-js";
import { DiscountTier } from "../types";

export async function listDiscountTiers(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("discount_tiers")
    .select("*")
    .order("planets_count", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getDiscountTierForCount(supabase: SupabaseClient, count: number) {
  const { data, error } = await supabase
    .from("discount_tiers")
    .select("*")
    .eq("planets_count", count)
    .eq("is_active", true)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertDiscountTier(
  supabase: SupabaseClient,
  input: Omit<DiscountTier, "id"> & { id?: string }
) {
  const { data, error } = await supabase
    .from("discount_tiers")
    .upsert({
      id: input.id,
      planets_count: input.planetsCount,
      discount_pct: input.discountPct,
      is_active: input.isActive,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
