import type { Role } from '@/lib/types'

const ROLE_PREFIX: Record<Role, string> = {
  franchisor_admin:      '/admin',
  franchisor_mgmt:       '/management',
  franchisee_admin:      '/franchisee-admin',
  franchisee_mgmt:       '/management',
  coach:                 '/coach',
  customer:              '/customer',
}

const ROLE_LANDING: Record<Role, string> = {
  franchisor_admin:      '/admin/dashboard',
  franchisor_mgmt:       '/management/dashboard',
  franchisee_admin:      '/franchisee-admin/dashboard',
  franchisee_mgmt:       '/management/dashboard',
  coach:                 '/coach/dashboard',
  customer:              '/customer/dashboard',
}

const PUBLIC_PATHS = ['/', '/login']
const PUBLIC_PREFIXES = ['/t/', '/api/auth/login', '/api/public/', '/api/webhooks/']

// Single-segment paths like /langley, /surrey are public location storefronts.
// We identify them by checking they don't start with any known role prefix.
const ROLE_PREFIXES_LIST = Object.values(ROLE_PREFIX)


export function getAllowedPrefixForRole(role: Role): string {
  return ROLE_PREFIX[role]
}

export function getLandingForRole(role: Role): string {
  return ROLE_LANDING[role]
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) return true

  // Single-segment paths like /langley or two-segment /langley/courses are public storefronts
  const segments = pathname.split('/').filter(Boolean)
  if (!ROLE_PREFIXES_LIST.some(p => pathname.startsWith(p))) {
    if (segments.length === 1) return true
    if (segments[1] === 'courses') return true
  }

  return false
}

export function getRoleFromPath(pathname: string): Role | null {
  for (const [role, prefix] of Object.entries(ROLE_PREFIX) as [Role, string][]) {
    if (pathname.startsWith(prefix)) return role
  }
  return null
}
