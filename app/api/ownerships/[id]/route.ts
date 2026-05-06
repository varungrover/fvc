import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { getOwnership, updateOwnership } from '@/lib/db/ownerships'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const supabase = await createClient()
  const ownership = await getOwnership(supabase, id, session)
  if (!ownership) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(ownership)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'franchisor_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const supabase = await createClient()
  const ownership = await updateOwnership(supabase, id, {
    full_name: body.fullName,
    email: body.email,
    slug: body.slug,
    brand_primary: body.brandPrimary,
    brand_accent: body.brandAccent,
    logo_url: body.logoUrl,
    tagline: body.tagline,
    is_active: body.isActive,
  })

  return NextResponse.json(ownership)
}
