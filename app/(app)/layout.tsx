import { redirect } from 'next/navigation'
import { type ReactNode } from 'react'
import { getSession } from '@/lib/auth/session'
import { createClient } from '@/lib/supabase/server'
import { getOwnership } from '@/lib/db/ownerships'
import { AppShell } from '@/components/layout/AppShell'
import { navForRole, roleLabelFor } from '@/lib/auth/nav'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  let tenantName: string | undefined
  if (session.ownershipId) {
    const supabase = await createClient()
    const ownership = await getOwnership(supabase, session.ownershipId, session)
    tenantName = ownership?.full_name
  }

  return (
    <AppShell
      navItems={navForRole(session.role)}
      topBar={{
        productName: 'Mentora',
        tenantName,
        roleLabel: roleLabelFor(session.role),
        userName: session.fullName,
      }}
    >
      {children}
    </AppShell>
  )
}
