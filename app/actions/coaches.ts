'use server'

import { createClient } from '@/lib/supabase/server'
import { upsertCoachAvailability, StaffAvailability } from '@/lib/db/coaches'
import { revalidatePath } from 'next/cache'

export async function updateCoachAvailabilityAction(
  profileId: string,
  availability: Omit<StaffAvailability, 'id' | 'profile_id'>[]
) {
  const supabase = await createClient()
  
  // Security check: ensure the user is updating their own availability or is an admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role_id, roles(name)')
    .eq('id', user.id)
    .single()

  const roleName = (profile?.roles as any)?.name

  if (profileId !== user.id && !['franchisor_admin', 'franchisee_admin'].includes(roleName)) {
    throw new Error('Forbidden')
  }

  await upsertCoachAvailability(supabase, profileId, availability)
  
  revalidatePath('/coach/availability')
  revalidatePath(`/admin/coaches/${profileId}`)
  revalidatePath(`/franchisee-admin/coaches/${profileId}`)
}
