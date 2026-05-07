import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { upsertRosterAssignment } from "@/lib/db/rosters";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: rosterId } = await params;
  const body = await request.json();
  const { batchId, coachId, roomId, notes, id } = body;

  try {
    const assignment = await upsertRosterAssignment(supabase, {
      id,
      rosterId,
      batchId,
      coachId,
      roomId,
      notes,
    });
    return NextResponse.json(assignment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
