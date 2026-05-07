import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { upsertCoachAvailability } from '@/lib/db/coaches'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('staff_availability')
      .select('*')
      .eq('profile_id', id)

    if (error) throw error
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const session = await getSession()

    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const isSelf = session.id === id
    const isAdmin = ['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)

    if (!isSelf && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    await upsertCoachAvailability(supabase, id, body)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
