import { SupabaseClient } from "@supabase/supabase-js";
import { Enrollment, EnrollmentStatus, EnrollmentBatch } from "../types";

export async function listEnrollments(
  supabase: SupabaseClient,
  filters: { customerId?: string; memberId?: string; status?: EnrollmentStatus }
) {
  let query = supabase
    .from("enrollments")
    .select("*, members(full_name), product_variants(name), locations(name)");

  if (filters.customerId) query = query.eq("customer_id", filters.customerId);
  if (filters.memberId) query = query.eq("member_id", filters.memberId);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query.order("enrolled_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getEnrollment(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .select("*, members(*), enrollment_batches(batch_id, batches(*))")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createEnrollment(
  supabase: SupabaseClient,
  input: {
    memberId: string;
    customerId: string;
    productVariantId: string;
    locationId: string;
    ownershipId: string;
    offeringPrice: number;
    batchIds: string[];
  }
) {
  // 1. Create Enrollment
  const { data: enrollment, error: enrollError } = await supabase
    .from("enrollments")
    .insert({
      member_id: input.memberId,
      customer_id: input.customerId,
      product_variant_id: input.productVariantId,
      location_id: input.locationId,
      ownership_id: input.ownershipId,
      offering_price: input.offeringPrice,
    })
    .select()
    .single();

  if (enrollError) throw enrollError;

  // 2. Create Enrollment Batches
  const batchInserts = input.batchIds.map(batchId => ({
    enrollment_id: enrollment.id,
    batch_id: batchId
  }));

  const { error: batchError } = await supabase
    .from("enrollment_batches")
    .insert(batchInserts);

  if (batchError) throw batchError;

  return enrollment;
}

export async function updateEnrollmentStatus(
  supabase: SupabaseClient,
  id: string,
  patch: { status: EnrollmentStatus; cancelledAt?: string; cancellationReason?: string }
) {
  const { data, error } = await supabase
    .from("enrollments")
    .update({
      status: patch.status,
      cancelled_at: patch.cancelledAt,
      cancellation_reason: patch.cancellationReason,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listEnrollmentBatches(supabase: SupabaseClient, enrollmentId: string) {
  const { data, error } = await supabase
    .from("enrollment_batches")
    .select("*, batches(*)")
    .eq("enrollment_id", enrollmentId);

  if (error) throw error;
  return data;
}
