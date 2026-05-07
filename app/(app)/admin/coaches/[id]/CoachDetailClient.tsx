'use client'

import React, { useState } from 'react'
import { CoachRow, StaffAvailability, StaffLeave } from '@/lib/db/coaches'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Tabs } from '@/components/ui/Tabs'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Mail, 
  Plus, 
  Trash2, 
  Check, 
  X,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { 
  updateCoachAvailabilityAction, 
  createCoachLeaveAction,
  updateCoachLeaveStatusAction,
  updateCoachQualificationsAction
} from '@/app/actions/coaches'
import { PlanetAssignModal } from '../PlanetAssignModal'

interface CoachDetailClientProps {
  coach: CoachRow
  initialAvailability: StaffAvailability[]
  initialLeaves: StaffLeave[]
  allPlanets: { id: string; name: string }[]
  isAdmin: boolean
  backPath?: string
}

export function CoachDetailClient({ coach, initialAvailability, initialLeaves, allPlanets, isAdmin, backPath = '/admin/coaches' }: CoachDetailClientProps) {
  const [activeTab, setActiveTab] = useState('availability')
  const [availability, setAvailability] = useState(initialAvailability)
  const [leaves, setLeaves] = useState(initialLeaves)
  const [isSaving, setIsSaving] = useState(false)
  const [isPlanetModalOpen, setIsPlanetModalOpen] = useState(false)
  const [currentPlanetIds, setCurrentPlanetIds] = useState(coach.planet_ids || [])

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const handleAddAvailability = () => {
    setAvailability([...availability, { 
      id: Math.random().toString(), 
      profile_id: coach.id, 
      day_of_week: 'Monday', 
      start_time: '16:00:00', 
      end_time: '21:00:00', 
      is_active: true 
    }])
  }

  const handleRemoveAvailability = (index: number) => {
    setAvailability(availability.filter((_, i) => i !== index))
  }

  const handleUpdateAvailability = (index: number, patch: Partial<StaffAvailability>) => {
    setAvailability(availability.map((a, i) => i === index ? { ...a, ...patch } : a))
  }

  const saveAvailability = async () => {
    setIsSaving(true)
    try {
      await updateCoachAvailabilityAction(coach.id, availability.map(({ id, profile_id, ...rest }) => rest))
      toast.success('Availability updated successfully')
    } catch (err) {
      toast.error('Failed to update availability')
    } finally {
      setIsSaving(false)
    }
  }

  const handleApproveLeave = async (leave: StaffLeave) => {
    try {
      await updateCoachLeaveStatusAction(leave.id, 'approved', coach.id)
      setLeaves(leaves.map(l => l.id === leave.id ? { ...l, status: 'approved' } : l))
      toast.success('Leave approved')
    } catch (err) {
      toast.error('Failed to update leave')
    }
  }

  const handleRejectLeave = async (leave: StaffLeave) => {
    try {
      await updateCoachLeaveStatusAction(leave.id, 'rejected', coach.id)
      setLeaves(leaves.map(l => l.id === leave.id ? { ...l, status: 'rejected' } : l))
      toast.success('Leave rejected')
    } catch (err) {
      toast.error('Failed to update leave')
    }
  }

  const handleSaveQualifications = async (planetIds: string[]) => {
    try {
      await updateCoachQualificationsAction(coach.id, planetIds)
      setCurrentPlanetIds(planetIds)
      toast.success('Qualifications updated')
    } catch (err) {
      toast.error('Failed to update qualifications')
      throw err
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <Link href={backPath} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1', fontSize: '14px', textDecoration: 'none' }}>
          <ArrowLeft size={16} />
          Back to Coaches
        </Link>
      </div>

      <SectionHeader 
        title={coach.full_name}
        subtitle={coach.email}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Badge variant={coach.status === 'active' ? 'success' : coach.status === 'on_leave' ? 'warning' : 'error'}>
              {coach.status?.toUpperCase()}
            </Badge>
            {isAdmin && (
              <>
                <Button variant="secondary" onClick={() => setIsPlanetModalOpen(true)}>
                  Manage Qualifications
                </Button>
                <Button variant="primary" onClick={saveAvailability} disabled={isSaving || activeTab !== 'availability'}>
                  {isSaving ? 'Saving...' : 'Save Availability'}
                </Button>
              </>
            )}
          </div>
        }
      />

      <div style={{ marginTop: '24px' }}>
        <Tabs 
          active={activeTab} 
          onChange={setActiveTab}
          tabs={[
            { id: 'availability', label: 'Availability' },
            { id: 'leaves', label: 'Leaves' }
          ]}
        />
      </div>

      <Card style={{ marginTop: '16px' }}>
        {activeTab === 'availability' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Recurring Weekly Availability</h3>
              <Button variant="secondary" size="sm" onClick={handleAddAvailability}>
                <Plus size={16} style={{ marginRight: '8px' }} />
                Add Slot
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {availability.map((slot, index) => (
                <div key={slot.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', border: '1px solid #eee', borderRadius: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>DAY</label>
                    <select 
                      value={slot.day_of_week}
                      onChange={(e) => handleUpdateAvailability(index, { day_of_week: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                    >
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>START TIME</label>
                    <input 
                      type="time" 
                      value={slot.start_time}
                      onChange={(e) => handleUpdateAvailability(index, { start_time: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>END TIME</label>
                    <input 
                      type="time" 
                      value={slot.end_time}
                      onChange={(e) => handleUpdateAvailability(index, { end_time: e.target.value })}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                    />
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleRemoveAvailability(index)} style={{ marginTop: '18px', color: '#ef4444' }}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              {availability.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '14px' }}>
                  No availability slots defined.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Leave Requests</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaves.map((leave) => (
                <div key={leave.id} style={{ padding: '16px', border: '1px solid #eee', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>
                      {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{leave.reason || 'No reason provided'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Badge variant={leave.status === 'approved' ? 'success' : leave.status === 'rejected' ? 'error' : 'secondary'}>
                      {leave.status.toUpperCase()}
                    </Badge>
                    {isAdmin && leave.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleApproveLeave(leave)} style={{ color: '#10b981' }}>
                          <Check size={16} />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleRejectLeave(leave)} style={{ color: '#ef4444' }}>
                          <X size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {leaves.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666', fontSize: '14px' }}>
                  No leave history.
                </div>
              )}
            </div>
          </div>
        )}
      </Card>

      <PlanetAssignModal 
        open={isPlanetModalOpen}
        onClose={() => setIsPlanetModalOpen(false)}
        allPlanets={allPlanets}
        selectedPlanetIds={currentPlanetIds}
        onSave={handleSaveQualifications}
      />
    </div>
  )
}
