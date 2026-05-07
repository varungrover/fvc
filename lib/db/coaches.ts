import type { SupabaseClient } from '@supabase/supabase-js'
import type { SessionUser } from '@/lib/auth/types'

export type CoachStatus = 'active' | 'on_leave' | 'inactive'

export interface CoachRow {
  id: string
  email: string
  full_name: string
  role_id: number
  ownership_id: string
  is_active: boolean
  created_at: string
  status?: CoachStatus
  qualifications?: string[] // Planet names
  planet_ids?: string[] // Planet IDs
}

export interface StaffAvailability {
  id: string
  profile_id: string
  day_of_week: string
  start_time: string
  end_time: string
  is_active: boolean
}

export interface StaffLeave {
  id: string
  profile_id: string
  start_date: string
  end_date: string
  reason: string | null
  status: 'pending' | 'approved' | 'rejected'
}

const GLOBAL_ROLES = new Set(['franchisor_admin', 'franchisor_mgmt'])

function isGlobalRole(session: SessionUser): boolean {
  return GLOBAL_ROLES.has(session.role)
}

export async function listCoaches(
  supabase: SupabaseClient,
  session: SessionUser,
): Promise<CoachRow[]> {
  const today = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('profiles')
    .select(`
      *,
      roles!inner(name),
      staff_planets(planet_id, planets(name)),
      staff_leaves(id, start_date, end_date, status)
    `)
    .eq('roles.name', 'coach')
    .order('full_name')

  if (!isGlobalRole(session)) {
    query = query.eq('ownership_id', session.ownershipId ?? '')
  }

  const { data, error } = await query

  if (error) throw error

  return (data ?? []).map((row: any) => {
    // 1. Flatten qualifications
    const qualifications = row.staff_planets
      ?.map((sp: any) => sp.planets?.name)
      .filter(Boolean) || []

    // 2. Compute status
    let status: CoachStatus = 'inactive'
    if (row.is_active) {
      const hasActiveLeave = row.staff_leaves?.some((l: any) => 
        l.status === 'approved' && 
        today >= l.start_date && 
        today <= l.end_date
      )
      status = hasActiveLeave ? 'on_leave' : 'active'
    }

    return {
      ...row,
      qualifications,
      status
    } as CoachRow
  })
}

export async function getCoachDetails(
  supabase: SupabaseClient,
  id: string,
  session: SessionUser
): Promise<{ coach: CoachRow; availability: StaffAvailability[]; leaves: StaffLeave[] } | null> {
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select(`
      *,
      staff_planets(planet_id, planets(name))
    `)
    .eq('id', id)
    .single()

  if (pErr || !profile) return null

  // Security check
  if (!isGlobalRole(session) && profile.ownership_id !== session.ownershipId) return null

  const { data: availability, error: aErr } = await supabase
    .from('staff_availability')
    .select('*')
    .eq('profile_id', id)
    .order('day_of_week')

  const { data: leaves, error: lErr } = await supabase
    .from('staff_leaves')
    .select('*')
    .eq('profile_id', id)
    .order('start_date', { ascending: false })

  if (aErr || lErr) throw (aErr || lErr)

  return {
    coach: {
      ...profile,
      qualifications: profile.staff_planets?.map((sp: any) => sp.planets?.name).filter(Boolean) || [],
      planet_ids: profile.staff_planets?.map((sp: any) => sp.planet_id) || []
    } as CoachRow,
    availability: (availability ?? []) as StaffAvailability[],
    leaves: (leaves ?? []) as StaffLeave[]
  }
}

export async function updateCoachStatus(
  supabase: SupabaseClient,
  id: string,
  isActive: boolean
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', id)
  if (error) throw error
}

export async function upsertCoachAvailability(
  supabase: SupabaseClient,
  profileId: string,
  availability: Omit<StaffAvailability, 'id' | 'profile_id'>[]
): Promise<void> {
  // Simple strategy: delete and re-insert for the specific coach
  // Alternatively, we could do a true upsert if we had a natural key.
  // Our schema doesn't have a unique constraint on day_of_week for multiple slots.
  // Let's just delete all and re-insert for now as it's cleaner for bulk updates.
  const { error: delErr } = await supabase
    .from('staff_availability')
    .delete()
    .eq('profile_id', profileId)

  if (delErr) throw delErr

  if (availability.length > 0) {
    const { error: insErr } = await supabase
      .from('staff_availability')
      .insert(availability.map(a => ({ 
        profile_id: profileId,
        day_of_week: a.day_of_week,
        start_time: a.start_time,
        end_time: a.end_time,
        is_active: a.is_active ?? true
      })))
    if (insErr) throw insErr
  }
}

export async function createCoachLeave(
  supabase: SupabaseClient,
  profileId: string,
  leave: Omit<StaffLeave, 'id' | 'profile_id' | 'status'>
): Promise<StaffLeave> {
  const { data, error } = await supabase
    .from('staff_leaves')
    .insert({ ...leave, profile_id: profileId, status: 'approved' }) // Auto-approve for admins
    .select()
    .single()

  if (error) throw error
  return data as StaffLeave
}

export async function updateCoachLeaveStatus(
  supabase: SupabaseClient,
  leaveId: string,
  status: 'approved' | 'rejected'
): Promise<void> {
  const { error } = await supabase
    .from('staff_leaves')
    .update({ status })
    .eq('id', leaveId)
  if (error) throw error
}

export async function deleteCoachLeave(
  supabase: SupabaseClient,
  leaveId: string
): Promise<void> {
  const { error } = await supabase
    .from('staff_leaves')
    .delete()
    .eq('id', leaveId)
  if (error) throw error
}
