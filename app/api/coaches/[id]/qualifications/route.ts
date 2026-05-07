import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const session = await getSession()

    if (!session || !['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planetIds } = await request.json()
    if (!Array.isArray(planetIds)) {
      return NextResponse.json({ error: 'planetIds must be an array' }, { status: 400 })
    }

    // Transactional sync: Delete existing and insert new
    const { error: delErr } = await supabase
      .from('staff_planets')
      .delete()
      .eq('profile_id', id)

    if (delErr) throw delErr

    if (planetIds.length > 0) {
      const { error: insErr } = await supabase
        .from('staff_planets')
        .insert(
          planetIds.map(pid => ({ profile_id: id, planet_id: pid }))
        )
      if (insErr) throw insErr
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
