import type { SupabaseClient } from '@supabase/supabase-js'
import type { SessionUser } from '@/lib/auth/types'

export interface LocationRow {
  id: string
  ownership_id: string
  name: string
  address_line1: string
  address_line2: string | null
  city: string
  state_province: string
  country: string
  postal_code: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Named GLOBAL_ROLES (not FRANCHISOR_ROLES as in ownerships.ts) — same values, clearer intent.
const GLOBAL_ROLES = new Set(['franchisor_admin', 'franchisor_mgmt'])

function isGlobalRole(session: SessionUser): boolean {
  return GLOBAL_ROLES.has(session.role)
}

export async function listLocations(
  supabase: SupabaseClient,
  session: SessionUser,
): Promise<LocationRow[]> {
  let query = supabase.from('locations').select('*').order('name')
  if (!isGlobalRole(session)) {
    query = query.eq('ownership_id', session.ownershipId ?? '')
  }
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as LocationRow[]
}

export async function getLocation(
  supabase: SupabaseClient,
  id: string,
  session: SessionUser,
): Promise<LocationRow | null> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  const row = data as LocationRow
  // We need the row to know its ownership_id — guard-first pre-check isn't possible here.
  // RLS enforces scope at the DB layer; this check is defence-in-depth at the app layer.
  if (!isGlobalRole(session) && row.ownership_id !== session.ownershipId) return null

  return row
}

export async function createLocation(
  supabase: SupabaseClient,
  input: Pick<
    LocationRow,
    'ownership_id' | 'name' | 'address_line1' | 'city' | 'state_province' | 'country'
  > &
    Partial<Pick<LocationRow, 'address_line2' | 'postal_code'>>,
): Promise<LocationRow> {
  const { data, error } = await supabase
    .from('locations')
    .insert({
      ownership_id: input.ownership_id,
      name: input.name,
      address_line1: input.address_line1,
      address_line2: input.address_line2 ?? null,
      city: input.city,
      state_province: input.state_province,
      country: input.country,
      postal_code: input.postal_code ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as LocationRow
}

export async function updateLocation(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<
    Pick<
      LocationRow,
      | 'name'
      | 'address_line1'
      | 'address_line2'
      | 'city'
      | 'state_province'
      | 'country'
      | 'postal_code'
      | 'is_active'
    >
  >,
  session: SessionUser,
): Promise<LocationRow | null> {
  // Fail fast for scoped roles trying to update a location they don't own
  if (!isGlobalRole(session)) {
    const existing = await getLocation(supabase, id, session)
    if (!existing) return null
  }

  const cleanPatch = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined),
  )

  if (Object.keys(cleanPatch).length === 0) return null

  const { data, error } = await supabase
    .from('locations')
    .update({ ...cleanPatch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as LocationRow
}

export async function listPublicLocations(
  supabase: SupabaseClient,
  ownershipId: string,
): Promise<LocationRow[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('ownership_id', ownershipId)
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return (data ?? []) as LocationRow[]
}
