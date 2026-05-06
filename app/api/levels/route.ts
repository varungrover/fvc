import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { listLevels } from '@/lib/db/catalog';

export async function GET(request: Request) {
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
