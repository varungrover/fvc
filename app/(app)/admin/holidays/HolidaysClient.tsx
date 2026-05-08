"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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

  const renderHolidayCard = (h: Holiday) => {
    const days = daysUntil(h.holidayDate);
    const isImminent = days >= 0 && days <= 14;
    const isPast = days < 0;

    return (
      <Card 
        key={h.id} 
        style={{ 
          border: isImminent ? `1.5px solid ${TLP.amber}` : undefined,
          padding: "16px 20px",
          opacity: isPast ? 0.7 : 1
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {/* Date Block */}
            <div style={{
              width: 56, height: 56, borderRadius: 12,
              background: isPast ? TLP.gray100 : (isImminent ? TLP.amberLight : TLP.tealLight),
              color: isPast ? TLP.gray500 : (isImminent ? TLP.amber : TLP.teal),
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{new Date(h.holidayDate + "T00:00:00").getDate()}</div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", marginTop: 2 }}>
                {new Date(h.holidayDate + "T00:00:00").toLocaleDateString("en-CA", { month: "short" })}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: TLP.navy, marginBottom: 2 }}>
                {h.description}
              </div>
              <div style={{ fontSize: 13, color: TLP.gray500, fontWeight: 500 }}>
                {fmtDate(h.holidayDate)}
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8, alignItems: "center" }}>
                <Badge 
                  label={getScopeLabel(h)} 
                  color={h.ownershipId || h.locationId ? TLP.purple : TLP.blue} 
                  bg={h.ownershipId || h.locationId ? TLP.purpleLight : TLP.blueLight} 
                />
                {isImminent && (
                  <Badge label={`In ${days} day${days !== 1 ? "s" : ""}`} color={TLP.amber} bg={TLP.amberLight} />
                )}
                {isPast && (
                  <Badge label="Completed" color={TLP.gray500} bg={TLP.gray100} />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div style={{ padding: "32px 40px", maxWidth: 1000, margin: "0 auto" }}>
      <PageHeader
        title="Holiday Calendar"
        subtitle="Manage system-wide and location-specific holidays"
        actions={
          <Button variant="primary" icon={<Plus size={15} strokeWidth={2.5} />} onClick={() => setShowAdd(true)}>
            Add Holiday
          </Button>
        }
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {/* Upcoming Section */}
        <section>
          <div style={{ 
            fontSize: 14, 
            fontWeight: 700, 
            color: TLP.gray400, 
            textTransform: "uppercase", 
            letterSpacing: "0.5px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 12
          }}>
            Upcoming Holidays
            <div style={{ flex: 1, height: 1, background: TLP.gray100 }} />
          </div>
          
          {upcoming.length > 0 ? (
            <div style={{ display: "grid", gap: 20 }}>
              {upcoming.map(renderHolidayCard)}
            </div>
          ) : (
            <div style={{ 
              padding: "40px", 
              textAlign: "center", 
              background: "rgba(0,0,0,0.02)", 
              borderRadius: 12,
              border: `1px dashed ${TLP.gray200}`,
              color: TLP.gray400,
              fontSize: 14
            }}>
              No upcoming holidays scheduled.
            </div>
          )}
        </section>

        {/* Past Section */}
        {past.length > 0 && (
          <section>
            <div style={{ 
              fontSize: 14, 
              fontWeight: 700, 
              color: TLP.gray400, 
              textTransform: "uppercase", 
              letterSpacing: "0.5px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 12
            }}>
              Past Holidays
              <div style={{ flex: 1, height: 1, background: TLP.gray100 }} />
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              {past.map(renderHolidayCard)}
            </div>
          </section>
        )}
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
            label="Description" placeholder="e.g. Christmas Day" value={form.description} 
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
