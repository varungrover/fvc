"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, PlanetBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { COACHES } from "@/lib/mock/coaches";
import { BATCHES } from "@/lib/mock/batches";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { LOCATION_BY_ID } from "@/lib/mock/locations";
import type { Coach } from "@/lib/types";

const MLA_TEAL = "#0a9b8a";
const MLA_COACHES = COACHES.filter((c) => c.ownershipId === "ten_mla");
const MLA_BATCHES = BATCHES.filter((b) => ["loc_mla_toronto", "loc_mla_mississauga", "loc_mla_brampton"].includes(b.locationId));
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h > 12 ? h - 12 : h || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

function statusBadge(status: Coach["status"]) {
  if (status === "active") return <Badge label="Active" color={TLP.green} bg={TLP.greenLight} />;
  if (status === "on_leave") return <Badge label="On Leave" color={TLP.amber} bg={TLP.amberLight} />;
  return <Badge label="Inactive" color={TLP.gray500} bg={TLP.gray100} />;
}

type AddForm = {
  fullName: string;
  email: string;
  phone: string;
  locationId: string;
  planetIds: string[];
};

const BLANK_FORM: AddForm = {
  fullName: "",
  email: "",
  phone: "",
  locationId: "loc_mla_toronto",
  planetIds: [],
};

const LOCATION_OPTIONS = [
  { value: "loc_mla_toronto", label: "Toronto Downtown" },
  { value: "loc_mla_mississauga", label: "Mississauga" },
  { value: "loc_mla_brampton", label: "Brampton" },
];

const PLANET_OPTIONS = [
  { id: "pl_chess", name: "Chess" },
  { id: "pl_math", name: "Math" },
  { id: "pl_english", name: "English" },
  { id: "pl_finance", name: "Finance" },
  { id: "pl_arts", name: "Arts" },
];

export default function FranchiseeCoachesPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddForm>(BLANK_FORM);
  const [extraCoaches, setExtraCoaches] = useState<Coach[]>([]);

  const allCoaches = [...MLA_COACHES, ...extraCoaches];

  function togglePlanet(pid: string) {
    setForm((f) => ({
      ...f,
      planetIds: f.planetIds.includes(pid)
        ? f.planetIds.filter((p) => p !== pid)
        : [...f.planetIds, pid],
    }));
  }

  function handleAdd() {
    if (!form.fullName || !form.email) return;
    const newCoach: Coach = {
      id: `coach_new_${Date.now()}`,
      userId: `user_new_${Date.now()}`,
      ownershipId: "ten_mla",
      fullName: form.fullName,
      email: form.email,
      phone: form.phone || undefined,
      locationId: form.locationId || undefined,
      status: "active",
      planetIds: form.planetIds,
    };
    setExtraCoaches((prev) => [...prev, newCoach]);
    setShowAdd(false);
    setForm(BLANK_FORM);
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Coaches"
        subtitle="Maple Leaf Academy — coach management"
        actions={
          <Button
            variant="primary"
            icon="➕"
            onClick={() => { setForm(BLANK_FORM); setShowAdd(true); }}
          >
            Add Coach
          </Button>
        }
      />

      <Card style={{ overflow: "hidden", padding: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 110px 200px 180px 100px",
            padding: "10px 20px",
            background: TLP.gray50,
            fontSize: 11,
            fontWeight: 700,
            color: TLP.gray500,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            gap: 8,
            borderBottom: `1px solid ${TLP.gray100}`,
          }}
        >
          <span>Coach</span>
          <span>Status</span>
          <span>Planets</span>
          <span>Location</span>
          <span>Batches</span>
        </div>

        {allCoaches.map((coach) => {
          const location = coach.locationId ? LOCATION_BY_ID[coach.locationId] : null;
          const assignedBatches = MLA_BATCHES.filter((b) => b.coachId === coach.id);
          const isExpanded = expandedId === coach.id;

          return (
            <div key={coach.id}>
              <div
                onClick={() => setExpandedId(isExpanded ? null : coach.id)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 110px 200px 180px 100px",
                  padding: "13px 20px",
                  fontSize: 13,
                  gap: 8,
                  borderBottom: `1px solid ${TLP.gray100}`,
                  alignItems: "center",
                  cursor: "pointer",
                  background: isExpanded ? TLP.gray50 : "transparent",
                  transition: "background 0.1s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={coach.fullName} size={36} color={MLA_TEAL} />
                  <div>
                    <div style={{ fontWeight: 700, color: TLP.navy }}>{coach.fullName}</div>
                    <div style={{ fontSize: 11, color: TLP.gray500 }}>{coach.email}</div>
                  </div>
                </div>
                <span>{statusBadge(coach.status)}</span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {coach.planetIds.map((pid) => {
                    const planet = PLANET_BY_ID[pid];
                    return planet ? <PlanetBadge key={pid} planet={planet.name} /> : null;
                  })}
                </div>
                <span style={{ color: TLP.gray600 }}>{location?.name ?? "—"}</span>
                <span
                  style={{
                    fontWeight: 700,
                    color: assignedBatches.length > 0 ? TLP.navy : TLP.gray400,
                  }}
                >
                  {assignedBatches.length}
                </span>
              </div>

              {isExpanded && (
                <div
                  style={{
                    padding: "16px 20px 20px 68px",
                    borderBottom: `1px solid ${TLP.gray100}`,
                    background: TLP.gray50,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 20,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
                      Assigned Batches
                    </div>
                    {assignedBatches.length === 0 ? (
                      <p style={{ margin: 0, fontSize: 13, color: TLP.gray400 }}>No batches assigned.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {assignedBatches.map((b) => {
                          const level = LEVEL_BY_ID[b.levelId];
                          const planet = level ? PLANET_BY_ID[level.planetId] : null;
                          const pStyle = planetStyle(planet?.name ?? "");
                          return (
                            <div
                              key={b.id}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 12px",
                                background: TLP.white,
                                borderRadius: 8,
                                border: `1px solid ${TLP.gray200}`,
                                fontSize: 13,
                              }}
                            >
                              <div>
                                <span
                                  style={{
                                    background: pStyle.bg,
                                    color: pStyle.color,
                                    padding: "1px 6px",
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    marginRight: 6,
                                  }}
                                >
                                  {pStyle.icon} {planet?.name}
                                </span>
                                <span style={{ fontWeight: 600, color: TLP.navy }}>{level?.name}</span>
                              </div>
                              <span style={{ fontSize: 12, color: TLP.gray500 }}>
                                {DAYS[b.dayOfWeek]}s {fmtTime(b.startTime)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: TLP.gray500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 8 }}>
                      Contact & Availability
                    </div>
                    <div
                      style={{
                        background: TLP.white,
                        borderRadius: 8,
                        border: `1px solid ${TLP.gray200}`,
                        padding: "12px 14px",
                        fontSize: 13,
                        color: TLP.gray600,
                      }}
                    >
                      <div style={{ color: TLP.green, fontWeight: 600 }}>✓ Available — Mon–Sat, 4–8pm</div>
                      <div style={{ marginTop: 8, color: TLP.gray500 }}>Phone: {coach.phone ?? "—"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card>

      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Coach"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAdd} disabled={!form.fullName || !form.email}>
              Add Coach
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Full Name"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            required
            placeholder="e.g. Anika Sharma"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            placeholder="coach@mapleleafacademy.ca"
          />
          <Input
            label="Phone (optional)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+1-416-555-0100"
          />
          <Select
            label="Primary Location"
            value={form.locationId}
            onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
            options={LOCATION_OPTIONS}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, marginBottom: 8 }}>Planets (select all that apply)</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PLANET_OPTIONS.map((p) => {
                const pStyle = planetStyle(p.name);
                const selected = form.planetIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlanet(p.id)}
                    style={{
                      background: selected ? pStyle.bg : TLP.white,
                      color: selected ? pStyle.color : TLP.gray600,
                      border: `1.5px solid ${selected ? pStyle.color : TLP.gray200}`,
                      padding: "5px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {pStyle.icon} {p.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
