'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Check } from 'lucide-react'

interface Planet {
  id: string
  name: string
}

interface PlanetAssignModalProps {
  open: boolean
  onClose: () => void
  allPlanets: Planet[]
  selectedPlanetIds: string[]
  onSave: (planetIds: string[]) => Promise<void>
}

export function PlanetAssignModal({ 
  open, 
  onClose, 
  allPlanets, 
  selectedPlanetIds: initialSelected,
  onSave 
}: PlanetAssignModalProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected)
  const [isSaving, setIsSaving] = useState(false)

  const togglePlanet = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(selected)
      onClose()
    } catch (err) {
      // toast handled in parent
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Manage Qualifications">
      <div style={{ marginTop: '16px' }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
          Select the programs (planets) this coach is qualified to teach.
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          {allPlanets.map(planet => (
            <div 
              key={planet.id} 
              onClick={() => togglePlanet(planet.id)}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                padding: '12px', 
                borderRadius: '8px', 
                border: '1px solid #eee',
                cursor: 'pointer',
                background: selected.includes(planet.id) ? '#f5f7ff' : 'white',
                borderColor: selected.includes(planet.id) ? '#6366f1' : '#eee'
              }}
            >
              <div style={{ 
                width: '20px', 
                height: '20px', 
                borderRadius: '4px', 
                border: '2px solid',
                borderColor: selected.includes(planet.id) ? '#6366f1' : '#ddd',
                background: selected.includes(planet.id) ? '#6366f1' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                {selected.includes(planet.id) && <Check size={14} />}
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>{planet.name}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Qualifications'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
