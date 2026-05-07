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
  Trash2,
  Info
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { TLP } from '@/lib/theme/tokens'

interface CoachLeavesClientProps {
  initialLeaves: StaffLeave[]
  profileId: string
}

export function CoachLeavesClient({ initialLeaves, profileId }: CoachLeavesClientProps) {
  const [leaves, setLeaves] = useState(initialLeaves)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedLeave, setSelectedLeave] = useState<StaffLeave | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  
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
      const res = await fetch(`/api/coaches/${profileId}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLeave)
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to submit leave request')
      }

      toast.success('Leave request submitted!')
      setIsModalOpen(false)
      // Refresh list
      const updatedRes = await fetch(`/api/coaches/${profileId}/leaves`)
      if (updatedRes.ok) {
        const updatedLeaves = await updatedRes.json()
        setLeaves(updatedLeaves)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit leave request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelLeave = async (leaveId: string) => {
    if (!confirm('Are you sure you want to cancel this leave request?')) return

    setIsCancelling(true)
    try {
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to cancel leave')
      }

      setLeaves(leaves.filter(l => l.id !== leaveId))
      toast.success('Leave request cancelled')
      setIsDetailModalOpen(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to cancel leave')
    } finally {
      setIsCancelling(false)
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
          <Card 
            key={leave.id} 
            hover
            onClick={() => {
              setSelectedLeave(leave)
              setIsDetailModalOpen(true)
            }}
            style={{ padding: '16px 20px', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ 
                  width: '44px', 
                  height: '44px', 
                  borderRadius: '12px', 
                  background: leave.status === 'approved' ? '#f0fdf4' : '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: leave.status === 'approved' ? '#16a34a' : '#ea580c'
                }}>
                  <Calendar size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: TLP.navy }}>
                    {new Date(leave.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(leave.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '13px', color: TLP.gray500, marginTop: '2px' }}>
                    {leave.reason || 'Personal Leave'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Badge variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'secondary'}>
                  {leave.status.toUpperCase()}
                </Badge>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  style={{ color: TLP.gray400 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedLeave(leave)
                    setIsDetailModalOpen(true)
                  }}
                >
                  <Info size={18} />
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {leaves.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 40px', background: TLP.bg, borderRadius: '16px' }}>
            <Calendar size={48} style={{ opacity: 0.2, margin: '0 auto 16px', color: TLP.navy }} />
            <h3 style={{ fontWeight: 700, color: TLP.navy, marginBottom: '8px' }}>No Leaves Found</h3>
            <p style={{ color: TLP.gray500, fontSize: '14px', maxWidth: '300px', margin: '0 auto' }}>You haven't requested any leaves yet. Click the button above to submit a request.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Leave Details"
      >
        {selectedLeave && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: TLP.bg, borderRadius: '12px' }}>
               <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: selectedLeave.status === 'approved' ? '#f0fdf4' : '#fff7ed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: selectedLeave.status === 'approved' ? '#16a34a' : '#ea580c'
              }}>
                <Calendar size={24} />
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 800, color: TLP.gray400, letterSpacing: '0.05em' }}>DATE RANGE</div>
                <div style={{ fontWeight: 700, fontSize: '16px', color: TLP.navy }}>
                   {new Date(selectedLeave.start_date).toLocaleDateString()} - {new Date(selectedLeave.end_date).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: TLP.gray400, letterSpacing: '0.05em', marginBottom: '8px' }}>STATUS</div>
              <Badge variant={selectedLeave.status === 'approved' ? 'success' : selectedLeave.status === 'rejected' ? 'error' : 'secondary'} style={{ padding: '6px 12px', fontSize: '12px' }}>
                {selectedLeave.status.toUpperCase()}
              </Badge>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: 800, color: TLP.gray400, letterSpacing: '0.05em', marginBottom: '8px' }}>REASON</div>
              <div style={{ padding: '16px', background: '#fff', border: `1px solid ${TLP.gray100}`, borderRadius: '12px', fontSize: '14px', color: TLP.navy, lineHeight: 1.5 }}>
                {selectedLeave.reason || 'No reason provided.'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px', borderTop: `1px solid ${TLP.gray100}`, paddingTop: '20px' }}>
              <Button variant="secondary" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
              <Button 
                variant="secondary" 
                onClick={() => handleCancelLeave(selectedLeave.id)}
                disabled={isCancelling}
                style={{ color: '#ef4444', background: '#fef2f2' }}
              >
                {isCancelling ? 'Processing...' : (
                  <>
                    <Trash2 size={16} style={{ marginRight: '8px' }} />
                    Cancel Leave
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Request Modal */}
      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Request Leave"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: TLP.gray400, marginBottom: '8px', letterSpacing: '0.05em' }}>START DATE</label>
              <Input 
                type="date" 
                value={newLeave.start_date}
                onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: TLP.gray400, marginBottom: '8px', letterSpacing: '0.05em' }}>END DATE</label>
              <Input 
                type="date" 
                value={newLeave.end_date}
                onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
                required
              />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: TLP.gray400, marginBottom: '8px', letterSpacing: '0.05em' }}>REASON</label>
            <textarea 
              value={newLeave.reason}
              onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '12px', 
                border: `1.5px solid ${TLP.gray100}`, 
                fontSize: '14px',
                minHeight: '120px',
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'vertical'
              }}
              placeholder="e.g. Attending a chess tournament, Family event..."
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
