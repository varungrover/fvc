import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getRoster, updateRosterStatus } from "@/lib/db/rosters";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  try {
    const roster = await getRoster(supabase, id);
    if (!roster) {
      return NextResponse.json({ error: "Roster not found" }, { status: 404 });
    }
    return NextResponse.json(roster);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;
  const body = await request.json();
  const { status } = body;

  try {
    const roster = await updateRosterStatus(supabase, id, status);
    return NextResponse.json(roster);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
