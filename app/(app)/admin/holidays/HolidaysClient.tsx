"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP } from "@/lib/theme/tokens";
import type { Holiday, Ownership, Location } from "@/lib/types";

interface HolidaysClientProps {
  initialHolidays: Holiday[];
  ownerships: Ownership[];
  locations: Location[];
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(iso: string) {
  const today = new Date();
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function HolidaysClient({ initialHolidays, ownerships, locations }: HolidaysClientProps) {
  const [holidays, setHolidays] = useState<Holiday[]>(initialHolidays);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    holidayDate: "",
    description: "",
    ownershipId: "",
    locationId: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upcoming = holidays.filter(h => new Date(h.holidayDate + "T00:00:00") >= new Date());
  const past = holidays.filter(h => new Date(h.holidayDate + "T00:00:00") < new Date());

  const scopeOptions = [
    { value: "", label: "Global (All Ownerships)" },
    ...ownerships.map(o => ({ value: `own_${o.id}`, label: `Ownership: ${o.fullName}` })),
    ...locations.map(l => ({ value: `loc_${l.id}`, label: `Location: ${l.name}` }))
  ];

  async function handleAdd() {
    if (!form.holidayDate || !form.description) return;
    setIsSubmitting(true);
    
    let ownershipId: string | null = null;
    let locationId: string | null = null;
    
    if (form.ownershipId.startsWith('own_')) ownershipId = form.ownershipId.replace('own_', '');
    if (form.ownershipId.startsWith('loc_')) locationId = form.ownershipId.replace('loc_', '');

    try {
      const res = await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holidayDate: form.holidayDate,
          description: form.description,
          ownershipId,
          locationId
        }),
      });
      if (!res.ok) throw new Error("Failed to add holiday");
      const newHoliday = await res.json();
      setHolidays(prev => [...prev, newHoliday].sort((a, b) => a.holidayDate.localeCompare(b.holidayDate)));
      setShowAdd(false);
      setForm({ holidayDate: "", description: "", ownershipId: "", locationId: "" });
    } catch (err) {
      console.error(err);
      alert("Error adding holiday");
    } finally {
      setIsSubmitting(false);
    }
  }

  function getScopeLabel(h: Holiday) {
    if (h.locationId) return `Location: ${locations.find(l => l.id === h.locationId)?.name || 'Unknown'}`;
    if (h.ownershipId) return `Ownership: ${ownerships.find(o => o.id === h.ownershipId)?.fullName || 'Unknown'}`;
    return "Global";
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Holiday Calendar"
        subtitle="Manage system-wide and location-specific holidays"
        actions={
          <Button variant="primary" icon="➕" onClick={() => setShowAdd(true)}>
            Add Holiday
          </Button>
        }
      />

      <div style={{ display: "grid", gap: 16 }}>
        {upcoming.map((h) => {
          const days = daysUntil(h.holidayDate);
          const isImminent = days >= 0 && days <= 14;

          return (
            <Card key={h.id} style={{ border: isImminent ? `1.5px solid ${TLP.amber}` : undefined }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 10,
                    background: isImminent ? TLP.amberLight : TLP.tealLight,
                    color: isImminent ? TLP.amber : TLP.teal,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{new Date(h.holidayDate + "T00:00:00").getDate()}</div>
                    <div style={{ fontSize: 10, fontWeight: 600 }}>{new Date(h.holidayDate + "T00:00:00").toLocaleDateString("en-CA", { month: "short" })}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: TLP.navy }}>{h.description}</div>
                    <div style={{ fontSize: 12, color: TLP.gray500 }}>{fmtDate(h.holidayDate)}</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                      <Badge 
                        label={getScopeLabel(h)} 
                        color={h.ownershipId || h.locationId ? TLP.purple : TLP.blue} 
                        bg={h.ownershipId || h.locationId ? TLP.purpleLight : TLP.blueLight} 
                      />
                      {isImminent && <Badge label={`In ${days} day${days !== 1 ? "s" : ""}`} color={TLP.amber} bg={TLP.amberLight} />}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Holiday"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd} disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Holiday"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input 
            label="Date" type="date" value={form.holidayDate} 
            onChange={e => setForm(f => ({ ...f, holidayDate: e.target.value }))} 
          />
          <Input 
            label="Description" value={form.description} 
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))} 
          />
          <Select 
            label="Scope" value={form.ownershipId} 
            onChange={e => setForm(f => ({ ...f, ownershipId: e.target.value }))} 
            options={scopeOptions}
          />
        </div>
      </Modal>
    </div>
  );
}
