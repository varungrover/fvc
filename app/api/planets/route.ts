import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { listPlanets, createPlanet } from '@/lib/db/catalog';

export async function GET() {
  try {
    const supabase = await createClient();
    const planets = await listPlanets(supabase);
    return NextResponse.json(planets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const planet = await createPlanet(supabase, body);
    return NextResponse.json(planet, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
