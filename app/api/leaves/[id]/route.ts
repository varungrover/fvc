import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { deleteCoachLeave } from '@/lib/db/coaches'
import { NextResponse } from 'next/server'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Security: Check if leave belongs to coach or if user is admin
    const { data: leave, error: lErr } = await supabase
      .from('staff_leaves')
      .select('profile_id')
      .eq('id', params.id)
      .single()

    if (lErr || !leave) {
      return NextResponse.json({ error: 'Leave not found' }, { status: 404 })
    }

    const isSelf = session.id === leave.profile_id
    const isAdmin = ['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deleteCoachLeave(supabase, params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

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

    const { status } = await request.json()
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const { error } = await supabase
      .from('staff_leaves')
      .update({ status })
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
