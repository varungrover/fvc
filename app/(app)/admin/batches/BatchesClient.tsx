"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { TLP } from "@/lib/theme/tokens";
import type { LocationRow } from "@/lib/db/locations";
import type { Planet, Level, Batch } from "@/lib/types";

interface Props {
  locations: LocationRow[];
  planets: (Planet & { products: Level[] })[];
  role: string;
}

export function BatchesClient({ locations, planets, role }: Props) {
  const searchParams = useSearchParams();
  const initialLocId = searchParams.get("locationId") || locations[0]?.id || "";
  
  const [selectedLocation, setSelectedLocation] = useState<string>(initialLocId);
  const [selectedPlanet, setSelectedPlanet] = useState<string>("all");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [batchForm, setBatchForm] = useState({
    dayOfWeek: 'Monday',
    startTime: '16:00:00',
    endTime: '17:00:00',
    maxCapacity: 8,
    levelId: ""
  });

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      let url = `/api/batches?locationId=${selectedLocation}`;
      if (selectedLevel !== "all") url += `&levelId=${selectedLevel}`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch");
      let data: Batch[] = await res.json();
      
      // If planet is selected but level is "all", we filter client-side for now
      // unless we update the API to handle planet filtering.
      if (selectedPlanet !== "all" && selectedLevel === "all") {
        const planetLevels = planets.find(p => p.id === selectedPlanet)?.products.map(l => l.id) || [];
        data = data.filter(b => planetLevels.includes(b.levelId));
      }

      setBatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLocation) fetchBatches();
  }, [selectedLocation, selectedLevel, selectedPlanet]);

  const handleAddBatch = async () => {
    if (!batchForm.levelId) {
      alert("Please select a level");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...batchForm,
          locationId: selectedLocation,
        }),
      });
      if (res.ok) {
        setShowAddBatch(false);
        fetchBatches();
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
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/batches/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBatches();
    } catch (err) {
      console.error(err);
    }
  };

  const currentLevels = selectedPlanet === "all" 
    ? planets.flatMap(p => p.products) 
    : planets.find(p => p.id === selectedPlanet)?.products || [];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div style={{ padding: 24 }}>
      <PageHeader 
        title="Batch Management" 
        subtitle="Manage recurring class batches across locations and levels"
        actions={
          <Button variant="primary" icon="➕" onClick={() => setShowAddBatch(true)}>
            Add Recurring Batch
          </Button>
        }
      />

      {/* Filters Card */}
      <Card style={{ padding: 20, marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500, marginBottom: 6, display: 'block' }}>Location</label>
          <select 
            style={selectStyle}
            value={selectedLocation}
            onChange={e => setSelectedLocation(e.target.value)}
          >
            {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500, marginBottom: 6, display: 'block' }}>Planet</label>
          <select 
            style={selectStyle}
            value={selectedPlanet}
            onChange={e => {
              setSelectedPlanet(e.target.value);
              setSelectedLevel("all");
            }}
          >
            <option value="all">All Planets</option>
            {planets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500, marginBottom: 6, display: 'block' }}>Level</label>
          <select 
            style={selectStyle}
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
          >
            <option value="all">All Levels</option>
            {currentLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
      </Card>

      {/* Schedule Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {days.map(day => {
          const dayBatches = batches.filter(b => b.dayOfWeek === day);
          if (dayBatches.length === 0 && (selectedLevel !== "all" || selectedPlanet !== "all")) return null;
          
          return (
            <div key={day}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: TLP.navy, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                {day}
                <span style={{ fontSize: 11, background: TLP.navyLight, color: '#fff', padding: '2px 8px', borderRadius: 10 }}>
                  {dayBatches.length} slots
                </span>
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                {dayBatches.length === 0 ? (
                  <div style={{ color: TLP.gray400, fontSize: 13, fontStyle: 'italic', padding: '10px 0' }}>No slots scheduled for {day}</div>
                ) : (
                  dayBatches.map(batch => {
                    const level = currentLevels.find(l => l.id === batch.levelId);
                    const planet = planets.find(p => p.products.some(pl => pl.id === batch.levelId));
                    
                    return (
                      <Card key={batch.id} style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 800, fontSize: 14, color: TLP.navy }}>{batch.startTime.substring(0, 5)} - {batch.endTime.substring(0, 5)}</span>
                            <span style={{ fontSize: 11, color: TLP.gray400 }}>•</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: TLP.teal }}>{planet?.name}</span>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: TLP.gray700 }}>{level?.name}</div>
                          <div style={{ fontSize: 11, color: TLP.gray500, marginTop: 4 }}>Capacity: {batch.maxCapacity} students</div>
                        </div>
                        <button 
                          onClick={() => handleDelete(batch.id)}
                          style={{ background: 'none', border: 'none', color: TLP.red, cursor: 'pointer', fontSize: 18, opacity: 0.6 }}
                        >
                          ✕
                        </button>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Batch Modal */}
      <Modal
        open={showAddBatch}
        onClose={() => setShowAddBatch(false)}
        title="Create Recurring Slot"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddBatch(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddBatch} disabled={saving}>
              {saving ? 'Saving...' : 'Create Slot'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle}>Level</label>
            <select 
              style={selectStyle}
              value={batchForm.levelId}
              onChange={e => setBatchForm(f => ({ ...f, levelId: e.target.value }))}
            >
              <option value="">Select Level...</option>
              {planets.map(p => (
                <optgroup key={p.id} label={p.name}>
                  {p.products.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Day of Week</label>
            <select 
              style={selectStyle}
              value={batchForm.dayOfWeek}
              onChange={e => setBatchForm(f => ({ ...f, dayOfWeek: e.target.value }))}
            >
              {days.map(d => <option key={d} value={d}>{d}</option>)}
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
  );
}

const selectStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid ${TLP.gray200}`,
  fontSize: 14,
  background: '#fff'
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: TLP.gray600,
  display: 'block',
  marginBottom: 6
};
