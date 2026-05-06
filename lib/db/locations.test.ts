import { describe, it, expect, vi } from 'vitest'
import {
  listLocations,
  getLocation,
} from './locations'
import type { SessionUser } from '@/lib/auth/types'

const FA: SessionUser = {
  id: 'u1',
  email: 'fa@test.com',
  role: 'franchisor_admin',
  fullName: 'FA User',
  ownershipId: 'own_tlp',
  mustChangePassword: false,
}

const XA: SessionUser = {
  id: 'u2',
  email: 'xa@test.com',
  role: 'franchisee_admin',
  fullName: 'XA User',
  ownershipId: 'own_mla',
  mustChangePassword: false,
}

function makeMockSupabase(rows: unknown[], singleRow?: unknown) {
  const resolvedSingle = singleRow ?? rows[0] ?? null
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: resolvedSingle, error: null }),
    then: undefined as unknown,
  }
  // make the chain thenable so await works (mirrors ownerships.test.ts pattern)
  chain.then = (resolve: (v: { data: unknown[]; error: null }) => void) =>
    resolve({ data: rows, error: null })

  return {
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  }
}

describe('listLocations', () => {
  it('adds no eq filter for franchisor_admin', async () => {
    const supabase = makeMockSupabase([])
    await listLocations(supabase as never, FA)
    expect(supabase.from).toHaveBeenCalledWith('locations')
    expect(supabase._chain.eq).not.toHaveBeenCalledWith('ownership_id', expect.anything())
  })

  it('scopes to ownership_id for franchisee_admin', async () => {
    const supabase = makeMockSupabase([])
    await listLocations(supabase as never, XA)
    expect(supabase._chain.eq).toHaveBeenCalledWith('ownership_id', 'own_mla')
  })
})

describe('getLocation', () => {
  it('returns null for scoped role accessing other ownership location', async () => {
    const fakeLocation = { id: 'loc1', ownership_id: 'own_tlp' }
    const supabase = makeMockSupabase([], fakeLocation)
    const result = await getLocation(supabase as never, 'loc1', XA)
    expect(result).toBeNull()
  })

  it('returns location for franchisor_admin regardless of ownership', async () => {
    const fakeLocation = { id: 'loc1', ownership_id: 'own_tlp' }
    const supabase = makeMockSupabase([], fakeLocation)
    const result = await getLocation(supabase as never, 'loc1', FA)
    expect(result).toEqual(fakeLocation)
  })

  it('returns location for franchisee_admin when ownership matches', async () => {
    const fakeLocation = { id: 'loc2', ownership_id: 'own_mla' }
    const supabase = makeMockSupabase([], fakeLocation)
    const result = await getLocation(supabase as never, 'loc2', XA)
    expect(result).toEqual(fakeLocation)
  })
})
