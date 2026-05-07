'use server'

import { createClient } from '@/lib/supabase/server'
import { getSession } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import * as db from '@/lib/db/coaches'
import { StaffAvailability, StaffLeave } from '@/lib/db/coaches'

export async function updateCoachStatusAction(id: string, isActive: boolean) {
  const supabase = await createClient()
  const session = await getSession()
  if (!session || !['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)) {
    throw new Error('Unauthorized')
  }

  await db.updateCoachStatus(supabase, id, isActive)
  revalidatePath('/admin/coaches')
  revalidatePath(`/admin/coaches/${id}`)
}

export async function updateCoachAvailabilityAction(profileId: string, availability: Omit<StaffAvailability, 'id' | 'profile_id'>[]) {
  const supabase = await createClient()
  const session = await getSession()
  
  // Admins can update any, Coaches can update self
  const isSelf = session?.id === profileId
  const isAdmin = session && ['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)
  
  if (!session || (!isSelf && !isAdmin)) {
    throw new Error('Unauthorized')
  }

  await db.upsertCoachAvailability(supabase, profileId, availability)
  revalidatePath(`/admin/coaches/${profileId}`)
  revalidatePath('/coach/availability')
}

export async function createCoachLeaveAction(profileId: string, leave: { start_date: string; end_date: string; reason: string | null }) {
  const supabase = await createClient()
  const session = await getSession()
  
  const isSelf = session?.id === profileId
  const isAdmin = session && ['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)

  if (!session || (!isSelf && !isAdmin)) {
    throw new Error('Unauthorized')
  }

  if (new Date(leave.start_date) > new Date(leave.end_date)) {
    throw new Error('Start date cannot be after end date')
  }

  await db.createCoachLeave(supabase, profileId, leave)
  revalidatePath(`/admin/coaches/${profileId}`)
  revalidatePath('/coach/leaves')
}

export async function updateCoachLeaveStatusAction(leaveId: string, status: 'approved' | 'rejected', coachId: string) {
  const supabase = await createClient()
  const session = await getSession()
  
  if (!session || !['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)) {
    throw new Error('Unauthorized')
  }

  await db.updateCoachLeaveStatus(supabase, leaveId, status)
  revalidatePath(`/admin/coaches/${coachId}`)
}

export async function deleteCoachLeaveAction(leaveId: string, profileId: string) {
  const supabase = await createClient()
  const session = await getSession()
  
  const isSelf = session?.id === profileId
  const isAdmin = session && ['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)

  if (!session || (!isSelf && !isAdmin)) {
    throw new Error('Unauthorized')
  }

  await db.deleteCoachLeave(supabase, leaveId)
  revalidatePath(`/admin/coaches/${profileId}`)
  revalidatePath('/coach/leaves')
}

export async function updateCoachQualificationsAction(profileId: string, planetIds: string[]) {
  const supabase = await createClient()
  const session = await getSession()
  
  if (!session || !['franchisor_admin', 'franchisor_mgmt', 'franchisee_admin'].includes(session.role)) {
    throw new Error('Unauthorized')
  }

  // Transactional sync
  const { error: delErr } = await supabase.from('staff_planets').delete().eq('profile_id', profileId)
  if (delErr) throw delErr

  if (planetIds.length > 0) {
    const { error: insErr } = await supabase.from('staff_planets').insert(
      planetIds.map(pid => ({ profile_id: profileId, planet_id: pid }))
    )
    if (insErr) throw insErr
  }

  revalidatePath(`/admin/coaches/${profileId}`)
  revalidatePath('/admin/coaches')
}
