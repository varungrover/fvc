import { NextResponse } from "next/server";
import { listBatches, createBatch } from "@/lib/db/batches";
import { getSession } from "@/lib/auth/session";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const locationId = searchParams.get("locationId");
  const levelId = searchParams.get("levelId");
  
  try {
    const batches = await listBatches(locationId || undefined, levelId || undefined);
    return NextResponse.json(batches);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  
  // Only Franchisor Admin and Franchisee Admin can create batches
  if (!session || !['franchisor_admin', 'franchisee_admin'].includes(session.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.locationId || !body.levelId || !body.dayOfWeek || !body.startTime || !body.endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newBatch = await createBatch(body);
    return NextResponse.json(newBatch, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
