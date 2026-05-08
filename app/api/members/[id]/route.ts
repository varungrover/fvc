import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { getMemberDetails, upsertMember, deleteMember } from '@/lib/db/members'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const supabase = await createClient()
    const member = await getMemberDetails(supabase, id, session)
    
    if (!member) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error: any) {
    console.error('Failed to get member:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body = await request.json()
    
    // In a real 2FA setup, we would check for AAL2 here for PII fields.
    // For now, we allow updates without 2FA.

    const supabase = await createClient()
    
    // Fetch existing first to ensure they own it / can access it
    const existing = await getMemberDetails(supabase, id, session)
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { 
      full_name, 
      dob, 
      grade, 
      t_shirt_size, 
      preferred_color, 
      gender,
      is_active 
    } = body

    const member = await upsertMember(supabase, {
      id,
      customer_id: existing.customer_id,
      full_name: full_name ?? existing.full_name,
      dob: dob ?? existing.dob,
      grade: grade !== undefined ? grade : existing.grade,
      t_shirt_size: t_shirt_size !== undefined ? t_shirt_size : existing.t_shirt_size,
      preferred_color: preferred_color !== undefined ? preferred_color : existing.preferred_color,
      gender: gender !== undefined ? gender : existing.gender,
      is_active: is_active ?? existing.is_active
    })

    return NextResponse.json(member)
  } catch (error: any) {
    console.error('Failed to update member:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const supabase = await createClient()
    
    // Check if it exists
    const existing = await getMemberDetails(supabase, id, session)
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await deleteMember(supabase, id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete member:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
