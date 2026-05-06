import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listPublicLocations } from '@/lib/db/locations'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const ownershipId = searchParams.get('ownershipId')

  if (!ownershipId) {
    return NextResponse.json({ error: 'ownershipId query param required' }, { status: 400 })
  }

  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!UUID_RE.test(ownershipId)) {
    return NextResponse.json({ error: 'ownershipId must be a valid UUID' }, { status: 400 })
  }

  const supabase = await createClient()
  const locations = await listPublicLocations(supabase, ownershipId)
  return NextResponse.json(locations)
}
