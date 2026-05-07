'use client'

import React, { useState } from 'react'
import { StaffAvailability } from '@/lib/db/coaches'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Clock, 
  Plus, 
  Trash2,
  Save
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { updateCoachAvailabilityAction } from '@/app/actions/coaches'

interface CoachAvailabilityClientProps {
  initialAvailability: StaffAvailability[]
  profileId: string
}

export function CoachAvailabilityClient({ initialAvailability, profileId }: CoachAvailabilityClientProps) {
  const [availability, setAvailability] = useState(initialAvailability)
  const [isSaving, setIsSaving] = useState(false)

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  const handleAddAvailability = () => {
    setAvailability([...availability, { 
      id: Math.random().toString(), 
      profile_id: profileId, 
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
      await updateCoachAvailabilityAction(profileId, availability.map(({ id, profile_id, ...rest }) => rest))
      toast.success('Availability saved!')
    } catch (err) {
      toast.error('Failed to save availability')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <SectionHeader 
        title="My Availability" 
        subtitle="Manage your weekly recurring schedule. Changes here will affect your session assignments."
        action={
          <Button variant="primary" onClick={saveAvailability} disabled={isSaving}>
            {isSaving ? 'Saving...' : (
              <>
                <Save size={18} style={{ marginRight: '8px' }} />
                Save Schedule
              </>
            )}
          </Button>
        }
      />

      <Card style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Weekly Slots</h3>
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
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>START</label>
                <input 
                  type="time" 
                  value={slot.start_time}
                  onChange={(e) => handleUpdateAvailability(index, { start_time: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#666', marginBottom: '4px' }}>END</label>
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
            <div style={{ textAlign: 'center', padding: '60px', color: '#666' }}>
              <Clock size={40} style={{ opacity: 0.1, margin: '0 auto 12px' }} />
              <p>You haven't added any availability slots yet.</p>
              <Button variant="secondary" size="sm" onClick={handleAddAvailability} style={{ marginTop: '12px' }}>
                Add your first slot
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
