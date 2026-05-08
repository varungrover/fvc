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

  const navItems = session.role === 'franchisor_admin' ? [
    { kind: 'link', id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: '🏠' },
    { kind: 'link', id: 'planets', label: 'Planets', href: '/admin/planets', icon: '🪐' },
    { kind: 'link', id: 'courses', label: 'Courses', href: '/admin/courses', icon: '📚' },
    { kind: 'link', id: 'locations', label: 'Locations', href: '/admin/locations', icon: '📍' },
    { kind: 'link', id: 'schedule', label: 'Batches', href: '/admin/batches', icon: '📅' },
    { kind: 'link', id: 'coaches', label: 'Coaches', href: '/admin/coaches', icon: '👤' },
    { kind: 'link', id: 'customers', label: 'Customers', href: '/admin/customers', icon: '👥' },
    { kind: 'link', id: 'roster', label: 'Roster', href: '/admin/roster', icon: '📋' },
    { kind: 'divider', id: 'd1' },
    { kind: 'link', id: 'payments', label: 'Payments', href: '/admin/payments', icon: '💳' },
    { kind: 'link', id: 'discounts', label: 'Discounts', href: '/admin/discounts', icon: '🏷️' },
    { kind: 'link', id: 'holidays', label: 'Holidays', href: '/admin/holidays', icon: '🗓️' },
    { kind: 'link', id: 'tickets', label: 'Tickets', href: '/admin/tickets', icon: '🎫' },
  ] : navForRole(session.role);

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
