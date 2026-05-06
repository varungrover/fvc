import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSession } from '@/lib/auth/session'
import { listOwnerships, createOwnership } from '@/lib/db/ownerships'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = await createClient()
  const ownerships = await listOwnerships(supabase, session)
  return NextResponse.json(ownerships)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'franchisor_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  if (!body?.fullName || !body?.email || !body?.ownershipType || !body?.slug) {
    return NextResponse.json({ error: 'Missing required fields: fullName, email, ownershipType, slug' }, { status: 400 })
  }

  const supabase = await createClient()
  const ownership = await createOwnership(supabase, {
    full_name: body.fullName,
    email: body.email,
    ownership_type: body.ownershipType,
    slug: body.slug,
    brand_primary: body.brandPrimary ?? '#0a9b8a',
    brand_accent: body.brandAccent ?? '#e67e22',
    logo_url: body.logoUrl ?? null,
    tagline: body.tagline ?? null,
  })

  // Invite management account
  if (body.mgmtEmail) {
    const admin = createAdminClient()
    await admin.auth.admin.inviteUserByEmail(body.mgmtEmail, {
      data: {
        role: 'franchisee_mgmt',
        ownership_id: ownership.id,
        must_change_password: true,
      },
    })
  }

  return NextResponse.json(ownership, { status: 201 })
}
