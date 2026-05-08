import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { updateLevel } from '@/lib/db/catalog';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'franchisor_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createClient();
    
    const updated = await updateLevel(supabase, id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating level:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
