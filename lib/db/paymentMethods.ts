import { SupabaseClient } from "@supabase/supabase-js";
import { PaymentMethod } from "../types";

export async function listPaymentMethods(supabase: SupabaseClient, customerId: string) {
  const { data, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function addPaymentMethod(
  supabase: SupabaseClient,
  input: Omit<PaymentMethod, "id" | "isDefault"> & { isDefault?: boolean }
) {
  // If this is the first PM, make it default
  const { count } = await supabase
    .from("payment_methods")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", input.customerId);

  const isDefault = (count === 0) || input.isDefault;

  if (isDefault) {
    await supabase
      .from("payment_methods")
      .update({ is_default: false })
      .eq("customer_id", input.customerId);
  }

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({
      customer_id: input.customerId,
      stripe_pm_id: input.stripePmId,
      last4: input.last4,
      card_brand: input.cardBrand,
      exp_month: input.expMonth,
      exp_year: input.expYear,
      is_default: !!isDefault,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setDefaultPaymentMethod(supabase: SupabaseClient, id: string, customerId: string) {
  // 1. Unset all defaults for this customer
  const { error: unsetError } = await supabase
    .from("payment_methods")
    .update({ is_default: false })
    .eq("customer_id", customerId);

  if (unsetError) throw unsetError;

  // 2. Set new default
  const { data, error: setError } = await supabase
    .from("payment_methods")
    .update({ is_default: true })
    .eq("id", id)
    .select()
    .single();

  if (setError) throw setError;
  return data;
}

export async function removePaymentMethod(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from("payment_methods")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
