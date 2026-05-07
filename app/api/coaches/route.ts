import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { listCoaches } from '@/lib/db/coaches'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const session = await getSession()

    if (!session || !['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const coaches = await listCoaches(supabase, session)
    return NextResponse.json(coaches)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
