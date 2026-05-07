import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { listAttendanceForAssignment, markAttendance } from "@/lib/db/attendance";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get("assignmentId");

  if (!assignmentId) {
    return NextResponse.json({ error: "Missing assignmentId" }, { status: 400 });
  }

  try {
    const attendance = await listAttendanceForAssignment(supabase, assignmentId);
    return NextResponse.json(attendance);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { assignmentId, memberId, status, markedBy } = body;

  try {
    const record = await markAttendance(supabase, {
      rosterAssignmentId: assignmentId,
      memberId,
      status,
      markedBy,
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
