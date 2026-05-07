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
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  if (session.role !== 'franchisor_admin' && session.role !== 'franchisee_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    
    const offering = await upsertOffering(supabase, {
      ...body,
      locationId: id
    });
    return NextResponse.json(offering, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
