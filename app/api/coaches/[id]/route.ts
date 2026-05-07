import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { updateCoachStatus } from '@/lib/db/coaches'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const session = await getSession()

    if (!session || !['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    if (typeof body.is_active === 'boolean') {
      await updateCoachStatus(supabase, params.id, body.is_active)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
