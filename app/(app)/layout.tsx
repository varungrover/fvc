import { redirect } from 'next/navigation'
import { type ReactNode } from 'react'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { navForRole, roleLabelFor } from '@/lib/auth/nav'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const supabase = await createClient()
  const { data: platform } = await supabase
    .from('ownerships')
    .select('full_name')
    .eq('ownership_type', 'corporate')
    .eq('is_active', true)
    .single()
  const tenantName = platform?.full_name

  const navItems = navForRole(session.role);

  return (
    <AppShell
      navItems={navItems as any}
      topBar={{
        productName: 'StarLearning',
        tenantName,
        roleLabel: roleLabelFor(session.role),
        userName: session.fullName,
      }}
    >
      {children}
    </AppShell>
  )
}
