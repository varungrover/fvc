import { describe, it, expect } from 'vitest'
import {
  getAllowedPrefixForRole,
  getLandingForRole,
  isPublicPath,
  getRoleFromPath,
} from './routing'

describe('getAllowedPrefixForRole', () => {
  it('maps franchisor_admin to /admin', () => {
    expect(getAllowedPrefixForRole('franchisor_admin')).toBe('/admin')
  })
  it('maps franchisor_mgmt to /management', () => {
    expect(getAllowedPrefixForRole('franchisor_mgmt')).toBe('/management')
  })
  it('maps franchisee_admin to /franchisee-admin', () => {
    expect(getAllowedPrefixForRole('franchisee_admin')).toBe('/franchisee-admin')
  })
  it('maps franchisee_mgmt to /management', () => {
    expect(getAllowedPrefixForRole('franchisee_mgmt')).toBe('/management')
  })
  it('maps coach to /coach', () => {
    expect(getAllowedPrefixForRole('coach')).toBe('/coach')
  })
  it('maps customer to /customer', () => {
    expect(getAllowedPrefixForRole('customer')).toBe('/customer')
  })
})

describe('getLandingForRole', () => {
  it('returns /admin/dashboard for franchisor_admin', () => {
    expect(getLandingForRole('franchisor_admin')).toBe('/admin/dashboard')
  })
  it('returns /management/dashboard for franchisor_mgmt', () => {
    expect(getLandingForRole('franchisor_mgmt')).toBe('/management/dashboard')
  })
  it('returns /franchisee-admin/dashboard for franchisee_admin', () => {
    expect(getLandingForRole('franchisee_admin')).toBe('/franchisee-admin/dashboard')
  })
  it('returns /management/dashboard for franchisee_mgmt', () => {
    expect(getLandingForRole('franchisee_mgmt')).toBe('/management/dashboard')
  })
  it('returns /coach/dashboard for coach', () => {
    expect(getLandingForRole('coach')).toBe('/coach/dashboard')
  })
  it('returns /customer/dashboard for customer', () => {
    expect(getLandingForRole('customer')).toBe('/customer/dashboard')
  })
})

describe('isPublicPath', () => {
  it('allows /', () => expect(isPublicPath('/')).toBe(true))
  it('allows /login', () => expect(isPublicPath('/login')).toBe(true))
  it('allows /t/learning-planet', () => expect(isPublicPath('/t/learning-planet')).toBe(true))
  it('allows /api/auth/login', () => expect(isPublicPath('/api/auth/login')).toBe(true))
  it('blocks /admin/dashboard', () => expect(isPublicPath('/admin/dashboard')).toBe(false))
  it('blocks /customer/dashboard', () => expect(isPublicPath('/customer/dashboard')).toBe(false))
  it('blocks /api/auth/me', () => expect(isPublicPath('/api/auth/me')).toBe(false))
})

describe('getRoleFromPath', () => {
  it('returns franchisor_admin for /admin/anything', () => {
    expect(getRoleFromPath('/admin/dashboard')).toBe('franchisor_admin')
  })
  it('returns coach for /coach/students', () => {
    expect(getRoleFromPath('/coach/students')).toBe('coach')
  })
  it('returns null for unknown prefix', () => {
    expect(getRoleFromPath('/unknown')).toBeNull()
  })
})
