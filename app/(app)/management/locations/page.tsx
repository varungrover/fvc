import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { LocationsClient } from './LocationsClient'
import type { LocationRow } from '@/lib/db/locations'

export default async function ManagementLocationsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const supabase = await createClient()

  // Fetch all ownerships + their locations in one join
  const { data: ownerships } = await supabase
    .from('ownerships')
    .select('id, full_name, locations(*)')
    .eq('is_active', true)
    .order('full_name')

  const groups = (ownerships ?? []).map((o) => ({
    id: o.id as string,
    name: o.full_name as string,
    locations: (o.locations as unknown as LocationRow[]) ?? [],
  }))

  const totalLocations = groups.reduce((sum, g) => sum + g.locations.length, 0)

  return <LocationsClient groups={groups} totalLocations={totalLocations} />
}
