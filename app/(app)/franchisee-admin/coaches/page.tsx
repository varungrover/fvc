import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { listCoaches } from '@/lib/db/coaches'
import { CoachesClient } from '../../admin/coaches/CoachesClient'

export default async function FranchiseeCoachesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const supabase = await createClient()
  const coaches = await listCoaches(supabase, session)

  return (
    <CoachesClient 
      initialCoaches={coaches}
      isAdmin={['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)}
      basePath="/franchisee-admin/coaches"
    />
  )
}
