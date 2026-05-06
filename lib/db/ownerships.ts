import type { SupabaseClient } from '@supabase/supabase-js'
import type { SessionUser } from '@/lib/auth/types'

export interface OwnershipRow {
  id: string
  full_name: string
  email: string
  ownership_type: 'corporate' | 'franchisee'
  slug: string
  logo_url: string | null
  brand_primary: string
  brand_accent: string
  tagline: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const FRANCHISOR_ROLES = new Set(['franchisor_admin', 'franchisor_mgmt'])

function isGlobalRole(session: SessionUser): boolean {
  return FRANCHISOR_ROLES.has(session.role)
}

export async function listOwnerships(
  supabase: SupabaseClient,
  session: SessionUser,
): Promise<OwnershipRow[]> {
  let query = supabase.from('ownerships').select('*')
  if (!isGlobalRole(session)) {
    query = query.eq('id', session.ownershipId ?? '')
  }
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as OwnershipRow[]
}

export async function getOwnership(
  supabase: SupabaseClient,
  id: string,
  session: SessionUser,
): Promise<OwnershipRow | null> {
  // Scoped roles can only read their own ownership
  if (!isGlobalRole(session) && session.ownershipId !== id) return null

  const { data, error } = await supabase
    .from('ownerships')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as OwnershipRow
}

export async function createOwnership(
  supabase: SupabaseClient,
  input: Pick<OwnershipRow, 'full_name' | 'email' | 'ownership_type' | 'slug' | 'brand_primary' | 'brand_accent'> &
    Partial<Pick<OwnershipRow, 'logo_url' | 'tagline'>>,
): Promise<OwnershipRow> {
  const { data, error } = await supabase
    .from('ownerships')
    .insert(input)
    .select()
    .single()
  if (error) throw error
  return data as OwnershipRow
}

export async function updateOwnership(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Omit<OwnershipRow, 'id' | 'created_at'>>,
): Promise<OwnershipRow> {
  const { data, error } = await supabase
    .from('ownerships')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as OwnershipRow
}
