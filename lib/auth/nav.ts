import type { Role } from '@/lib/types'
import type { NavItem } from '@/components/layout/Sidebar'

const CUSTOMER_NAV: NavItem[] = [
  { kind: 'link', id: 'dashboard', label: 'Dashboard', href: '/customer/dashboard', icon: 'Home' },
  { kind: 'link', id: 'members', label: 'My Members', href: '/customer/members', icon: 'Users' },
  { kind: 'link', id: 'enroll', label: 'Enroll', href: '/customer/enroll', icon: 'ClipboardList' },
  { kind: 'link', id: 'lms', label: 'Learning Portal', href: '/customer/lms', icon: 'BookOpen' },
  { kind: 'divider', id: 'd1' },
  { kind: 'link', id: 'payments', label: 'Payments', href: '/customer/payments', icon: 'CreditCard' },
  { kind: 'link', id: 'notifications', label: 'Notifications', href: '/customer/notifications', icon: 'Bell' },
  { kind: 'link', id: 'profile', label: 'Profile', href: '/customer/settings', icon: 'User', position: 'bottom' },
]

const COACH_NAV: NavItem[] = [
  { kind: 'link', id: 'dashboard', label: 'Dashboard', href: '/coach/dashboard', icon: 'Home' },
  { kind: 'link', id: 'sessions', label: 'Sessions', href: '/coach/sessions', icon: 'Calendar' },
  { kind: 'link', id: 'students', label: 'Students', href: '/coach/students', icon: 'Users' },
  { kind: 'link', id: 'achievements', label: 'Achievements', href: '/coach/achievements', icon: 'Trophy' },
  { kind: 'link', id: 'lms', label: 'LMS Authoring', href: '/coach/lms', icon: 'Edit' },
  { kind: 'divider', id: 'd1' },
  { kind: 'link', id: 'availability', label: 'Availability', href: '/coach/availability', icon: 'CalendarDays' },
  { kind: 'link', id: 'leaves', label: 'Leaves', href: '/coach/leaves', icon: 'Palmtree' },
]

const ADMIN_NAV: NavItem[] = [
  { kind: 'link', id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: 'Home' },
  { kind: 'link', id: 'planets', label: 'Planets', href: '/admin/planets', icon: 'Globe' },
  { kind: 'link', id: 'courses', label: 'Courses', href: '/admin/courses', icon: 'Library' },
  { kind: 'link', id: 'locations', label: 'Locations', href: '/admin/locations', icon: 'MapPin' },
  { kind: 'link', id: 'schedule', label: 'Batches', href: '/admin/batches', icon: 'Calendar' },
  { kind: 'link', id: 'coaches', label: 'Coaches', href: '/admin/coaches', icon: 'UserCircle' },
  { kind: 'link', id: 'customers', label: 'Customers', href: '/admin/customers', icon: 'Users' },
  { kind: 'link', id: 'roster', label: 'Roster', href: '/admin/roster', icon: 'ClipboardList' },
  { kind: 'divider', id: 'd1' },
  { kind: 'link', id: 'payments', label: 'Payments', href: '/admin/payments', icon: 'CreditCard' },
  { kind: 'link', id: 'discounts', label: 'Discounts', href: '/admin/discounts', icon: 'Tag' },
  { kind: 'link', id: 'holidays', label: 'Holidays', href: '/admin/holidays', icon: 'CalendarDays' },
  { kind: 'link', id: 'tickets', label: 'Tickets', href: '/admin/tickets', icon: 'Ticket' },
]

const FRANCHISEE_ADMIN_NAV: NavItem[] = [
  { kind: 'link', id: 'dashboard', label: 'Dashboard', href: '/franchisee-admin/dashboard', icon: 'Home' },
  { kind: 'link', id: 'locations', label: 'Locations', href: '/franchisee-admin/locations', icon: 'MapPin' },
  { kind: 'link', id: 'schedule', label: 'Batches', href: '/franchisee-admin/batches', icon: 'Calendar' },
  { kind: 'link', id: 'coaches', label: 'Coaches', href: '/franchisee-admin/coaches', icon: 'UserCircle' },
  { kind: 'link', id: 'customers', label: 'Customers', href: '/franchisee-admin/customers', icon: 'Users' },
  { kind: 'link', id: 'roster', label: 'Roster', href: '/franchisee-admin/roster', icon: 'ClipboardList' },
  { kind: 'divider', id: 'd1' },
  { kind: 'link', id: 'holidays', label: 'Holidays', href: '/franchisee-admin/holidays', icon: 'CalendarDays' },
  { kind: 'link', id: 'price-requests', label: 'Price Requests', href: '/franchisee-admin/price-requests', icon: 'Banknote' },
  { kind: 'link', id: 'tickets', label: 'Tickets', href: '/franchisee-admin/tickets', icon: 'Ticket' },
]

const MANAGEMENT_NAV: NavItem[] = [
  { kind: 'link', id: 'dashboard', label: 'Dashboard', href: '/management/dashboard', icon: 'Home' },
  { kind: 'link', id: 'revenue', label: 'Revenue', href: '/management/revenue', icon: 'TrendingUp' },
  { kind: 'link', id: 'pricing', label: 'Pricing', href: '/management/pricing', icon: 'Banknote' },
  { kind: 'link', id: 'locations', label: 'Locations', href: '/management/locations', icon: 'MapPin' },
  { kind: 'link', id: 'reports', label: 'Reports', href: '/management/reports', icon: 'PieChart' },
]

export function navForRole(role: Role): NavItem[] {
  switch (role) {
    case 'customer':              return CUSTOMER_NAV
    case 'coach':                 return COACH_NAV
    case 'franchisor_admin':      return ADMIN_NAV
    case 'franchisee_admin':      return FRANCHISEE_ADMIN_NAV
    case 'franchisor_mgmt':
    case 'franchisee_mgmt': return MANAGEMENT_NAV
  }
}

export function roleLabelFor(role: Role): string {
  switch (role) {
    case 'customer':              return 'Customer'
    case 'coach':                 return 'Coach'
    case 'franchisor_admin':      return 'Franchisor Admin'
    case 'franchisee_admin':      return 'Franchisee Admin'
    case 'franchisor_mgmt': return 'Management'
    case 'franchisee_mgmt': return 'Management'
  }
}
