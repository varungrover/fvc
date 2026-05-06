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
const PUBLIC_PREFIXES = ['/t/', '/api/auth/login', '/api/public/']

export function getAllowedPrefixForRole(role: Role): string {
  return ROLE_PREFIX[role]
}

export function getLandingForRole(role: Role): string {
  return ROLE_LANDING[role]
}

export function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export function getRoleFromPath(pathname: string): Role | null {
  for (const [role, prefix] of Object.entries(ROLE_PREFIX) as [Role, string][]) {
    if (pathname.startsWith(prefix)) return role
  }
  return null
}
