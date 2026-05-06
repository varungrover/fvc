import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { listVariants } from '@/lib/db/catalog';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('levelId'); // UX calls it levelId

  if (!productId) {
    return NextResponse.json({ error: 'levelId is required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const variants = await listVariants(supabase, productId);
    return NextResponse.json(variants);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
