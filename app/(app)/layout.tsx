import { redirect } from 'next/navigation'
import { type ReactNode } from 'react'
import { getSession } from '@/lib/auth/session'
import { AppShell } from '@/components/layout/AppShell'
import { navForRole, roleLabelFor } from '@/lib/auth/nav'
import { TENANT_BY_ID } from '@/lib/mock/tenants'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const tenantName = session.ownershipId
    ? (TENANT_BY_ID[session.ownershipId]?.fullName ?? undefined)
    : undefined

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
