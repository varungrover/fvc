'use client'

import React, { useState } from 'react'
import { StaffLeave } from '@/lib/db/coaches'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { 
  Calendar, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createCoachLeaveAction } from '@/app/actions/coaches'

interface CoachLeavesClientProps {
  initialLeaves: StaffLeave[]
  profileId: string
}

export function CoachLeavesClient({ initialLeaves, profileId }: CoachLeavesClientProps) {
  const [leaves, setLeaves] = useState(initialLeaves)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [newLeave, setNewLeave] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLeave.start_date || !newLeave.end_date) {
      toast.error('Please select dates')
      return
    }

    if (new Date(newLeave.start_date) > new Date(newLeave.end_date)) {
      toast.error('Start date cannot be after end date')
      return
    }

    setIsSubmitting(true)
    try {
      await createCoachLeaveAction(profileId, newLeave)
      // Since it's auto-approved in the action for now, or if we want to show it as pending
      // we'd fetch or just update state. For simplicity, we'll just reload or add to state.
      setLeaves([{ 
        id: Math.random().toString(), 
        profile_id: profileId, 
        ...newLeave, 
        status: 'approved' 
      }, ...leaves])
      
      toast.success('Leave request submitted!')
      setIsModalOpen(false)
      setNewLeave({ start_date: '', end_date: '', reason: '' })
    } catch (err) {
      toast.error('Failed to submit leave request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <SectionHeader 
        title="My Leaves" 
        subtitle="Request time off and track your leave history."
        action={
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Request Leave
          </Button>
        }
      />

      <div style={{ marginTop: '24px', display: 'grid', gap: '16px' }}>
        {leaves.map((leave) => (
          <Card key={leave.id} style={{ padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  background: leave.status === 'approved' ? '#f0fdf4' : '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: leave.status === 'approved' ? '#16a34a' : '#ea580c'
                }}>
                  <Calendar size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '15px' }}>
                    {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                    {leave.reason || 'Personal Leave'}
                  </div>
                </div>
              </div>
              <Badge variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'secondary'}>
                {leave.status.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}

        {leaves.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
            <Calendar size={40} style={{ opacity: 0.1, margin: '0 auto 12px' }} />
            <p>You haven't requested any leaves yet.</p>
          </div>
        )}
      </div>

      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Request Leave"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '6px' }}>START DATE</label>
              <Input 
                type="date" 
                value={newLeave.start_date}
                onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '6px' }}>END DATE</label>
              <Input 
                type="date" 
                value={newLeave.end_date}
                onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '6px' }}>REASON (OPTIONAL)</label>
            <textarea 
              value={newLeave.reason}
              onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid #ddd', 
                fontSize: '14px',
                minHeight: '100px',
                fontFamily: 'inherit'
              }}
              placeholder="Briefly describe the reason for your leave..."
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
