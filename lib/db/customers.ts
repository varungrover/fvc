import type { SupabaseClient } from '@supabase/supabase-js'
import type { SessionUser } from '@/lib/auth/types'

export interface CustomerRow {
  id: string
  profile_id: string
  ownership_id: string
  full_name: string
  email: string
  phone: string | null
  emergency_contact: string | null
  gender: string | null
  cfc_id: string | null
  terms_accepted: boolean
  loyalty_points: number
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
  member_count?: number
}

const GLOBAL_ROLES = new Set(['franchisor_admin', 'franchisor_mgmt'])

function isGlobalRole(session: SessionUser): boolean {
  return GLOBAL_ROLES.has(session.role)
}

export async function listCustomers(
  supabase: SupabaseClient,
  session: SessionUser,
): Promise<CustomerRow[]> {
  let query = supabase
    .from('customers')
    .select(`
      *,
      profiles!inner(full_name, email),
      members(count)
    `)
    .order('profiles(full_name)')

  if (!isGlobalRole(session)) {
    query = query.eq('ownership_id', session.ownershipId ?? '')
  }

  const { data, error } = await query

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    ...row,
    full_name: row.profiles?.full_name,
    email: row.profiles?.email,
    member_count: row.members?.[0]?.count ?? 0
  })) as CustomerRow[]
}

export async function getCustomerDetails(
  supabase: SupabaseClient,
  id: string,
  session: SessionUser
): Promise<CustomerRow | null> {
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      profiles!inner(full_name, email)
    `)
    .eq('id', id)
    .single()

  if (error || !data) return null

  // Security check
  if (!isGlobalRole(session) && data.ownership_id !== session.ownershipId && data.profile_id !== session.id) {
    return null
  }

  return {
    ...data,
    full_name: data.profiles?.full_name,
    email: data.profiles?.email
  } as CustomerRow
}

export async function updateCustomer(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Omit<CustomerRow, 'id' | 'profile_id' | 'ownership_id' | 'created_at' | 'updated_at'>>
): Promise<void> {
  const { error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}
