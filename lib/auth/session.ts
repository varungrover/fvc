import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/types'
import type { SessionUser } from '@/lib/auth/types'

export async function getSession(): Promise<SessionUser | null> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  const meta = user.app_metadata as {
    role?: string
    ownership_id?: string
    must_change_password?: boolean
  }

  if (!meta.role) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, must_change_password')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email ?? '',
    role: meta.role as Role,
    ownershipId: meta.ownership_id ?? null,
    fullName: profile?.full_name ?? '',
    mustChangePassword: profile?.must_change_password ?? meta.must_change_password ?? false,
  }
}
