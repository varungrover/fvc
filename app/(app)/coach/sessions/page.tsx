"use client";

import { useState } from "react";
import { Badge, PlanetBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { BATCHES } from "@/lib/mock/batches";
import { ENROLLMENTS_BY_BATCH } from "@/lib/mock/enrollments";
import { ROSTER_ASSIGNMENTS } from "@/lib/mock/roster";
import { SESSIONS, SESSION_NOTES } from "@/lib/mock/sessions";
import { MEMBER_BY_ID } from "@/lib/mock/members";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { LOCATION_BY_ID } from "@/lib/mock/locations";
import type { RosterAssignment } from "@/lib/types";

const COACH_ID = "coach_priya";
const TODAY = "2026-05-04";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h > 12 ? h - 12 : h || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

const myBatches = BATCHES.filter((b) => b.coachId === COACH_ID);
const myBatchIds = new Set(myBatches.map((b) => b.id));

const allAssignments = ROSTER_ASSIGNMENTS.filter((a) => a.coachId === COACH_ID);

const historicalSessions = SESSIONS.filter((s) => myBatchIds.has(s.batchId));

type SessionRow = {
  id: string;
  sessionDate: string;
  batchId: string;
  source: "assignment" | "historical";
  assignmentId?: string;
};

const deduped = new Map<string, SessionRow>();

allAssignments.forEach((a) => {
  const key = `${a.batchId}_${a.sessionDate}`;
  if (!deduped.has(key)) {
    deduped.set(key, {
      id: a.id,
      sessionDate: a.sessionDate,
      batchId: a.batchId,
      source: "assignment",
      assignmentId: a.id,
    });
  }
});

historicalSessions.forEach((s) => {
  const key = `${s.batchId}_${s.sessionDate}`;
  if (!deduped.has(key)) {
    deduped.set(key, {
      id: s.id,
      sessionDate: s.sessionDate,
      batchId: s.batchId,
      source: "historical",
    });
  }
});

const SESSION_ROWS: SessionRow[] = Array.from(deduped.values()).sort(
  (a, b) => b.sessionDate.localeCompare(a.sessionDate),
);

type AttendStatus = "present" | "absent" | "makeup";

interface AttendanceState {
  [memberId: string]: AttendStatus;
}

interface NotesState {
  topic: string;
  homework: string;
}

const TABS = [
  { id: "all", label: "All" },
  { id: "upcoming", label: "Upcoming" },
  { id: "completed", label: "Completed" },
];

export default function SessionsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [modalRow, setModalRow] = useState<SessionRow | null>(null);
  const [attendance, setAttendance] = useState<AttendanceState>({});
  const [notes, setNotes] = useState<NotesState>({ topic: "", homework: "" });
  const [saved, setSaved] = useState(false);

  const filtered = SESSION_ROWS.filter((row) => {
    if (activeTab === "upcoming") return row.sessionDate >= TODAY;
    if (activeTab === "completed") return row.sessionDate < TODAY;
    return true;
  });

  function openModal(row: SessionRow) {
    const enrollments = ENROLLMENTS_BY_BATCH[row.batchId] ?? [];
    const init: AttendanceState = {};
    enrollments.forEach((e) => {
      init[e.memberId] = "present";
    });
    const existingNote = SESSION_NOTES.find((n) => {
      const s = SESSIONS.find((ss) => ss.batchId === row.batchId && ss.sessionDate === row.sessionDate);
      return s && n.sessionId === s.id;
    });
    setAttendance(init);
    setNotes({
      topic: existingNote?.topicCovered ?? "",
      homework: existingNote?.homeworkNotes ?? "",
    });
    setSaved(false);
    setModalRow(row);
  }

  function closeModal() {
    setModalRow(null);
  }

  function handleSave() {
    setSaved(true);
  }

  const modalBatch = modalRow ? myBatches.find((b) => b.id === modalRow.batchId) : null;
  const modalLevel = modalBatch ? LEVEL_BY_ID[modalBatch.levelId] : null;
  const modalPlanet = modalLevel ? PLANET_BY_ID[modalLevel.planetId] : null;
  const modalEnrollments = modalRow ? (ENROLLMENTS_BY_BATCH[modalRow.batchId] ?? []) : [];

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Sessions"
        subtitle="Track attendance and write session notes for your batches"
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              color: TLP.gray400,
              fontSize: 14,
            }}
          >
            No sessions found.
          </div>
        )}

        {filtered.map((row) => {
          const batch = myBatches.find((b) => b.id === row.batchId);
          if (!batch) return null;
          const level = LEVEL_BY_ID[batch.levelId];
          const planet = level ? PLANET_BY_ID[level.planetId] : null;
          const location = LOCATION_BY_ID[batch.locationId];
          const enrolled = (ENROLLMENTS_BY_BATCH[batch.id] ?? []).length;
          const isCompleted = row.sessionDate < TODAY;
          const ps = planet ? planetStyle(planet.name) : null;

          return (
            <Card
              key={row.id}
              style={{ padding: "14px 20px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                {ps && (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: ps.bg,
                      color: ps.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {ps.icon}
                  </div>
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: TLP.navy }}>
                      {planet?.name} · {level?.name}
                    </span>
                    {isCompleted ? (
                      <Badge label="✓ Done" color={TLP.green} bg={TLP.greenLight} />
                    ) : (
                      <Badge label="Upcoming" color={TLP.blue} bg={TLP.blueLight} />
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 3 }}>
                    {row.sessionDate} · {DAYS[batch.dayOfWeek]} · {fmtTime(batch.startTime)}–{fmtTime(batch.endTime)}
                    &nbsp;·&nbsp;{location?.name}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TLP.teal }}>
                      {enrolled}/{batch.capacity}
                    </div>
                    <div style={{ fontSize: 11, color: TLP.gray500 }}>enrolled</div>
                  </div>
                  <Button
                    variant={isCompleted ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => openModal(row)}
                  >
                    {isCompleted ? "View Notes" : "Mark Attendance"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Attendance Modal */}
      <Modal
        open={!!modalRow}
        onClose={closeModal}
        title={`Attendance — ${modalPlanet?.name} ${modalLevel?.name} · ${modalRow?.sessionDate}`}
        width={580}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Close
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saved}>
              {saved ? "Saved ✓" : "Save Attendance & Notes"}
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Attendance roster */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: TLP.gray500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 10,
              }}
            >
              Student Attendance
            </div>
            {modalEnrollments.length === 0 ? (
              <div style={{ fontSize: 13, color: TLP.gray400 }}>No enrolled students.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {modalEnrollments.map((enr) => {
                  const member = MEMBER_BY_ID[enr.memberId];
                  const status = attendance[enr.memberId] ?? "present";

                  return (
                    <div
                      key={enr.memberId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 14px",
                        borderRadius: 9,
                        background: TLP.gray50,
                        border: `1px solid ${TLP.gray100}`,
                      }}
                    >
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: TLP.teal,
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      >
                        {(member?.fullName ?? "?")[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>
                          {member?.fullName ?? enr.memberId}
                        </div>
                        <div style={{ fontSize: 11, color: TLP.gray500 }}>{member?.grade ?? ""}</div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        {(["present", "absent", "makeup"] as AttendStatus[]).map((s) => (
                          <button
                            key={s}
                            onClick={() =>
                              setAttendance((prev) => ({ ...prev, [enr.memberId]: s }))
                            }
                            style={{
                              padding: "4px 10px",
                              borderRadius: 6,
                              border: `1.5px solid ${status === s ? (s === "present" ? TLP.teal : s === "absent" ? TLP.red : TLP.amber) : TLP.gray200}`,
                              background:
                                status === s
                                  ? s === "present"
                                    ? TLP.tealLight
                                    : s === "absent"
                                      ? TLP.redLight
                                      : TLP.amberLight
                                  : TLP.white,
                              color:
                                status === s
                                  ? s === "present"
                                    ? TLP.teal
                                    : s === "absent"
                                      ? TLP.red
                                      : TLP.amber
                                  : TLP.gray400,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              textTransform: "capitalize",
                              fontFamily: "inherit",
                            }}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Session notes */}
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: TLP.gray500,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: 10,
              }}
            >
              Session Notes
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: TLP.navy,
                    marginBottom: 5,
                  }}
                >
                  Topic Covered
                </label>
                <textarea
                  value={notes.topic}
                  onChange={(e) => setNotes((n) => ({ ...n, topic: e.target.value }))}
                  rows={2}
                  placeholder="What was covered in this session?"
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: `1.5px solid ${TLP.gray200}`,
                    fontSize: 13,
                    color: TLP.gray700,
                    fontFamily: "inherit",
                    resize: "vertical",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: TLP.navy,
                    marginBottom: 5,
                  }}
                >
                  Homework Notes
                </label>
                <textarea
                  value={notes.homework}
                  onChange={(e) => setNotes((n) => ({ ...n, homework: e.target.value }))}
                  rows={2}
                  placeholder="Homework assigned or notes for parents..."
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: `1.5px solid ${TLP.gray200}`,
                    fontSize: 13,
                    color: TLP.gray700,
                    fontFamily: "inherit",
                    resize: "vertical",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>

          {saved && (
            <div
              style={{
                background: TLP.greenLight,
                border: `1px solid ${TLP.green}`,
                borderRadius: 8,
                padding: "10px 14px",
                fontSize: 13,
                color: TLP.green,
                fontWeight: 600,
              }}
            >
              Attendance and notes saved successfully (prototype — not persisted).
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
