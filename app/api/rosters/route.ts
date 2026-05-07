import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { listRosters, createRoster } from "@/lib/db/rosters";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const locationId = searchParams.get("locationId");
  const status = searchParams.get("status") as any;

  try {
    const rosters = await listRosters(supabase, {
      locationId: locationId || undefined,
      status,
    });
    return NextResponse.json(rosters);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { locationId, ownershipId, weekStarting } = body;

  try {
    const roster = await createRoster(supabase, {
      locationId,
      ownershipId,
      weekStarting,
    });
    return NextResponse.json(roster, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
