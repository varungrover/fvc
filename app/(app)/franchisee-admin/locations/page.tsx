import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { listLocations } from '@/lib/db/locations'
import { LocationsClient } from './LocationsClient'

export default async function FranchiseeLocationsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const supabase = await createClient()
  const locations = await listLocations(supabase, session)

  const { data: ownership } = await supabase
    .from('ownerships')
    .select('full_name, id')
    .eq('id', session.ownershipId ?? '')
    .single()

  return (
    <LocationsClient
      locations={locations}
      ownershipName={ownership?.full_name ?? 'My Franchise'}
    />
  )
}
