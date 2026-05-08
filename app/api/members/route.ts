import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { listMembers, upsertMember } from '@/lib/db/members'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const customerId = request.nextUrl.searchParams.get('customerId')
  if (!customerId) return NextResponse.json({ error: 'Missing customerId' }, { status: 400 })

  try {
    const supabase = await createClient()
    const members = await listMembers(supabase, customerId, session)
    return NextResponse.json(members)
  } catch (error: any) {
    console.error('Failed to list members:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { 
      customer_id, 
      full_name, 
      dob, 
      grade, 
      t_shirt_size, 
      preferred_color, 
      gender,
      is_active 
    } = body

    if (!customer_id || !full_name || !dob) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const member = await upsertMember(supabase, {
      customer_id,
      full_name,
      dob,
      grade,
      t_shirt_size,
      preferred_color,
      gender,
      is_active: is_active ?? true
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create member:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
