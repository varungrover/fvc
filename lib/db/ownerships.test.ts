import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listOwnerships, getOwnership } from './ownerships'
import type { SessionUser } from '@/lib/auth/types'

const FA_SESSION: SessionUser = {
  id: 'user-1',
  email: 'fa@demo.com',
  role: 'franchisor_admin',
  ownershipId: 'own-tlp',
  fullName: 'FA User',
  mustChangePassword: false,
}

const XA_SESSION: SessionUser = {
  id: 'user-2',
  email: 'xa@demo.com',
  role: 'franchisee_admin',
  ownershipId: 'own-mla',
  fullName: 'XA User',
  mustChangePassword: false,
}

function makeMockSupabase(rows: unknown[]) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: rows[0] ?? null, error: null }),
    then: undefined as unknown,
  }
  // make the chain thenable so await works
  chain.then = (resolve: (v: { data: unknown[]; error: null }) => void) =>
    resolve({ data: rows, error: null })

  return {
    from: vi.fn().mockReturnValue(chain),
    _chain: chain,
  }
}

describe('listOwnerships', () => {
  it('franchisor_admin: queries without ownership filter', async () => {
    const supabase = makeMockSupabase([{ id: 'own-tlp' }, { id: 'own-mla' }])
    const result = await listOwnerships(supabase as never, FA_SESSION)
    expect(supabase.from).toHaveBeenCalledWith('ownerships')
    // eq() should NOT have been called (no scoping filter for FA)
    expect(supabase._chain.eq).not.toHaveBeenCalled()
    expect(result).toHaveLength(2)
  })

  it('franchisee_admin: queries with own ownership_id filter', async () => {
    const supabase = makeMockSupabase([{ id: 'own-mla' }])
    const result = await listOwnerships(supabase as never, XA_SESSION)
    expect(supabase._chain.eq).toHaveBeenCalledWith('id', 'own-mla')
    expect(result).toHaveLength(1)
  })
})

describe('getOwnership', () => {
  it('franchisor_admin: can fetch any ownership by id', async () => {
    const supabase = makeMockSupabase([{ id: 'own-mla', full_name: 'MLA' }])
    const result = await getOwnership(supabase as never, 'own-mla', FA_SESSION)
    expect(result).not.toBeNull()
    expect(result?.id).toBe('own-mla')
  })

  it('franchisee_admin: returns null for ownership they do not belong to', async () => {
    const supabase = makeMockSupabase([{ id: 'own-tlp', full_name: 'TLP' }])
    const result = await getOwnership(supabase as never, 'own-tlp', XA_SESSION)
    expect(result).toBeNull()
  })

  it('franchisee_admin: can fetch their own ownership', async () => {
    const supabase = makeMockSupabase([{ id: 'own-mla', full_name: 'MLA' }])
    const result = await getOwnership(supabase as never, 'own-mla', XA_SESSION)
    expect(result?.id).toBe('own-mla')
  })
})
