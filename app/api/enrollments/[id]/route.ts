import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getEnrollment, updateEnrollmentStatus } from "@/lib/db/enrollments";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id } = params;

  try {
    const enrollment = await getEnrollment(supabase, id);
    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }
    return NextResponse.json(enrollment);
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
  const { status, cancellationReason } = body;

  try {
    const enrollment = await updateEnrollmentStatus(supabase, id, {
      status,
      cancelledAt: status === "cancelled" ? new Date().toISOString() : undefined,
      cancellationReason,
    });
    return NextResponse.json(enrollment);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
