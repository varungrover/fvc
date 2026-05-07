import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { listEnrollmentBatches } from "@/lib/db/enrollments";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  try {
    const batches = await listEnrollmentBatches(supabase, id);
    return NextResponse.json(batches);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
