import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { listOfferings, upsertOffering } from '@/lib/db/offerings';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const offerings = await listOfferings(supabase, params.id);
    return NextResponse.json(offerings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const offering = await upsertOffering(supabase, {
      ...body,
      locationId: params.id
    });
    return NextResponse.json(offering, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
