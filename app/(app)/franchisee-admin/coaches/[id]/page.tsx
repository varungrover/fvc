import { redirect, notFound } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { getCoachDetails } from '@/lib/db/coaches'
import { CoachDetailClient } from '@/app/(app)/admin/coaches/[id]/CoachDetailClient'

export default async function FranchiseeCoachDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const supabase = await createClient()
  const data = await getCoachDetails(supabase, id, session)
  const { data: planets } = await supabase.from('planets').select('id, name').eq('is_active', true)

  if (!data) {
    notFound()
  }

  return (
    <CoachDetailClient 
      coach={data.coach} 
      initialAvailability={data.availability}
      initialLeaves={data.leaves}
      allPlanets={planets || []}
      isAdmin={['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)}
      backPath="/franchisee-admin/coaches"
    />
  )
}
