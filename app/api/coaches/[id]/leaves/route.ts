import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { createCoachLeave, updateCoachLeaveStatus } from '@/lib/db/coaches'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('staff_leaves')
      .select('*')
      .eq('profile_id', params.id)
      .order('start_date', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const session = await getSession()

    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isSelf = session.id === params.id
    const isAdmin = ['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const leave = await createCoachLeave(supabase, params.id, body)

    return NextResponse.json(leave)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
