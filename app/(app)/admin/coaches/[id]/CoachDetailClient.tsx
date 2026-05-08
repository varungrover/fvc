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
  Trash2, 
  Check, 
  X,
  ArrowLeft,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { PlanetAssignModal } from '../PlanetAssignModal'
import { TLP } from '@/lib/theme/tokens'

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
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

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
      const res = await fetch(`/api/coaches/${coach.id}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availability.map(({ id, profile_id, ...rest }) => rest))
      })
      if (!res.ok) throw new Error('Failed to update availability')
      toast.success('Availability updated successfully')
    } catch (err) {
      toast.error('Failed to update availability')
    } finally {
      setIsSaving(false)
    }
  }

  const handleApproveLeave = async (leave: StaffLeave) => {
    try {
      const res = await fetch(`/api/leaves/${leave.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' })
      })
      if (!res.ok) throw new Error('Failed to update leave')
      setLeaves(leaves.map(l => l.id === leave.id ? { ...l, status: 'approved' } : l))
      toast.success('Leave approved')
    } catch (err) {
      toast.error('Failed to update leave')
    }
  }

  const handleRejectLeave = async (leave: StaffLeave) => {
    try {
      const res = await fetch(`/api/leaves/${leave.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      })
      if (!res.ok) throw new Error('Failed to update leave')
      setLeaves(leaves.map(l => l.id === leave.id ? { ...l, status: 'rejected' } : l))
      toast.success('Leave rejected')
    } catch (err) {
      toast.error('Failed to update leave')
    }
  }

  const handleSaveQualifications = async (planetIds: string[]) => {
    try {
      const res = await fetch(`/api/coaches/${coach.id}/qualifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planetIds })
      })
      if (!res.ok) throw new Error('Failed to update qualifications')
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
        <Link href={backPath} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: TLP.blue, fontSize: '14px', textDecoration: 'none', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          Back to Coaches
        </Link>
      </div>

      <SectionHeader 
        title={coach.full_name}
        subtitle={coach.email}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Badge 
              label={coach.status?.toUpperCase() || 'UNKNOWN'}
              color={coach.status === 'active' ? TLP.teal : coach.status === 'on_leave' ? TLP.amber : TLP.red}
              bg={coach.status === 'active' ? TLP.tealLight : coach.status === 'on_leave' ? TLP.amberLight : TLP.redLight}
            />
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

      <Card style={{ marginTop: '16px', padding: '24px' }}>
        {activeTab === 'availability' ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: TLP.navy }}>Weekly Availability</h3>
              <Button variant="secondary" size="sm" onClick={handleAddAvailability}>
                <Plus size={16} style={{ marginRight: '8px' }} />
                Add Slot
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {availability.map((slot, index) => (
                <div key={slot.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', padding: '16px', background: TLP.bg, border: `1px solid ${TLP.gray100}`, borderRadius: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: TLP.gray400, marginBottom: '6px', letterSpacing: '0.05em' }}>DAY</label>
                    <select 
                      value={slot.day_of_week}
                      onChange={(e) => handleUpdateAvailability(index, { day_of_week: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1.5px solid ${TLP.gray100}`, fontSize: '14px', outline: 'none' }}
                    >
                      {days.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: TLP.gray400, marginBottom: '6px', letterSpacing: '0.05em' }}>START TIME</label>
                    <input 
                      type="time" 
                      value={slot.start_time}
                      onChange={(e) => handleUpdateAvailability(index, { start_time: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1.5px solid ${TLP.gray100}`, fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: TLP.gray400, marginBottom: '6px', letterSpacing: '0.05em' }}>END TIME</label>
                    <input 
                      type="time" 
                      value={slot.end_time}
                      onChange={(e) => handleUpdateAvailability(index, { end_time: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: `1.5px solid ${TLP.gray100}`, fontSize: '14px', outline: 'none' }}
                    />
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleRemoveAvailability(index)} style={{ color: '#ef4444', height: '42px', padding: '0 12px' }}>
                    <Trash2 size={18} />
                  </Button>
                </div>
              ))}
              {availability.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: TLP.gray400, background: TLP.bg, borderRadius: '12px' }}>
                  <Calendar size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                  <p>No availability slots defined.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: TLP.navy }}>Leave History</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaves.map((leave) => (
                <div key={leave.id} style={{ padding: '16px 20px', border: `1px solid ${TLP.gray100}`, borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: TLP.bg }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: TLP.navy }}>
                      {!isMounted ? '...' : `${new Date(leave.start_date).toLocaleDateString()} - ${new Date(leave.end_date).toLocaleDateString()}`}
                    </div>
                    <div style={{ fontSize: '13px', color: TLP.gray500, marginTop: '4px' }}>{leave.reason || 'No reason provided'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <Badge 
                      label={leave.status.toUpperCase()}
                      color={leave.status === 'approved' ? TLP.teal : leave.status === 'rejected' ? TLP.red : TLP.gray500}
                      bg={leave.status === 'approved' ? TLP.tealLight : leave.status === 'rejected' ? TLP.redLight : TLP.gray100}
                    />
                    {isAdmin && leave.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleApproveLeave(leave)} style={{ color: '#10b981', border: '1px solid #10b981' }}>
                          <Check size={18} />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleRejectLeave(leave)} style={{ color: '#ef4444', border: '1px solid #ef4444' }}>
                          <X size={18} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {leaves.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px', color: TLP.gray400, background: TLP.bg, borderRadius: '12px' }}>
                  <Calendar size={40} style={{ opacity: 0.2, margin: '0 auto 12px' }} />
                  <p>No leave history found.</p>
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
