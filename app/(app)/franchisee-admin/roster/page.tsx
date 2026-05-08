"use client";

import { useState } from "react";
import { Check, Crown, Calculator, BookOpen, DollarSign, Palette, Briefcase, Globe } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { BATCHES } from "@/lib/mock/batches";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { LOCATION_BY_ID } from "@/lib/mock/locations";
import { COACHES } from "@/lib/mock/coaches";

function getPlanetIcon(name: string, size = 20) {
  switch (name) {
    case "Chess": return <Crown size={size} strokeWidth={2} />;
    case "Math":
    case "Maths": return <Calculator size={size} strokeWidth={2} />;
    case "English": return <BookOpen size={size} strokeWidth={2} />;
    case "Finance": return <DollarSign size={size} strokeWidth={2} />;
    case "Arts": return <Palette size={size} strokeWidth={2} />;
    case "Business": return <Briefcase size={size} strokeWidth={2} />;
    default: return <Globe size={size} strokeWidth={2} />;
  }
}

const MLA_TEAL = "#0a9b8a";

const MLA_LOC_IDS = new Set(["loc_mla_toronto", "loc_mla_mississauga", "loc_mla_brampton"]);
const MLA_BATCHES = BATCHES.filter((b) => MLA_LOC_IDS.has(b.locationId) && b.isActive);
const MLA_COACHES = COACHES.filter((c) => c.ownershipId === "ten_mla");

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAYS_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h > 12 ? h - 12 : h || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

const BASE_DATE = new Date("2026-05-04T00:00:00");

function getSessionsForTwoWeeks() {
  const sessions: { date: string; dayOfWeek: number; batchId: string }[] = [];
  for (let day = 0; day < 14; day++) {
    const d = new Date(BASE_DATE);
    d.setDate(BASE_DATE.getDate() + day);
    const dow = d.getDay();
    const dateStr = d.toISOString().slice(0, 10);
    MLA_BATCHES.forEach((b) => {
      if (b.dayOfWeek === dow) {
        sessions.push({ date: dateStr, dayOfWeek: dow, batchId: b.id });
      }
    });
  }
  return sessions.sort((a, b) => a.date.localeCompare(b.date));
}

const TWO_WEEK_SESSIONS = getSessionsForTwoWeeks();

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

export default function FranchiseeRosterPage() {
  const [showPublishToast, setShowPublishToast] = useState(false);

  function handlePublish() {
    setShowPublishToast(true);
    setTimeout(() => setShowPublishToast(false), 3000);
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Roster"
        subtitle="Maple Leaf Academy — 2-week rolling roster"
        actions={
          <Button variant="primary" onClick={handlePublish}>
            Publish Roster
          </Button>
        }
      />

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
          <Check size={16} /> Roster published successfully
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Coach summary */}
        <div style={{ display: "flex", gap: 14 }}>
          {MLA_COACHES.map((coach) => {
            const sessions = TWO_WEEK_SESSIONS.filter((s) => {
              const batch = MLA_BATCHES.find((b) => b.id === s.batchId);
              return batch?.coachId === coach.id;
            });
            return (
              <Card
                key={coach.id}
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  flex: 1,
                  border: `1.5px solid ${MLA_TEAL}30`,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: MLA_TEAL,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {coach.fullName.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: TLP.navy }}>{coach.fullName}</div>
                  <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
                    {sessions.length} session{sessions.length !== 1 ? "s" : ""} · next 2 weeks
                  </div>
                </div>
                <Badge label="Active" color={TLP.green} bg={TLP.greenLight} />
              </Card>
            );
          })}
        </div>

        {/* Session list */}
        <Card style={{ overflow: "hidden", padding: 0 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 200px 180px 140px 130px",
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

          {TWO_WEEK_SESSIONS.length === 0 ? (
            <div style={{ padding: "32px 20px", textAlign: "center", color: TLP.gray400, fontSize: 14 }}>
              No sessions in the next two weeks.
            </div>
          ) : (
            TWO_WEEK_SESSIONS.map((session, i) => {
              const batch = MLA_BATCHES.find((b) => b.id === session.batchId);
              if (!batch) return null;
              const level = LEVEL_BY_ID[batch.levelId];
              const planet = level ? PLANET_BY_ID[level.planetId] : null;
              const pStyle = planetStyle(planet?.name ?? "");
              const location = LOCATION_BY_ID[batch.locationId];
              const coach = batch.coachId ? MLA_COACHES.find((c) => c.id === batch.coachId) : null;

              return (
                <div
                  key={`${session.date}-${session.batchId}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 200px 180px 140px 130px",
                    padding: "12px 20px",
                    fontSize: 13,
                    gap: 8,
                    borderBottom: i < TWO_WEEK_SESSIONS.length - 1 ? `1px solid ${TLP.gray100}` : "none",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: TLP.navy }}>{fmtDate(session.date)}</div>
                    <div style={{ fontSize: 11, color: TLP.gray500 }}>{DAYS_SHORT[session.dayOfWeek]}</div>
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
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {getPlanetIcon(planet?.name ?? "", 14)} {planet?.name}
                      </span>
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
                    {fmtTime(batch.startTime)} – {fmtTime(batch.endTime)}
                  </span>
                </div>
              );
            })
          )}
        </Card>

        {/* Calendar view — 2 week grid */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: TLP.navy, marginBottom: 12 }}>
            Calendar — May 4–17, 2026
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 8,
            }}
          >
            {Array.from({ length: 14 }, (_, i) => {
              const d = new Date(BASE_DATE);
              d.setDate(BASE_DATE.getDate() + i);
              const dateStr = d.toISOString().slice(0, 10);
              const dow = d.getDay();
              const daySessions = TWO_WEEK_SESSIONS.filter((s) => s.date === dateStr);

              return (
                <div key={dateStr}>
                  <div
                    style={{
                      textAlign: "center",
                      marginBottom: 6,
                      fontWeight: 700,
                      fontSize: 12,
                      color: daySessions.length > 0 ? TLP.navy : TLP.gray400,
                    }}
                  >
                    {DAYS_SHORT[dow]}
                    <div style={{ fontSize: 11, fontWeight: 400, color: TLP.gray500 }}>{fmtDate(dateStr)}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5, minHeight: 60 }}>
                    {daySessions.length === 0 ? (
                      <div
                        style={{
                          background: TLP.gray50,
                          borderRadius: 7,
                          minHeight: 52,
                          border: `1px dashed ${TLP.gray200}`,
                        }}
                      />
                    ) : (
                      daySessions.map((s) => {
                        const batch = MLA_BATCHES.find((b) => b.id === s.batchId);
                        if (!batch) return null;
                        const level = LEVEL_BY_ID[batch.levelId];
                        const planet = level ? PLANET_BY_ID[level.planetId] : null;
                        const pStyle = planetStyle(planet?.name ?? "");
                        const coach = batch.coachId ? MLA_COACHES.find((c) => c.id === batch.coachId) : null;
                        return (
                          <div
                            key={s.batchId}
                            style={{
                              background: pStyle.bg,
                              border: `1px solid ${pStyle.color}40`,
                              borderRadius: 7,
                              padding: "6px 8px",
                            }}
                          >
                            <div style={{ fontSize: 11, fontWeight: 700, color: pStyle.color, display: 'flex', alignItems: 'center', gap: 4 }}>
                              {getPlanetIcon(planet?.name ?? "", 12)} {planet?.name}
                            </div>
                            <div style={{ fontSize: 10, color: TLP.navy, fontWeight: 600 }}>{level?.name}</div>
                            <div style={{ fontSize: 10, color: TLP.gray600, marginTop: 1 }}>{fmtTime(batch.startTime)}</div>
                            <div style={{ fontSize: 10, color: TLP.gray600, marginTop: 1 }}>
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
      </div>
    </div>
  );
}
