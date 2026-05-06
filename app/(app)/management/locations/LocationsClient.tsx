'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { PageHeader } from '@/components/layout/PageHeader'
import { TLP } from '@/lib/theme/tokens'
import type { LocationRow } from '@/lib/db/locations'

export interface OwnershipGroup {
  id: string
  name: string
  locations: LocationRow[]
}

interface Props {
  groups: OwnershipGroup[]
  totalLocations: number
}

const ACCENT_COLORS = [
  TLP.navy,
  TLP.teal,
  TLP.purple,
  TLP.blue,
  TLP.amber,
]

const ACCENT_BGS = [
  '#f0f2f8',
  TLP.tealLight,
  TLP.purpleLight,
  TLP.blueLight,
  TLP.amberLight,
]

export function LocationsClient({ groups, totalLocations }: Props) {
  const [search, setSearch] = useState('')
  const [ownershipFilter, setOwnershipFilter] = useState('all')

  const ownershipOptions = [
    { value: 'all', label: 'All Ownerships' },
    ...groups.map((g) => ({ value: g.id, label: g.name })),
  ]

  const activeLocations = groups
    .flatMap((g) => g.locations)
    .filter((l) => l.is_active).length

  const filteredGroups = groups
    .filter((g) => ownershipFilter === 'all' || g.id === ownershipFilter)
    .map((g) => {
      const q = search.toLowerCase()
      const filtered = q
        ? g.locations.filter(
            (l) =>
              l.name.toLowerCase().includes(q) ||
              l.city.toLowerCase().includes(q) ||
              l.state_province.toLowerCase().includes(q) ||
              l.address_line1.toLowerCase().includes(q),
          )
        : g.locations
      return { ...g, locations: filtered }
    })
    .filter((g) => g.locations.length > 0)

  const filteredTotal = filteredGroups.reduce((s, g) => s + g.locations.length, 0)

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PageHeader
        title="All Locations"
        subtitle="Read-only overview of all locations across the network"
      />

      {/* Stat tiles */}
      <div style={{ display: 'flex', gap: 14 }}>
        {[
          { label: 'Total Locations', value: totalLocations, color: TLP.navy },
          { label: 'Active Locations', value: activeLocations, color: TLP.green },
          { label: 'Ownerships', value: groups.length, color: TLP.purple },
        ].map((tile) => (
          <Card key={tile.label} style={{ padding: '16px 20px', flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                color: TLP.gray500,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
                marginBottom: 6,
              }}
            >
              {tile.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: tile.color }}>
              {tile.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card style={{ padding: '14px 20px' }}>
        <div
          style={{
            display: 'flex',
            gap: 14,
            alignItems: 'flex-end',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <Input
              label="Search"
              placeholder="Search by name, city, or address…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ minWidth: 220 }}>
            <Select
              label="Ownership"
              value={ownershipFilter}
              onChange={(e) => setOwnershipFilter(e.target.value)}
              options={ownershipOptions}
            />
          </div>
        </div>
      </Card>

      {/* Location groups */}
      {filteredGroups.map((group, idx) => {
        const accentColor = ACCENT_COLORS[idx % ACCENT_COLORS.length]
        const accentBg = ACCENT_BGS[idx % ACCENT_BGS.length]

        return (
          <div key={group.id}>
            {/* Group header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
                padding: '8px 16px',
                background: accentBg,
                borderRadius: 10,
                borderLeft: `4px solid ${accentColor}`,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 15, color: accentColor }}>
                {group.name}
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge
                  label={`${group.locations.length} location${group.locations.length !== 1 ? 's' : ''}`}
                  color={accentColor}
                  bg={accentBg}
                />
              </div>
            </div>

            {/* Location cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 14,
              }}
            >
              {group.locations.map((loc) => (
                <Card key={loc.id} style={{ padding: '18px 20px' }}>
                  {/* Name + badge */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: TLP.navy,
                          marginBottom: 2,
                        }}
                      >
                        {loc.name}
                      </div>
                      <div style={{ fontSize: 12, color: TLP.gray500 }}>
                        {loc.city}, {loc.state_province}
                        {loc.postal_code ? ` · ${loc.postal_code}` : ''}
                      </div>
                      <div style={{ fontSize: 11, color: TLP.gray400, marginTop: 2 }}>
                        {loc.address_line1}
                      </div>
                    </div>
                    <Badge
                      label={loc.is_active ? 'Active' : 'Inactive'}
                      color={loc.is_active ? TLP.green : TLP.gray500}
                      bg={loc.is_active ? TLP.greenLight : TLP.gray100}
                    />
                  </div>

                  {/* Stat placeholders */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 8,
                      padding: '10px 0',
                      borderTop: `1px solid ${TLP.gray100}`,
                    }}
                  >
                    {(['Batches', 'Students', 'Coaches'] as const).map((label) => (
                      <div key={label} style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: TLP.gray400,
                          }}
                        >
                          —
                        </div>
                        <div style={{ fontSize: 11, color: TLP.gray500 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}

      {/* Empty state */}
      {filteredTotal === 0 && (
        <Card style={{ padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', color: TLP.gray400, fontSize: 14 }}>
            No locations match your search.
          </div>
        </Card>
      )}
    </div>
  )
}
