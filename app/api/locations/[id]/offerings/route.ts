import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listOfferings, upsertOffering } from '@/lib/db/offerings';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    const { id } = await params;
    const offerings = await listOfferings(supabase, id);
    return NextResponse.json(offerings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  if (session.role !== "franchisor_admin" && session.role !== "franchisee_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id: locationId } = await params;
    const body = await request.json();
    const { levelId, variantIds, enabled } = body;

    const supabase = await createClient();

    if (enabled) {
      // 1. Fetch variants to get their base prices
      const { data: variants, error: vError } = await supabase
        .from("product_variants")
        .select("id, base_price, setup_fee")
        .in("id", variantIds);

      if (vError) throw vError;

      // 2. Upsert offerings with base prices
      const { data: updated, error: uError } = await supabase
        .from("location_course_offerings")
        .upsert(
          variants.map(v => ({
            location_id: locationId,
            product_variant_id: v.id,
            price: v.base_price,
            setup_fee: v.setup_fee,
            is_active: true
          })),
          { onConflict: "location_id, product_variant_id" }
        )
        .select();

      if (uError) throw uError;
      return NextResponse.json(updated);
    } else {
      // 3. Delete offerings (or mark inactive)
      const { error: dError } = await supabase
        .from("location_course_offerings")
        .delete()
        .eq("location_id", locationId)
        .in("product_variant_id", variantIds);

      if (dError) throw dError;
      return NextResponse.json([]);
    }
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
