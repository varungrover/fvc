import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { getCoachDetails } from '@/lib/db/coaches'
import { CoachAvailabilityClient } from './CoachAvailabilityClient'

export default async function CoachAvailabilityPage() {
  const session = await getSession()
  if (!session || session.role !== 'coach') redirect('/login')

  const supabase = await createClient()
  const data = await getCoachDetails(supabase, session.id, session)

  if (!data) {
    // If no coach profile exists yet for this user
    return <div style={{ padding: '40px', textAlign: 'center' }}>No coach profile found. Please contact support.</div>
  }

  return (
    <CoachAvailabilityClient 
      initialAvailability={data.availability}
      profileId={session.id}
    />
  )
}
