"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { TLP } from "@/lib/theme/tokens";
import { BATCHES } from "@/lib/mock/batches";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { COACH_AVAILABILITY, COACH_LEAVES } from "@/lib/mock/coaches";

const COACH_ID = "coach_priya";
const TODAY = "2026-05-04";

const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAYS_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NUM = [1, 2, 3, 4, 5, 6, 0] as const;

const TIME_BLOCKS = [
  { id: "morning", label: "Morning", range: "8am – 12pm" },
  { id: "afternoon", label: "Afternoon", range: "12pm – 5pm" },
  { id: "evening", label: "Evening", range: "5pm – 9pm" },
];

const WEEK_TABS = [
  { id: "this", label: "This Week" },
  { id: "next", label: "Next Week" },
  { id: "six", label: "Next 6 Months" },
];

type BlockKey = `${number}_${string}`;

const myBatches = BATCHES.filter((b) => b.coachId === COACH_ID);
const myAvailability = COACH_AVAILABILITY.filter((a) => a.coachId === COACH_ID);

const myLeaves = COACH_LEAVES.filter((l) => l.coachId === COACH_ID);

function initialBlocks(): Set<BlockKey> {
  const set = new Set<BlockKey>();
  myAvailability.forEach((a) => {
    const dayIdx = DAY_NUM.indexOf(a.dayOfWeek as typeof DAY_NUM[number]);
    const startHour = parseInt(a.startTime.split(":")[0]);
    const endHour = parseInt(a.endTime.split(":")[0]);
    if (startHour < 12) set.add(`${dayIdx}_morning`);
    if (startHour < 17 && endHour > 12) set.add(`${dayIdx}_afternoon`);
    if (endHour >= 17) set.add(`${dayIdx}_evening`);
  });
  return set;
}

function getCommittedBlocks(dayIdx: number): string[] {
  const dow = DAY_NUM[dayIdx];
  const batches = myBatches.filter((b) => b.dayOfWeek === dow);
  return batches.flatMap((b) => {
    const startHour = parseInt(b.startTime.split(":")[0]);
    const endHour = parseInt(b.endTime.split(":")[0]);
    const blocks: string[] = [];
    if (startHour < 12) blocks.push("morning");
    if (startHour < 17 && endHour > 12) blocks.push("afternoon");
    if (endHour >= 17) blocks.push("evening");
    return blocks;
  });
}

interface LeaveEntry {
  id: string;
  date: string;
  reason: string;
}

export default function AvailabilityPage() {
  const [activeWeekTab, setActiveWeekTab] = useState("this");
  const [availableBlocks, setAvailableBlocks] = useState<Set<BlockKey>>(initialBlocks());
  const [leaves, setLeaves] = useState<LeaveEntry[]>(
    myLeaves.map((l) => ({ id: l.id, date: l.leaveDate, reason: l.reason ?? "" })),
  );
  const [showAddLeave, setShowAddLeave] = useState(false);
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [saved, setSaved] = useState(false);

  function toggleBlock(dayIdx: number, blockId: string) {
    const key: BlockKey = `${dayIdx}_${blockId}`;
    const committed = getCommittedBlocks(dayIdx);
    if (committed.includes(blockId)) return;
    setAvailableBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setSaved(false);
  }

  function handleAddLeave() {
    if (!leaveDate) return;
    setLeaves((prev) => [
      ...prev,
      { id: `leave_new_${Date.now()}`, date: leaveDate, reason: leaveReason },
    ]);
    setLeaveDate("");
    setLeaveReason("");
    setShowAddLeave(false);
  }

  function removeLeave(id: string) {
    setLeaves((prev) => prev.filter((l) => l.id !== id));
  }

  const upcomingLeaves = leaves.filter((l) => l.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Availability"
        subtitle="Set your weekly availability and manage upcoming leaves"
        actions={
          <Button variant="primary" onClick={() => setSaved(true)}>
            {saved ? "Saved ✓" : "Save Availability"}
          </Button>
        }
      />

      {saved && (
        <div
          style={{
            background: TLP.greenLight,
            border: `1px solid ${TLP.green}`,
            borderRadius: 9,
            padding: "10px 16px",
            fontSize: 13,
            color: TLP.green,
            fontWeight: 600,
          }}
        >
          Availability saved successfully (prototype — not persisted).
        </div>
      )}

      <Tabs tabs={WEEK_TABS} active={activeWeekTab} onChange={setActiveWeekTab} />

      {activeWeekTab !== "six" ? (
        /* Weekly grid */
        <Card style={{ padding: "20px 24px", overflow: "auto" }}>
          <div style={{ marginBottom: 16 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: TLP.navy,
                marginBottom: 6,
              }}
            >
              {activeWeekTab === "this"
                ? "Week of May 4 – May 10, 2026"
                : "Week of May 11 – May 17, 2026"}
            </div>
            <div style={{ display: "flex", gap: 12, fontSize: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: TLP.tealLight,
                    border: `1.5px solid ${TLP.teal}`,
                  }}
                />
                <span style={{ color: TLP.gray600 }}>Available</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: TLP.navy,
                  }}
                />
                <span style={{ color: TLP.gray600 }}>Committed (batch)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: TLP.gray100,
                    border: `1.5px solid ${TLP.gray200}`,
                  }}
                />
                <span style={{ color: TLP.gray600 }}>Unavailable</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "100px repeat(7, 1fr)", gap: 4 }}>
            {/* Header row */}
            <div />
            {DAYS_SHORT.map((d, i) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: TLP.navy,
                  padding: "6px 0",
                }}
              >
                {d}
              </div>
            ))}

            {/* Time block rows */}
            {TIME_BLOCKS.map((block) => (
              <>
                <div
                  key={`label_${block.id}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    paddingRight: 8,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: TLP.gray700 }}>
                    {block.label}
                  </div>
                  <div style={{ fontSize: 10, color: TLP.gray400 }}>{block.range}</div>
                </div>

                {DAYS_SHORT.map((_, dayIdx) => {
                  const key: BlockKey = `${dayIdx}_${block.id}`;
                  const isAvailable = availableBlocks.has(key);
                  const committed = getCommittedBlocks(dayIdx);
                  const isCommitted = committed.includes(block.id);

                  const batchesHere = isCommitted
                    ? myBatches
                        .filter((b) => b.dayOfWeek === DAY_NUM[dayIdx])
                        .map((b) => {
                          const l = LEVEL_BY_ID[b.levelId];
                          const p = l ? PLANET_BY_ID[l.planetId] : null;
                          return `${p?.name ?? ""} ${l?.name ?? ""}`;
                        })
                        .join(", ")
                    : "";

                  return (
                    <div
                      key={key}
                      onClick={() => !isCommitted && toggleBlock(dayIdx, block.id)}
                      title={isCommitted ? `Committed: ${batchesHere}` : undefined}
                      style={{
                        height: 48,
                        borderRadius: 8,
                        cursor: isCommitted ? "not-allowed" : "pointer",
                        background: isCommitted
                          ? TLP.navy
                          : isAvailable
                            ? TLP.tealLight
                            : TLP.gray100,
                        border: `1.5px solid ${isCommitted ? TLP.navyLight : isAvailable ? TLP.teal : TLP.gray200}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s",
                        fontSize: 11,
                        color: isCommitted ? "#fff" : isAvailable ? TLP.teal : TLP.gray300,
                        fontWeight: 700,
                        overflow: "hidden",
                        padding: "0 4px",
                        textAlign: "center",
                      }}
                    >
                      {isCommitted ? "🏫" : isAvailable ? "✓" : ""}
                    </div>
                  );
                })}
              </>
            ))}
          </div>

          {/* Committed batches legend */}
          <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {myBatches.map((b) => {
              const l = LEVEL_BY_ID[b.levelId];
              const p = l ? PLANET_BY_ID[l.planetId] : null;
              const dow = DAYS_FULL[DAY_NUM.indexOf(b.dayOfWeek as typeof DAY_NUM[number])];
              return (
                <div
                  key={b.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 12px",
                    borderRadius: 20,
                    background: TLP.navyLight,
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <span>🏫</span>
                  <span>
                    {p?.name} {l?.name} · {dow}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* 6-month calendar overview */
        <Card style={{ padding: "20px 24px" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: TLP.navy, marginBottom: 16 }}>
            May – October 2026 Overview
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {["May 2026", "Jun 2026", "Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026"].map(
              (month) => (
                <div
                  key={month}
                  style={{
                    background: TLP.gray50,
                    borderRadius: 10,
                    padding: "14px 16px",
                    border: `1px solid ${TLP.gray100}`,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: TLP.navy, marginBottom: 8 }}>
                    {month}
                  </div>
                  <div style={{ fontSize: 12, color: TLP.gray500 }}>
                    {myBatches.length} recurring batch{myBatches.length !== 1 ? "es" : ""}
                  </div>
                  <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
                    {leaves.filter((l) => l.date.startsWith(month.split(" ")[0].slice(0, 3))).length > 0
                      ? `${leaves.filter((l) => l.date.startsWith(month.split(" ")[0].slice(0, 3))).length} leave day(s)`
                      : "No leaves"}
                  </div>
                </div>
              ),
            )}
          </div>
          <div
            style={{
              marginTop: 14,
              fontSize: 12,
              color: TLP.gray400,
            }}
          >
            Full calendar view coming in a future sprint.
          </div>
        </Card>
      )}

      {/* Leave / Absence section */}
      <Card style={{ padding: "20px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: TLP.navy }}>
              Leave &amp; Absences
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: TLP.gray500 }}>
              Upcoming leave will show as unavailable in your roster.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setShowAddLeave(true)} icon="➕">
            Add Leave
          </Button>
        </div>

        {upcomingLeaves.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "24px 0",
              fontSize: 13,
              color: TLP.gray400,
            }}
          >
            No upcoming leaves scheduled.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {upcomingLeaves.map((leave) => (
              <div
                key={leave.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "11px 16px",
                  borderRadius: 10,
                  background: TLP.redLight,
                  border: `1px solid ${TLP.red}30`,
                }}
              >
                <span style={{ fontSize: 20 }}>🗓️</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TLP.navy }}>
                    {new Date(leave.date).toLocaleDateString("en-CA", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  {leave.reason && (
                    <div style={{ fontSize: 12, color: TLP.gray600, marginTop: 2 }}>
                      {leave.reason}
                    </div>
                  )}
                </div>
                <Badge label="Leave" color={TLP.red} bg={TLP.redLight} />
                <button
                  onClick={() => removeLeave(leave.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 16,
                    color: TLP.gray400,
                    padding: "0 2px",
                    lineHeight: 1,
                  }}
                  aria-label="Remove leave"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Add Leave Modal */}
      <Modal
        open={showAddLeave}
        onClose={() => {
          setShowAddLeave(false);
          setLeaveDate("");
          setLeaveReason("");
        }}
        title="Add Leave / Absence"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAddLeave(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddLeave} disabled={!leaveDate}>
              Add Leave
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Date"
            type="date"
            value={leaveDate}
            onChange={(e) => setLeaveDate(e.target.value)}
            required
          />
          <Input
            label="Reason (optional)"
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
            placeholder="e.g. Personal day, Medical"
          />
          <div
            style={{
              padding: "10px 14px",
              background: TLP.amberLight,
              borderRadius: 8,
              fontSize: 12,
              color: TLP.gray700,
            }}
          >
            The roster team will be notified of your leave and will arrange a substitute coach.
          </div>
        </div>
      </Modal>
    </div>
  );
}
