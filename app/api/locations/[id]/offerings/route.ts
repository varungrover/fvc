import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: locationId } = await params;
    const body = await request.json();
    const { variantIds, enabled } = body;

    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await createClient();

    if (enabled) {
      // 1. Fetch variants to get their prices
      const { data: variants, error: vError } = await supabase
        .from("product_variants")
        .select("id, price, setup_fee")
        .in("id", variantIds);

      if (vError) {
        return NextResponse.json({ error: `[V] ${vError.message}` }, { status: 500 });
      }

      // 2. Upsert offerings
      const { data: updated, error: uError } = await supabase
        .from("location_course_offerings")
        .upsert(
          variants.map(v => ({
            location_id: locationId,
            product_variant_id: v.id,
            price: v.price,
            setup_fee: v.setup_fee,
            is_active: true
          })),
          { onConflict: "location_id, product_variant_id" }
        )
        .select();

      if (uError) {
        return NextResponse.json({ error: `[U] ${uError.message}` }, { status: 500 });
      }
      return NextResponse.json(updated);
    } else {
      // 3. Delete offerings
      const { error: dError } = await supabase
        .from("location_course_offerings")
        .delete()
        .eq("location_id", locationId)
        .in("product_variant_id", variantIds);

      if (dError) {
        return NextResponse.json({ error: `[D] ${dError.message}` }, { status: 500 });
      }
      return NextResponse.json([]);
    }
  } catch (error: any) {
    return NextResponse.json({ error: `[C] ${error.message}` }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createClient();
    const { id } = await params;
    const { data, error } = await supabase
      .from('location_course_offerings')
      .select('*')
      .eq('location_id', id);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
