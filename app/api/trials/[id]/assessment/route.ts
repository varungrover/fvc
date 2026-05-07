import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createTrialAssessment, updateTrialStatus } from "@/lib/db/trials";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { id: trialId } = params;
  const body = await request.json();
  const { assessedBy, recommendedLevelId, performanceNotes, isEnrollmentRecommended } = body;

  try {
    // 1. Create Assessment
    const assessment = await createTrialAssessment(supabase, {
      trialId,
      assessedBy,
      recommendedLevelId,
      performanceNotes,
      isEnrollmentRecommended,
    });

    // 2. Update Trial Status
    await updateTrialStatus(supabase, trialId, "attended");

    return NextResponse.json(assessment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
