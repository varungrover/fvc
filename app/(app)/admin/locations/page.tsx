import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { listLocations } from '@/lib/db/locations'
import { LocationsClient } from './LocationsClient'

export default async function AdminLocationsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const supabase = await createClient()
  const allLocations = await listLocations(supabase, session)

  const { data: ownership } = await supabase
    .from('ownerships')
    .select('full_name, id')
    .eq('ownership_type', 'corporate')
    .eq('is_active', true)
    .single()

  // For the franchisor admin, show all locations across all ownerships
  // If we wanted to group them by ownership, we could, but for now we show all
  const locations = allLocations

  const { data: planets } = await supabase
    .from('planets')
    .select('*, products(*)')
    .order('name');

  return (
    <LocationsClient
      locations={locations}
      ownershipName={ownership?.full_name ?? 'Corporate'}
      ownershipId={ownership?.id ?? session.ownershipId ?? ''}
      planets={planets || []}
    />
  )
}
