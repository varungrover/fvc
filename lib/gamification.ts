import { createClient } from "./supabase/server";

export async function awardPoints(studentId: string, points: number, reason: string) {
  const supabase = await createClient();

  // 1. Insert transaction
  const { error: txError } = await supabase
    .from("point_transactions")
    .insert({ student_id: studentId, points, reason });
    
  if (txError) {
    console.error("Failed to insert point transaction:", txError);
    return false;
  }

  // 2. Fetch current points to update level
  const { data: student } = await supabase
    .from("students")
    .select("total_points")
    .eq("id", studentId)
    .single();

  if (!student) return false;

  const newTotal = (student.total_points || 0) + points;
  const newLevel = Math.floor(newTotal / 100) + 1;

  // 3. Update student record
  await supabase
    .from("students")
    .update({ total_points: newTotal, current_level: newLevel })
    .eq("id", studentId);

  // 4. Check for auto-awarded milestone badges
  // First get all auto-award badges they don't already have
  const { data: missingBadges } = await supabase
    .from("badges")
    .select("id, points_threshold")
    .not("points_threshold", "is", null)
    .lte("points_threshold", newTotal);

  if (missingBadges && missingBadges.length > 0) {
    // Check which ones they actually have
    const { data: existingUserBadges } = await supabase
      .from("student_badges")
      .select("badge_id")
      .eq("student_id", studentId);
      
    const existingIds = new Set(existingUserBadges?.map(b => b.badge_id) || []);
    
    const badgesToAward = missingBadges.filter(b => !existingIds.has(b.id));

    if (badgesToAward.length > 0) {
      // Award missing threshold badges
      const inserts = badgesToAward.map(b => ({
        student_id: studentId,
        badge_id: b.id
      }));
      await supabase.from("student_badges").insert(inserts);
    }
  }

  return true;
}
