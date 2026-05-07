
'use client'

import React, { useState } from 'react'
import { CoachRow, CoachStatus } from '@/lib/db/coaches'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar, 
  UserCheck, 
  UserMinus, 
  Clock,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'

interface CoachesClientProps {
  initialCoaches: CoachRow[]
  isAdmin: boolean
  basePath?: string
}

export function CoachesClient({ initialCoaches, isAdmin, basePath = '/admin/coaches' }: CoachesClientProps) {
  const [coaches, setCoaches] = useState(initialCoaches)
  const [search, setSearch] = useState('')

  const filteredCoaches = coaches.filter(c => 
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggleStatus = async (coach: CoachRow) => {
    try {
      const newActive = !coach.is_active
      const res = await fetch(`/api/coaches/${coach.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newActive })
      })

      if (!res.ok) throw new Error('Failed to update status')
      
      setCoaches(prev => prev.map(c => 
        c.id === coach.id ? { ...c, is_active: newActive, status: newActive ? (c.status === 'inactive' ? 'active' : c.status) : 'inactive' } : c
      ))
      
      toast.success(`Coach ${newActive ? 'activated' : 'deactivated'}`)
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  const getStatusColor = (status?: CoachStatus) => {
    switch (status) {
      case 'active': return 'success'
      case 'on_leave': return 'warning'
      case 'inactive': return 'error'
      default: return 'secondary'
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <SectionHeader 
        title="Coach & Staff Management" 
        description="Manage coach qualifications, availability, and leaves across all locations."
        action={
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button variant="secondary" onClick={() => toast.success('Filter coming soon!')}>
              <Filter size={18} style={{ marginRight: '8px' }} />
              Filter
            </Button>
            {isAdmin && (
              <Button variant="primary" onClick={() => toast.success('Add Coach coming soon!')}>
                Add Coach
              </Button>
            )}
          </div>
        }
      />

      <Card style={{ marginTop: '24px', padding: '0' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#888' }} 
            />
            <Input 
              placeholder="Search coaches by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', textAlign: 'left', borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#666' }}>Coach</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#666' }}>Status</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#666' }}>Qualifications</th>
                <th style={{ padding: '16px', fontSize: '13px', fontWeight: 600, color: '#666' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoaches.map((coach) => (
                <tr key={coach.id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '14px'
                      }}>
                        {coach.full_name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px', color: '#111' }}>{coach.full_name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{coach.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <Badge variant={getStatusColor(coach.status)}>
                      {coach.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </Badge>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {coach.qualifications?.length ? coach.qualifications.map(q => (
                        <Badge key={q} variant="secondary" style={{ fontSize: '10px' }}>{q}</Badge>
                      )) : (
                        <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>No qualifications</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Link href={`${basePath}/${coach.id}`}>
                        <Button variant="secondary" size="sm">
                          Manage
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          onClick={() => handleToggleStatus(coach)}
                          style={{ color: coach.is_active ? '#ef4444' : '#10b981' }}
                        >
                          {coach.is_active ? <UserMinus size={16} /> : <UserCheck size={16} />}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCoaches.length === 0 && (
            <div style={{ padding: '48px', textAlign: 'center', color: '#666' }}>
              <div style={{ marginBottom: '12px' }}>
                <Search size={48} style={{ opacity: 0.2, margin: '0 auto' }} />
              </div>
              <div style={{ fontWeight: 600 }}>No coaches found</div>
              <div style={{ fontSize: '14px' }}>Try adjusting your search query</div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
