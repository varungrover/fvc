'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/layout/PageHeader'
import { TLP } from '@/lib/theme/tokens'
import type { LocationRow } from '@/lib/db/locations'

interface Props {
  locations: LocationRow[]
  ownershipName: string
  ownershipId: string
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: TLP.navy }}>{value}</div>
      <div style={{ fontSize: 11, color: TLP.gray500, fontWeight: 600 }}>{label}</div>
    </div>
  )
}

export function LocationsClient({ locations, ownershipName, ownershipId }: Props) {
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [addForm, setAddForm] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: 'Canada',
  })
  const [saving, setSaving] = useState(false)
  const [localLocations, setLocalLocations] = useState<LocationRow[]>(locations)

  const activeCount = localLocations.filter((l) => l.is_active).length

  const filtered = localLocations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.city.toLowerCase().includes(search.toLowerCase()),
  )

  function resetForm() {
    setAddForm({
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: 'Canada',
    })
  }

  async function handleAddLocation() {
    if (!addForm.name || !addForm.addressLine1 || !addForm.city || !addForm.stateProvince) return
    setSaving(true)
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownershipId,
          name: addForm.name,
          addressLine1: addForm.addressLine1,
          addressLine2: addForm.addressLine2 || undefined,
          city: addForm.city,
          stateProvince: addForm.stateProvince,
          postalCode: addForm.postalCode || undefined,
          country: addForm.country,
        }),
      })
      if (res.ok) {
        const newLoc: LocationRow = await res.json()
        setLocalLocations((prev) => [...prev, newLoc])
        setShowAddLocation(false)
        resetForm()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Locations"
        subtitle={`${ownershipName} — ${activeCount} active location${activeCount === 1 ? '' : 's'}`}
        actions={
          <Button variant="primary" icon="➕" onClick={() => setShowAddLocation(true)}>
            Add Location
          </Button>
        }
      />

      {/* Search bar */}
      <div style={{ marginBottom: 20, maxWidth: 360 }}>
        <Input
          placeholder="Search locations…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Location cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: TLP.gray400,
              fontSize: 14,
            }}
          >
            {search
              ? 'No locations match your search.'
              : 'No locations yet. Click "Add Location" to create one.'}
          </div>
        ) : (
          filtered.map((loc) => {
            const isExpanded = expandedId === loc.id

            return (
              <Card key={loc.id} style={{ padding: 0, overflow: 'hidden' }}>
                {/* Location header row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : loc.id)}
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: TLP.navyLight,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      📍
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: TLP.navy }}>
                        {loc.name}
                      </div>
                      <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
                        {loc.address_line1}, {loc.city}, {loc.state_province}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexShrink: 0 }}>
                    <Stat label="Batches" value="—" />
                    <Stat label="Students" value="—" />
                    <Stat label="Coaches" value="—" />
                    <Badge
                      label={loc.is_active ? 'Active' : 'Inactive'}
                      color={loc.is_active ? TLP.green : TLP.gray500}
                      bg={loc.is_active ? TLP.greenLight : TLP.gray100}
                    />
                    <span style={{ color: TLP.gray400, fontSize: 18 }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded section */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: `1px solid ${TLP.gray100}`,
                      background: TLP.gray50,
                      padding: '16px 20px',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: 13, color: TLP.gray500 }}>
                      Batch scheduling will be available in the next module.
                    </p>
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>

      {/* Add Location Modal */}
      <Modal
        open={showAddLocation}
        onClose={() => {
          setShowAddLocation(false)
          resetForm()
        }}
        title="Add Location"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddLocation(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddLocation}
              disabled={
                saving ||
                !addForm.name ||
                !addForm.addressLine1 ||
                !addForm.city ||
                !addForm.stateProvince
              }
            >
              {saving ? 'Saving…' : 'Add Location'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="Location Name"
            required
            placeholder="e.g. Surrey Central"
            value={addForm.name}
            onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Input
            label="Address Line 1"
            required
            placeholder="Street address"
            value={addForm.addressLine1}
            onChange={(e) => setAddForm((f) => ({ ...f, addressLine1: e.target.value }))}
          />
          <Input
            label="Address Line 2"
            placeholder="Suite, unit, floor (optional)"
            value={addForm.addressLine2}
            onChange={(e) => setAddForm((f) => ({ ...f, addressLine2: e.target.value }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="City"
              required
              placeholder="City"
              value={addForm.city}
              onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))}
            />
            <Input
              label="Province / State"
              required
              placeholder="e.g. BC"
              value={addForm.stateProvince}
              onChange={(e) => setAddForm((f) => ({ ...f, stateProvince: e.target.value }))}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Postal Code"
              placeholder="e.g. V3T 2W1"
              value={addForm.postalCode}
              onChange={(e) => setAddForm((f) => ({ ...f, postalCode: e.target.value }))}
            />
            <Input
              label="Country"
              placeholder="Country"
              value={addForm.country}
              onChange={(e) => setAddForm((f) => ({ ...f, country: e.target.value }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
