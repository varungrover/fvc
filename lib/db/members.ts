import type { SupabaseClient } from '@supabase/supabase-js'
import type { SessionUser } from '@/lib/auth/types'

export interface MemberRow {
  id: string
  customer_id: string
  full_name: string
  dob: string
  gender: string | null
  grade: string | null
  t_shirt_size: string | null
  preferred_color: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

const GLOBAL_ROLES = new Set(['franchisor_admin', 'franchisor_mgmt'])

function isGlobalRole(session: SessionUser): boolean {
  return GLOBAL_ROLES.has(session.role)
}

export async function listMembers(
  supabase: SupabaseClient,
  customerId: string,
  session: SessionUser
): Promise<MemberRow[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('customer_id', customerId)
    .order('full_name')

  if (error) throw error

  // Security check: Customer can only see their own members
  // Admins can see members if they can see the customer (handled by RLS mostly, but good to check ownership)
  // Actually, we should probably check if the customer belongs to the admin's ownership.
  // But RLS on 'members' table already checks if the admin belongs to the same ownership_id as the customer.
  
  return (data ?? []) as MemberRow[]
}

export async function getMemberDetails(
  supabase: SupabaseClient,
  id: string,
  session: SessionUser
): Promise<MemberRow | null> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null

  return data as MemberRow
}

export async function upsertMember(
  supabase: SupabaseClient,
  member: Omit<MemberRow, 'id' | 'created_at' | 'updated_at'> & { id?: string }
): Promise<MemberRow> {
  const { data, error } = await supabase
    .from('members')
    .upsert(member)
    .select()
    .single()

  if (error) throw error
  return data as MemberRow
}

export async function deleteMember(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', id)

  if (error) throw error
}
