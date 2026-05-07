import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { listDiscountTiers, upsertDiscountTier } from "@/lib/db/discounts";

export async function GET(request: Request) {
  const supabase = await createClient();
  try {
    const tiers = await listDiscountTiers(supabase);
    return NextResponse.json(tiers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  
  try {
    const tier = await upsertDiscountTier(supabase, body);
    return NextResponse.json(tier, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
