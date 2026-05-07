import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { listSessionNotes, createSessionNote } from "@/lib/db/attendance";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id: assignmentId } = params;

  try {
    const notes = await listSessionNotes(supabase, assignmentId);
    return NextResponse.json(notes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id: assignmentId } = params;
  const body = await request.json();
  const { authorId, content, isPrivate } = body;

  try {
    const note = await createSessionNote(supabase, {
      rosterAssignmentId: assignmentId,
      authorId,
      content,
      isPrivate,
    });
    return NextResponse.json(note, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
