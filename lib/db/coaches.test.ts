import { describe, it, expect, vi } from 'vitest'
import { listCoaches } from './coaches'

describe('coaches DAL', () => {
  it('computes coach status correctly', async () => {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            full_name: 'Active Coach',
            is_active: true,
            staff_leaves: []
          },
          {
            id: '2',
            full_name: 'On Leave Coach',
            is_active: true,
            staff_leaves: [
              { start_date: yesterday, end_date: tomorrow, status: 'approved' }
            ]
          },
          {
            id: '3',
            full_name: 'Inactive Coach',
            is_active: false,
            staff_leaves: []
          },
          {
            id: '4',
            full_name: 'Pending Leave Coach (Active)',
            is_active: true,
            staff_leaves: [
              { start_date: yesterday, end_date: tomorrow, status: 'pending' }
            ]
          }
        ],
        error: null
      })
    } as any

    const session = { role: 'franchisor_admin', userId: 'admin', ownershipId: 'corp' } as any
    const coaches = await listCoaches(mockSupabase, session)

    expect(coaches.find(c => c.id === '1')?.status).toBe('active')
    expect(coaches.find(c => c.id === '2')?.status).toBe('on_leave')
    expect(coaches.find(c => c.id === '3')?.status).toBe('inactive')
    expect(coaches.find(c => c.id === '4')?.status).toBe('active') // Pending leave doesn't count
  })
})
