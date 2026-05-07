import { SupabaseClient } from "@supabase/supabase-js";
import { Attendance, AttendanceStatus, SessionNote } from "../types";

export async function listAttendanceForAssignment(supabase: SupabaseClient, assignmentId: string) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*, profiles!marked_by(full_name), members(full_name)")
    .eq("roster_assignment_id", assignmentId);

  if (error) throw error;
  return data;
}

export async function markAttendance(
  supabase: SupabaseClient,
  input: {
    rosterAssignmentId: string;
    memberId: string;
    status: AttendanceStatus;
    markedBy: string;
  }
) {
  const { data, error } = await supabase
    .from("attendance")
    .upsert({
      roster_assignment_id: input.rosterAssignmentId,
      member_id: input.memberId,
      status: input.status,
      marked_by: input.markedBy,
      marked_at: new Date().toISOString(),
    }, { onConflict: "roster_assignment_id, member_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function listSessionNotes(supabase: SupabaseClient, assignmentId: string) {
  const { data, error } = await supabase
    .from("session_notes")
    .select("*, profiles!author_id(full_name)")
    .eq("roster_assignment_id", assignmentId);

  if (error) throw error;
  return data;
}

export async function createSessionNote(
  supabase: SupabaseClient,
  input: {
    rosterAssignmentId: string;
    authorId: string;
    content: string;
    isPrivate: boolean;
  }
) {
  const { data, error } = await supabase
    .from("session_notes")
    .insert({
      roster_assignment_id: input.rosterAssignmentId,
      author_id: input.authorId,
      content: input.content,
      is_private: input.isPrivate,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
