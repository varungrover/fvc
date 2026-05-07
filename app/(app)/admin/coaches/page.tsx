import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { listCoaches } from '@/lib/db/coaches'
import { CoachesClient } from './CoachesClient'

export default async function AdminCoachesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const supabase = await createClient()
  const coaches = await listCoaches(supabase, session)

  return (
    <CoachesClient 
      initialCoaches={coaches}
      isAdmin={['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)}
    />
  )
}
