import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { getCoachDetails } from '@/lib/db/coaches'
import { CoachLeavesClient } from './CoachLeavesClient'

export default async function CoachLeavesPage() {
  const session = await getSession()
  if (!session || session.role !== 'coach') redirect('/login')

  const supabase = await createClient()
  const data = await getCoachDetails(supabase, session.id, session)

  if (!data) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No coach profile found.</div>
  }

  return (
    <CoachLeavesClient 
      initialLeaves={data.leaves}
      profileId={session.id}
    />
  )
}
