import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { listHolidays, createHoliday } from '@/lib/db/holidays';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ownershipId = searchParams.get('ownershipId');
  const locationId = searchParams.get('locationId');

  try {
    const supabase = await createClient();
    const holidays = await listHolidays(supabase, ownershipId || undefined, locationId || undefined);
    return NextResponse.json(holidays);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const holiday = await createHoliday(supabase, body);
    return NextResponse.json(holiday, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
