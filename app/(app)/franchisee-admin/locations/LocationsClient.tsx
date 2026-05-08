'use client'

import { useState } from 'react'
import { Plus, MapPin, ChevronUp, ChevronDown, CalendarDays, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/layout/PageHeader'
import { TLP } from '@/lib/theme/tokens'
import type { LocationRow } from '@/lib/db/locations'
import type { Planet, Level } from '@/lib/types'

interface Props {
  locations: LocationRow[]
  ownershipName: string
  planets: (Planet & { products: Level[] })[]
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: TLP.navy }}>{value}</div>
      <div style={{ fontSize: 11, color: TLP.gray500, fontWeight: 600 }}>{label}</div>
    </div>
  )
}

export function LocationsClient({ locations, ownershipName, planets }: Props) {
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
  const [addError, setAddError] = useState<string | null>(null)
  const [localLocations, setLocalLocations] = useState<LocationRow[]>(locations)
  const [showAddBatch, setShowAddBatch] = useState<{ locationId: string; levelId: string } | null>(null)
  const [batchForm, setBatchForm] = useState({
    dayOfWeek: 'Monday',
    startTime: '16:00:00',
    endTime: '17:00:00',
    maxCapacity: 8
  })

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
    setAddError(null)
  }

  async function handleAddLocation() {
    if (!addForm.name || !addForm.addressLine1 || !addForm.city || !addForm.stateProvince || !addForm.country) return
    setSaving(true)
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        setAddError(null)
        const newLoc: LocationRow = await res.json()
        setLocalLocations((prev) => [...prev, newLoc])
        setShowAddLocation(false)
        resetForm()
      } else {
        const errBody = await res.json().catch(() => ({}))
        setAddError(errBody.error ?? 'Failed to save. Please try again.')
      }
    } catch (e) {
      console.error('handleAddLocation failed:', e)
      setAddError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddBatch() {
    if (!showAddBatch) return;
    setSaving(true);
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...batchForm,
          locationId: showAddBatch.locationId,
          levelId: showAddBatch.levelId,
        }),
      });
      if (res.ok) {
        setShowAddBatch(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add batch");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    } finally {
      setSaving(false);
    }
  }

  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Locations"
        subtitle={`${ownershipName} — ${activeCount} active location${activeCount === 1 ? '' : 's'}`}
        actions={
          <Button variant="primary" icon={<Plus size={15} strokeWidth={2.5} />} onClick={() => setShowAddLocation(true)}>
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
                      <MapPin size={20} strokeWidth={1.75} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: TLP.navy }}>
                        {loc.name}
                      </div>
                      <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
                        {loc.address_line1}, {loc.city}, {loc.state_province} {loc.postal_code ?? ''}
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
                    <span style={{ color: TLP.gray400, display: 'flex', alignItems: 'center' }}>
                      {isExpanded ? <ChevronUp size={18} strokeWidth={2} /> : <ChevronDown size={18} strokeWidth={2} />}
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      borderTop: `1px solid ${TLP.gray100}`,
                      background: TLP.gray50,
                      padding: '16px 20px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<CalendarDays size={14} strokeWidth={2} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/franchisee-admin/batches?locationId=${loc.id}`;
                          }}
                        >
                          View Batches
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<Tag size={14} strokeWidth={2} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `/franchisee-admin/locations/${loc.id}/offerings`;
                          }}
                        >
                          Manage Offerings
                        </Button>
                      </div>
                    </div>
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
                !addForm.stateProvince ||
                !addForm.country
              }
            >
              {saving ? 'Saving…' : 'Add Location'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {addError && (
            <div style={{ color: '#dc2626', fontSize: 13, marginBottom: 8 }}>{addError}</div>
          )}
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

      {/* Add Batch Modal */}
      <Modal
        open={!!showAddBatch}
        onClose={() => setShowAddBatch(null)}
        title="Add Recurring Batch"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddBatch(null)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={async () => {
                await handleAddBatch();
                setRefreshKey(k => k + 1); // Refresh BatchLists
              }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Add Batch'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: TLP.gray600, display: 'block', marginBottom: 6 }}>
              Day of Week
            </label>
            <select 
              style={{ 
                width: '100%', 
                padding: '10px 12px', 
                borderRadius: 8, 
                border: `1px solid ${TLP.gray200}`,
                fontSize: 14
              }}
              value={batchForm.dayOfWeek}
              onChange={e => setBatchForm(f => ({ ...f, dayOfWeek: e.target.value }))}
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input 
              label="Start Time" 
              type="time" 
              value={batchForm.startTime.substring(0, 5)} 
              onChange={e => setBatchForm(f => ({ ...f, startTime: e.target.value + ':00' }))}
            />
            <Input 
              label="End Time" 
              type="time" 
              value={batchForm.endTime.substring(0, 5)} 
              onChange={e => setBatchForm(f => ({ ...f, endTime: e.target.value + ':00' }))}
            />
          </div>

          <Input 
            label="Max Capacity" 
            type="number" 
            value={batchForm.maxCapacity} 
            onChange={e => setBatchForm(f => ({ ...f, maxCapacity: parseInt(e.target.value) }))}
          />
        </div>
      </Modal>
    </div>
  )
}
