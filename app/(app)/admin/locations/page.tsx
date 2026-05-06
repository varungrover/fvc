"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { LOCATIONS_BY_TENANT, LOCATION_BY_ID } from "@/lib/mock/locations";
import { BATCHES_BY_LOCATION, BATCH_BY_ID } from "@/lib/mock/batches";
import { ENROLLMENTS_BY_BATCH } from "@/lib/mock/enrollments";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { COACHES } from "@/lib/mock/coaches";

const TLP_LOCATIONS = LOCATIONS_BY_TENANT["ten_tlp"] ?? [];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h > 12 ? h - 12 : h || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

export default function LocationsPage() {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [addBatchFor, setAddBatchFor] = useState<string | null>(null);

  const filtered = TLP_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.city.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Locations"
        subtitle="The Learning Planet — 3 active locations"
        actions={
          <Button variant="primary" icon="➕">
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

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filtered.map((loc) => {
          const batches = BATCHES_BY_LOCATION[loc.id] ?? [];
          const activeBatches = batches.filter((b) => b.isActive);
          const enrolled = batches.reduce(
            (sum, b) => sum + (ENROLLMENTS_BY_BATCH[b.id]?.filter((e) => e.status === "active").length ?? 0),
            0,
          );
          const coachCount = new Set(batches.map((b) => b.coachId).filter(Boolean)).size;
          const isExpanded = expandedId === loc.id;

          return (
            <Card key={loc.id} style={{ padding: 0, overflow: "hidden" }}>
              {/* Location header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : loc.id)}
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  gap: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      background: TLP.navyLight,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    📍
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: TLP.navy }}>{loc.name}</div>
                    <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
                      {loc.addressLine1}, {loc.city}, {loc.stateProvince}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 24, alignItems: "center", flexShrink: 0 }}>
                  <Stat label="Batches" value={activeBatches.length} />
                  <Stat label="Students" value={enrolled} />
                  <Stat label="Coaches" value={coachCount} />
                  <Badge
                    label={loc.isActive ? "Active" : "Inactive"}
                    color={loc.isActive ? TLP.green : TLP.gray500}
                    bg={loc.isActive ? TLP.greenLight : TLP.gray100}
                  />
                  <span style={{ color: TLP.gray400, fontSize: 18 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>

              {/* Expanded batch list */}
              {isExpanded && (
                <div
                  style={{
                    borderTop: `1px solid ${TLP.gray100}`,
                    background: TLP.gray50,
                    padding: "16px 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 14,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: TLP.gray700 }}>
                      Batches at {loc.name}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      icon="➕"
                      onClick={() => {
                        setAddBatchFor(loc.id);
                        setShowAddBatch(true);
                      }}
                    >
                      Add Batch
                    </Button>
                  </div>

                  {activeBatches.length === 0 ? (
                    <p style={{ margin: 0, fontSize: 13, color: TLP.gray400 }}>No batches yet.</p>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                        gap: 12,
                      }}
                    >
                      {activeBatches.map((b) => {
                        const level = LEVEL_BY_ID[b.levelId];
                        const planet = level ? PLANET_BY_ID[level.planetId] : null;
                        const pStyle = planetStyle(planet?.name ?? "");
                        const enrolledCount = ENROLLMENTS_BY_BATCH[b.id]?.filter((e) => e.status === "active").length ?? 0;
                        const coach = b.coachId ? COACHES.find((c) => c.id === b.coachId) : null;

                        return (
                          <div
                            key={b.id}
                            style={{
                              background: TLP.white,
                              borderRadius: 10,
                              padding: "14px 16px",
                              border: `1px solid ${TLP.gray200}`,
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                              <div>
                                <div
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 5,
                                    background: pStyle.bg,
                                    color: pStyle.color,
                                    padding: "2px 8px",
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 700,
                                    marginBottom: 4,
                                  }}
                                >
                                  {pStyle.icon} {planet?.name}
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 700, color: TLP.navy }}>
                                  {level?.name}
                                </div>
                              </div>
                              <div style={{ fontSize: 12, color: TLP.gray500, textAlign: "right" }}>
                                <div>{DAYS[b.dayOfWeek]}s</div>
                                <div>{fmtTime(b.startTime)} – {fmtTime(b.endTime)}</div>
                              </div>
                            </div>
                            <div style={{ fontSize: 12, color: TLP.gray600, marginBottom: 8 }}>
                              Coach:{" "}
                              {coach ? (
                                <span style={{ fontWeight: 600 }}>{coach.fullName}</span>
                              ) : (
                                <span style={{ color: TLP.amber, fontWeight: 600 }}>Unassigned</span>
                              )}
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: 12, color: TLP.gray600 }}>
                              <span>Enrollment</span>
                              <span style={{ fontWeight: 600, color: TLP.navy }}>{enrolledCount} / {b.capacity}</span>
                            </div>
                            <ProgressBar
                              value={enrolledCount}
                              max={b.capacity}
                              color={enrolledCount >= b.capacity ? TLP.red : TLP.teal}
                              height={5}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Batch Modal */}
      <Modal
        open={showAddBatch}
        onClose={() => { setShowAddBatch(false); setAddBatchFor(null); }}
        title={`Add Batch — ${addBatchFor ? (LOCATION_BY_ID[addBatchFor]?.name ?? addBatchFor) : ""}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddBatch(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowAddBatch(false)}>Add Batch</Button>
          </>
        }
      >
        <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
          <p style={{ color: TLP.gray600, fontSize: 14, lineHeight: 1.6 }}>
            Batch creation UI coming soon. This is a prototype — changes won't persist.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 18, fontWeight: 800, color: TLP.navy }}>{value}</div>
      <div style={{ fontSize: 11, color: TLP.gray500, fontWeight: 600 }}>{label}</div>
    </div>
  );
}
