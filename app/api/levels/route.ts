import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { listLevels, createLevel } from '@/lib/db/catalog';

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const planetId = searchParams.get('planetId');

  if (!planetId) {
    return NextResponse.json({ error: 'planetId is required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const levels = await listLevels(supabase, planetId);
    return NextResponse.json(levels);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'franchisor_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const level = await createLevel(supabase, body);
    return NextResponse.json(level, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
