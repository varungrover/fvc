import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { updatePlanet } from '@/lib/db/catalog';

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
    if (!id) return NextResponse.json({ error: 'Missing planet ID' }, { status: 400 });

    const body = await request.json();
    const supabase = await createClient();
    
    console.log(`Updating planet ${id}:`, body);
    
    const updated = await updatePlanet(supabase, id, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error in PATCH /api/planets/[id]:', error);
    // Return a more descriptive error message if available
    const message = error.message || error.details || JSON.stringify(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
