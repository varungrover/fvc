import { SupabaseClient } from "@supabase/supabase-js";
import { Trial, TrialStatus, TrialAssessment } from "../types";

export async function listTrials(supabase: SupabaseClient, filters: { status?: TrialStatus }) {
  let query = supabase.from("trials").select("*, members(full_name), roster_assignments(*, batches(*))");
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query.order("booked_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function bookTrial(
  supabase: SupabaseClient,
  input: {
    memberId: string;
    rosterAssignmentId: string;
  }
) {
  const { data, error } = await supabase
    .from("trials")
    .insert({
      member_id: input.memberId,
      roster_assignment_id: input.rosterAssignmentId,
      status: "booked",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTrialStatus(supabase: SupabaseClient, id: string, status: TrialStatus) {
  const { data, error } = await supabase
    .from("trials")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createTrialAssessment(
  supabase: SupabaseClient,
  input: {
    trialId: string;
    assessedBy: string;
    recommendedLevelId: string;
    performanceNotes: string;
    isEnrollmentRecommended: boolean;
  }
) {
  const { data, error } = await supabase
    .from("trial_assessments")
    .insert({
      trial_id: input.trialId,
      assessed_by: input.assessedBy,
      recommended_level_id: input.recommendedLevelId,
      performance_notes: input.performanceNotes,
      is_enrollment_recommended: input.isEnrollmentRecommended,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
