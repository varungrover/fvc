import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { createVariant } from '@/lib/db/catalog';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.role !== 'franchisor_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const supabase = await createClient();
    const body = await request.json();
    
    // Ensure we have a valid name and map camelCase to snake_case if needed
    const variantData = {
      ...body,
      name: body.name || `${body.frequencyPerWeek}x per week`,
      // Ensure setupFee is mapped correctly to what the catalog lib expects
      setupFee: body.setupFee ?? 0
    };

    const variant = await createVariant(supabase, variantData);
    return NextResponse.json(variant, { status: 201 });
  } catch (error: any) {
    console.error('Error in course-variants POST:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
