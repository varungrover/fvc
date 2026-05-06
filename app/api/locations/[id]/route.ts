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

  const patch: Partial<
    Pick<
      import('@/lib/db/locations').LocationRow,
      | 'name'
      | 'address_line1'
      | 'address_line2'
      | 'city'
      | 'state_province'
      | 'country'
      | 'postal_code'
      | 'is_active'
    >
  > = {}
  if (body.name !== undefined) patch.name = body.name
  if (body.addressLine1 !== undefined) patch.address_line1 = body.addressLine1
  if (body.addressLine2 !== undefined) patch.address_line2 = body.addressLine2
  if (body.city !== undefined) patch.city = body.city
  if (body.stateProvince !== undefined) patch.state_province = body.stateProvince
  if (body.country !== undefined) patch.country = body.country
  if (body.postalCode !== undefined) patch.postal_code = body.postalCode
  if (body.isActive !== undefined) patch.is_active = body.isActive

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
  }

  const supabase = await createClient()
  try {
    const location = await updateLocation(supabase, id, patch, session)
    if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(location)
  } catch (e) {
    console.error('updateLocation failed:', e)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}
