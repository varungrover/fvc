import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { getLocation, updateLocation } from '@/lib/db/locations'

const CAN_UPDATE = new Set(['franchisor_admin', 'franchisee_admin'])

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = await createClient()
  const location = await getLocation(supabase, id, session)
  if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(location)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!CAN_UPDATE.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const supabase = await createClient()
  const location = await updateLocation(
    supabase,
    id,
    {
      name: body.name,
      address_line1: body.addressLine1,
      address_line2: body.addressLine2,
      city: body.city,
      state_province: body.stateProvince,
      country: body.country,
      postal_code: body.postalCode,
      is_active: body.isActive,
    },
    session,
  )

  if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(location)
}
