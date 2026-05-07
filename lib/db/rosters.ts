import { SupabaseClient } from "@supabase/supabase-js";
import { Roster, RosterStatus, RosterAssignment } from "../types";

export async function listRosters(
  supabase: SupabaseClient,
  filters: { locationId?: string; status?: RosterStatus }
) {
  let query = supabase.from("rosters").select("*, locations(name)");

  if (filters.locationId) query = query.eq("location_id", filters.locationId);
  if (filters.status) query = query.eq("status", filters.status);

  const { data, error } = await query.order("week_starting", { ascending: false });
  if (error) throw error;
  return data;
}

export async function getRoster(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from("rosters")
    .select("*, roster_assignments(*, batches(*), profiles!coach_id(full_name))")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createRoster(
  supabase: SupabaseClient,
  input: {
    locationId: string;
    ownershipId: string;
    weekStarting: string;
  }
) {
  const { data, error } = await supabase
    .from("rosters")
    .insert({
      location_id: input.locationId,
      ownership_id: input.ownershipId,
      week_starting: input.weekStarting,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateRosterStatus(
  supabase: SupabaseClient,
  id: string,
  status: RosterStatus
) {
  const { data, error } = await supabase
    .from("rosters")
    .update({
      status,
      published_at: status === "published" ? new Date().toISOString() : undefined,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function upsertRosterAssignment(
  supabase: SupabaseClient,
  input: Omit<RosterAssignment, "id"> & { id?: string }
) {
  const { data, error } = await supabase
    .from("roster_assignments")
    .upsert({
      id: input.id,
      roster_id: input.rosterId,
      batch_id: input.batchId,
      coach_id: input.coachId,
      room_id: input.roomId,
      notes: input.notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteRosterAssignment(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from("roster_assignments")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
