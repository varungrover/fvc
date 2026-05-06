"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { Tabs } from "@/components/ui/Tabs";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { ROSTER_ASSIGNMENTS } from "@/lib/mock/roster";
import { BATCH_BY_ID } from "@/lib/mock/batches";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { LOCATION_BY_ID } from "@/lib/mock/locations";
import { COACH_BY_ID, COACHES } from "@/lib/mock/coaches";

const TLP_COACH_IDS = new Set(COACHES.filter((c) => c.ownershipId === "ten_tlp").map((c) => c.id));

const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h > 12 ? h - 12 : h || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

const BASE_DATE = new Date("2026-05-04T00:00:00");

function getWeekDates(offsetWeeks: number): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(BASE_DATE);
    d.setDate(BASE_DATE.getDate() + offsetWeeks * 7 + i);
    return d.toISOString().slice(0, 10);
  });
}

const ROSTER_VIEW_TABS = [
  { id: "list", label: "List" },
  { id: "calendar", label: "Calendar" },
  { id: "by-coach", label: "By Coach" },
];

const LOCATION_OPTIONS = [
  { value: "", label: "All Locations" },
  { value: "loc_tlp_surrey", label: "Surrey Central" },
  { value: "loc_tlp_abbotsford", label: "Abbotsford" },
  { value: "loc_tlp_langley", label: "Langley" },
];

const COACH_SELECT_OPTIONS = [
  { value: "", label: "Select coach" },
  ...COACHES.filter((c) => c.ownershipId === "ten_tlp").map((c) => ({
    value: c.id,
    label: c.fullName,
  })),
];

export default function RosterPage() {
  const [view, setView] = useState("list");
  const [weekOffset, setWeekOffset] = useState(0);
  const [showPublishToast, setShowPublishToast] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [locationFilter, setLocationFilter] = useState("");

  const weekDates = getWeekDates(weekOffset);

  const assignments = ROSTER_ASSIGNMENTS.filter((a) => {
    const batch = BATCH_BY_ID[a.batchId];
    if (!batch) return false;
    const loc = LOCATION_BY_ID[batch.locationId];
    if (!loc || loc.ownershipId !== "ten_tlp") return false;
    if (locationFilter && batch.locationId !== locationFilter) return false;
    return true;
  });

  const twoWeekAssignments = assignments.filter(
    (a) => a.sessionDate >= "2026-05-04" && a.sessionDate <= "2026-05-17",
  );

  function handlePublish() {
    setShowPublishToast(true);
    setTimeout(() => setShowPublishToast(false), 3000);
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Roster"
        subtitle="2-week rolling roster for TLP locations"
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="secondary"
              icon="➕"
              onClick={() => setShowAddModal(true)}
            >
              Add Assignment
            </Button>
            <Button variant="primary" onClick={handlePublish}>
              Publish Roster
            </Button>
          </div>
        }
      />

      {/* Published toast */}
      {showPublishToast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            background: TLP.green,
            color: "#fff",
            padding: "12px 20px",
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 14,
            zIndex: 9999,
            boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          }}
        >
          ✓ Roster published successfully
        </div>
      )}

      {/* Location filter */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 220 }}>
          <Select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            options={LOCATION_OPTIONS}
          />
        </div>
      </div>

      <Tabs tabs={ROSTER_VIEW_TABS} active={view} onChange={setView} />

      {/* LIST VIEW */}
      {view === "list" && (
        <Card style={{ overflow: "hidden", padding: 0 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "110px 200px 180px 160px 130px",
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
            <span>Date</span>
            <span>Batch</span>
            <span>Location</span>
            <span>Coach</span>
            <span>Time</span>
          </div>
          {twoWeekAssignments
            .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))
            .map((a, i) => {
              const batch = BATCH_BY_ID[a.batchId];
              const level = batch ? LEVEL_BY_ID[batch.levelId] : null;
              const planet = level ? PLANET_BY_ID[level.planetId] : null;
              const location = batch ? LOCATION_BY_ID[batch.locationId] : null;
              const coach = a.coachId ? COACH_BY_ID[a.coachId] : null;
              const pStyle = planetStyle(planet?.name ?? "");

              return (
                <div
                  key={a.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "110px 200px 180px 160px 130px",
                    padding: "12px 20px",
                    fontSize: 13,
                    gap: 8,
                    borderBottom: i < twoWeekAssignments.length - 1 ? `1px solid ${TLP.gray100}` : "none",
                    alignItems: "center",
                    background: !a.coachId ? `${TLP.amber}10` : "transparent",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: TLP.navy }}>{fmtDate(a.sessionDate)}</div>
                    <div style={{ fontSize: 11, color: TLP.gray500 }}>{DAYS_SHORT[new Date(a.sessionDate + "T00:00:00").getDay()]}</div>
                  </div>
                  <div>
                    <span
                      style={{
                        background: pStyle.bg,
                        color: pStyle.color,
                        padding: "1px 6px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        marginRight: 5,
                      }}
                    >
                      {pStyle.icon} {planet?.name}
                    </span>
                    <span style={{ fontWeight: 600, color: TLP.navy }}>{level?.name}</span>
                  </div>
                  <span style={{ color: TLP.gray600 }}>{location?.name ?? "—"}</span>
                  {coach ? (
                    <span style={{ color: TLP.navy, fontWeight: 500 }}>{coach.fullName}</span>
                  ) : (
                    <Badge label="Unassigned" color={TLP.amber} bg={TLP.amberLight} />
                  )}
                  <span style={{ color: TLP.gray500 }}>
                    {fmtTime(batch?.startTime ?? "")} – {fmtTime(batch?.endTime ?? "")}
                  </span>
                </div>
              );
            })}
        </Card>
      )}

      {/* CALENDAR VIEW */}
      {view === "calendar" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <Button variant="secondary" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
              ← Prev
            </Button>
            <span style={{ fontWeight: 700, fontSize: 14, color: TLP.navy }}>
              Week of {fmtDate(weekDates[0])}
            </span>
            <Button variant="secondary" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
              Next →
            </Button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 8,
            }}
          >
            {weekDates.map((date, di) => {
              const dayAssignments = assignments.filter((a) => a.sessionDate === date);
              const dayOfWeek = new Date(date + "T00:00:00").getDay();

              return (
                <div key={date}>
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: 8,
                      fontWeight: 700,
                      fontSize: 12,
                      color: dayAssignments.length > 0 ? TLP.navy : TLP.gray400,
                    }}
                  >
                    {DAYS_SHORT[dayOfWeek]}
                    <div style={{ fontSize: 11, fontWeight: 400, color: TLP.gray500 }}>
                      {fmtDate(date)}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 80 }}>
                    {dayAssignments.length === 0 ? (
                      <div
                        style={{
                          background: TLP.gray50,
                          borderRadius: 8,
                          padding: "8px",
                          textAlign: "center",
                          color: TLP.gray300,
                          fontSize: 11,
                          border: `1px dashed ${TLP.gray200}`,
                          minHeight: 60,
                        }}
                      />
                    ) : (
                      dayAssignments.map((a) => {
                        const batch = BATCH_BY_ID[a.batchId];
                        const level = batch ? LEVEL_BY_ID[batch.levelId] : null;
                        const planet = level ? PLANET_BY_ID[level.planetId] : null;
                        const coach = a.coachId ? COACH_BY_ID[a.coachId] : null;
                        const pStyle = planetStyle(planet?.name ?? "");

                        return (
                          <div
                            key={a.id}
                            style={{
                              background: a.coachId ? pStyle.bg : TLP.amberLight,
                              border: `1px solid ${a.coachId ? pStyle.color + "40" : TLP.amber + "60"}`,
                              borderRadius: 7,
                              padding: "6px 8px",
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: pStyle.color }}>
                              {pStyle.icon} {planet?.name}
                            </div>
                            <div style={{ fontSize: 10, color: TLP.navy, fontWeight: 600 }}>
                              {level?.name}
                            </div>
                            <div style={{ fontSize: 10, color: TLP.gray600, marginTop: 2 }}>
                              {fmtTime(batch?.startTime ?? "")}
                            </div>
                            <div style={{ fontSize: 10, color: coach ? TLP.gray600 : TLP.amber, fontWeight: coach ? 400 : 700, marginTop: 2 }}>
                              {coach ? coach.fullName.split(" ")[0] : "Unassigned"}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BY-COACH VIEW */}
      {view === "by-coach" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Unassigned sessions first */}
          {(() => {
            const unassigned = twoWeekAssignments.filter((a) => !a.coachId);
            if (unassigned.length === 0) return null;
            return (
              <Card style={{ padding: "18px 20px", border: `1.5px solid ${TLP.amber}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 18 }}>⚠️</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: TLP.amber }}>
                    {unassigned.length} Unassigned Session{unassigned.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {unassigned.map((a) => {
                    const batch = BATCH_BY_ID[a.batchId];
                    const level = batch ? LEVEL_BY_ID[batch.levelId] : null;
                    const planet = level ? PLANET_BY_ID[level.planetId] : null;
                    const location = batch ? LOCATION_BY_ID[batch.locationId] : null;
                    const pStyle = planetStyle(planet?.name ?? "");

                    return (
                      <div
                        key={a.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px 12px",
                          background: TLP.amberLight,
                          borderRadius: 8,
                          fontSize: 13,
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: TLP.navy }}>
                            {planet?.name} · {level?.name}
                          </span>
                          <span style={{ color: TLP.gray600, marginLeft: 8 }}>{location?.name}</span>
                        </div>
                        <span style={{ color: TLP.gray500 }}>{fmtDate(a.sessionDate)}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })()}

          {/* Per-coach cards */}
          {COACHES.filter((c) => c.ownershipId === "ten_tlp").map((coach) => {
            const coachAssignments = twoWeekAssignments
              .filter((a) => a.coachId === coach.id)
              .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate));

            return (
              <Card key={coach.id} style={{ padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: TLP.navyLight,
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    {coach.fullName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: TLP.navy }}>{coach.fullName}</div>
                    <div style={{ fontSize: 12, color: TLP.gray500 }}>
                      {coachAssignments.length} session{coachAssignments.length !== 1 ? "s" : ""} this fortnight
                    </div>
                  </div>
                  {coach.status === "on_leave" && (
                    <Badge label="On Leave" color={TLP.amber} bg={TLP.amberLight} />
                  )}
                </div>
                {coachAssignments.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: TLP.gray400 }}>No sessions in this period.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {coachAssignments.map((a) => {
                      const batch = BATCH_BY_ID[a.batchId];
                      const level = batch ? LEVEL_BY_ID[batch.levelId] : null;
                      const planet = level ? PLANET_BY_ID[level.planetId] : null;
                      const location = batch ? LOCATION_BY_ID[batch.locationId] : null;
                      const pStyle = planetStyle(planet?.name ?? "");

                      return (
                        <div
                          key={a.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 12px",
                            background: TLP.bg,
                            borderRadius: 8,
                            fontSize: 13,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span
                              style={{
                                background: pStyle.bg,
                                color: pStyle.color,
                                padding: "1px 6px",
                                borderRadius: 20,
                                fontSize: 11,
                                fontWeight: 700,
                              }}
                            >
                              {pStyle.icon} {planet?.name}
                            </span>
                            <span style={{ fontWeight: 600, color: TLP.navy }}>{level?.name}</span>
                            <span style={{ color: TLP.gray500 }}>{location?.name}</span>
                          </div>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ color: TLP.gray500 }}>{fmtDate(a.sessionDate)}</span>
                            <span style={{ color: TLP.gray600 }}>
                              {fmtTime(batch?.startTime ?? "")}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Assignment Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Assignment"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setShowAddModal(false)}>Add Assignment</Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: "block", marginBottom: 4 }}>
              Date
            </label>
            <input
              type="date"
              defaultValue="2026-05-04"
              style={{
                border: `1.5px solid ${TLP.gray200}`,
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 14,
                color: TLP.gray800,
                outline: "none",
                width: "100%",
                background: TLP.white,
              }}
            />
          </div>
          <Select
            label="Batch / Level"
            options={[
              { value: "", label: "Select batch" },
              { value: "bat_chess_pp_mon", label: "Chess PP — Mon 4pm (Surrey)" },
              { value: "bat_chess_rr_tue", label: "Chess RR — Tue 5:30pm (Surrey)" },
              { value: "bat_math_g5_wed", label: "Math G5 — Wed 4:30pm (Surrey)" },
            ]}
          />
          <Select
            label="Coach"
            options={COACH_SELECT_OPTIONS}
          />
        </div>
      </Modal>
    </div>
  );
}
