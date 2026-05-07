import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { listTrials, bookTrial } from "@/lib/db/trials";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as any;

  try {
    const trials = await listTrials(supabase, { status });
    return NextResponse.json(trials);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { memberId, rosterAssignmentId } = body;

  try {
    const trial = await bookTrial(supabase, { memberId, rosterAssignmentId });
    return NextResponse.json(trial, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
