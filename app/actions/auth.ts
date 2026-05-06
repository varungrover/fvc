'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getLandingForRole } from '@/lib/auth/routing'
import type { Role } from '@/lib/types'

export async function loginAction(
  formData: FormData,
): Promise<{ error: string } | never> {
  const email = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''
  const next = formData.get('next') as string | null

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: error?.message ?? 'Login failed.' }
  }

  const role = data.user.app_metadata?.role as Role | undefined
  if (!role) {
    return { error: 'Account has no role assigned. Contact your administrator.' }
  }

  redirect(next && next.startsWith('/') ? next : getLandingForRole(role))
}

export async function logoutAction(): Promise<never> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function changePasswordAction(
  formData: FormData,
): Promise<{ error: string } | never> {
  const password = (formData.get('password') as string | null) ?? ''
  const confirm = (formData.get('confirm') as string | null) ?? ''

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (password !== confirm) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  // Clear must_change_password in app_metadata via admin client
  const admin = createAdminClient()
  await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...user.app_metadata,
      must_change_password: false,
    },
  })

  // Also update profiles table
  await supabase.from('profiles').update({ must_reset_pw: false }).eq('id', user.id)

  const role = user.app_metadata?.role as Role | undefined
  redirect(role ? getLandingForRole(role) : '/login')
}
