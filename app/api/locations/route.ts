import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { listLocations, createLocation } from '@/lib/db/locations'

const CAN_CREATE = new Set(['franchisor_admin', 'franchisee_admin'])

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const locations = await listLocations(supabase, session)
  return NextResponse.json(locations)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!CAN_CREATE.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.name || !body?.addressLine1 || !body?.city || !body?.stateProvince || !body?.country) {
    return NextResponse.json(
      { error: 'Missing required fields: name, addressLine1, city, stateProvince, country' },
      { status: 400 },
    )
  }

  // Franchisee admins can only create locations under their own ownership
  const ownershipId =
    session.role === 'franchisee_admin' ? session.ownershipId! : body.ownershipId

  if (!ownershipId) {
    return NextResponse.json({ error: 'ownershipId is required for franchisor_admin' }, { status: 400 })
  }

  const supabase = await createClient()
  const location = await createLocation(supabase, {
    ownership_id: ownershipId,
    name: body.name,
    address_line1: body.addressLine1,
    address_line2: body.addressLine2 ?? null,
    city: body.city,
    state_province: body.stateProvince,
    country: body.country,
    postal_code: body.postalCode ?? null,
  })

  return NextResponse.json(location, { status: 201 })
}
