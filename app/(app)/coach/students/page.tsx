"use client";

import { useState } from "react";
import { Crown, Calculator, BookOpen, DollarSign, Palette, Briefcase, Globe } from "lucide-react";
import type { ReactNode } from "react";
import { Badge, PlanetBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { BATCHES } from "@/lib/mock/batches";
import { ENROLLMENTS_BY_BATCH, ENROLLMENTS_BY_MEMBER } from "@/lib/mock/enrollments";
import { MEMBER_BY_ID, MEMBERS } from "@/lib/mock/members";
import { SESSIONS, SESSION_NOTES, ATTENDANCE_BY_MEMBER } from "@/lib/mock/sessions";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { LOCATION_BY_ID } from "@/lib/mock/locations";
import { LMS_QUIZ_ATTEMPTS, LMS_QUIZZES } from "@/lib/mock/lmsContent";
import type { Member } from "@/lib/types";

const COACH_ID = "coach_priya";
const TODAY = "2026-05-04";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h > 12 ? h - 12 : h || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

const myBatches = BATCHES.filter((b) => b.coachId === COACH_ID);
const myBatchIds = new Set(myBatches.map((b) => b.id));

interface StudentInfo {
  member: Member;
  batches: typeof myBatches;
  attendanceRate: number;
  lastSession: string | null;
}

function buildStudentList(): StudentInfo[] {
  const memberIds = new Set<string>();
  myBatches.forEach((b) => {
    (ENROLLMENTS_BY_BATCH[b.id] ?? []).forEach((e) => memberIds.add(e.memberId));
  });

  return Array.from(memberIds)
    .map((memberId) => {
      const member = MEMBER_BY_ID[memberId];
      if (!member) return null;

      const memberEnrollments = (ENROLLMENTS_BY_MEMBER[memberId] ?? []).filter((e) =>
        myBatchIds.has(e.batchId),
      );
      const memberBatches = memberEnrollments
        .map((e) => myBatches.find((b) => b.id === e.batchId))
        .filter(Boolean) as typeof myBatches;

      const memberAttendance = ATTENDANCE_BY_MEMBER[memberId] ?? [];
      const myAttendance = memberAttendance.filter((a) => {
        const session = SESSIONS.find((s) => s.id === a.sessionId);
        return session && myBatchIds.has(session.batchId);
      });
      const presentCount = myAttendance.filter((a) => a.status === "present").length;
      const attendanceRate =
        myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 0;

      const mySessions = SESSIONS.filter((s) => myBatchIds.has(s.batchId) && memberEnrollments.some((e) => e.batchId === s.batchId) && s.sessionDate < TODAY);
      const lastSession =
        mySessions.length > 0
          ? mySessions.sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))[0].sessionDate
          : null;

      return { member, batches: memberBatches, attendanceRate, lastSession };
    })
    .filter(Boolean) as StudentInfo[];
}

const ALL_STUDENTS = buildStudentList();

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const filtered = ALL_STUDENTS.filter((s) =>
    s.member.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  const detailStudent = selectedMember
    ? ALL_STUDENTS.find((s) => s.member.id === selectedMember) ?? null
    : null;

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Students"
        subtitle={`${ALL_STUDENTS.length} students across your batches`}
      />

      <div style={{ marginBottom: 16, maxWidth: 340 }}>
        <Input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        {filtered.map(({ member, batches, attendanceRate, lastSession }) => {
          const planets = [
            ...new Set(
              batches.map((b) => {
                const l = LEVEL_BY_ID[b.levelId];
                const p = l ? PLANET_BY_ID[l.planetId] : null;
                return p?.name;
              }).filter(Boolean) as string[],
            ),
          ];

          return (
            <Card
              key={member.id}
              hover
              onClick={() => setSelectedMember(member.id)}
              style={{ padding: 18, cursor: "pointer" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: TLP.navy,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {member.fullName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: TLP.navy }}>
                    {member.fullName}
                  </div>
                  <div style={{ fontSize: 12, color: TLP.gray500 }}>{member.grade ?? "—"}</div>
                </div>
                <Badge
                  label={`${attendanceRate}%`}
                  color={attendanceRate >= 80 ? TLP.green : attendanceRate >= 60 ? TLP.amber : TLP.red}
                  bg={attendanceRate >= 80 ? TLP.greenLight : attendanceRate >= 60 ? TLP.amberLight : TLP.redLight}
                />
              </div>

              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                {planets.map((p) => (
                  <PlanetBadge key={p} planet={p} />
                ))}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 12 }}>
                {batches.map((b) => {
                  const l = LEVEL_BY_ID[b.levelId];
                  return (
                    <div
                      key={b.id}
                      style={{ color: TLP.gray600 }}
                    >
                      {DAYS[b.dayOfWeek]}s {fmtTime(b.startTime)}–{fmtTime(b.endTime)}
                      {l ? ` · ${l.name}` : ""}
                    </div>
                  );
                })}
              </div>

              {lastSession && (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 11,
                    color: TLP.gray500,
                    borderTop: `1px solid ${TLP.gray100}`,
                    paddingTop: 8,
                  }}
                >
                  Last session: {lastSession}
                </div>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: "48px 0",
              color: TLP.gray400,
              fontSize: 14,
            }}
          >
            No students match your search.
          </div>
        )}
      </div>

      {/* Student detail modal */}
      <Modal
        open={!!detailStudent}
        onClose={() => setSelectedMember(null)}
        title={detailStudent?.member.fullName ?? "Student Detail"}
        width={560}
      >
        {detailStudent && <StudentDetail info={detailStudent} />}
      </Modal>
    </div>
  );
}

function StudentDetail({ info }: { info: StudentInfo }) {
  const { member, batches, attendanceRate } = info;

  const memberEnrollments = (ENROLLMENTS_BY_MEMBER[member.id] ?? []).filter((e) =>
    batches.some((b) => b.id === e.batchId),
  );

  const recentSessions = SESSIONS.filter((s) =>
    memberEnrollments.some((e) => e.batchId === s.batchId) && s.sessionDate < TODAY,
  )
    .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate))
    .slice(0, 3);

  const quizAttempts = LMS_QUIZ_ATTEMPTS.filter((a) => a.memberId === member.id);

  const STUB_NOTES = [
    { date: "2026-04-28", note: "Great focus today, finished all exercises." },
    { date: "2026-04-21", note: "Struggled with the fork tactic, needs practice." },
    { date: "2026-04-14", note: "Excellent opening play, remembered all principles." },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Profile */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "14px 16px",
          background: TLP.gray50,
          borderRadius: 10,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: TLP.navy,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {member.fullName[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: TLP.navy }}>{member.fullName}</div>
          <div style={{ fontSize: 13, color: TLP.gray500, marginTop: 2 }}>
            {member.grade ?? "Adult"}
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Badge
            label={`${attendanceRate}% attendance`}
            color={attendanceRate >= 80 ? TLP.green : attendanceRate >= 60 ? TLP.amber : TLP.red}
            bg={attendanceRate >= 80 ? TLP.greenLight : attendanceRate >= 60 ? TLP.amberLight : TLP.redLight}
            size="md"
          />
        </div>
      </div>

      {/* Enrollment details */}
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: TLP.gray500,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 8,
          }}
        >
          Enrollments
        </div>
        {batches.map((b) => {
          const level = LEVEL_BY_ID[b.levelId];
          const planet = level ? PLANET_BY_ID[level.planetId] : null;
          const location = LOCATION_BY_ID[b.locationId];
          const ps = planet ? planetStyle(planet.name) : null;

          return (
            <div
              key={b.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                background: TLP.bg,
                borderRadius: 8,
                marginBottom: 6,
              }}
            >
              {ps && (
                <span
                  style={{
                    background: ps.bg,
                    color: ps.color,
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {getPlanetIcon(planet?.name ?? "", 16)}
                </span>
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>
                  {planet?.name} · {level?.name}
                </div>
                <div style={{ fontSize: 11, color: TLP.gray500 }}>
                  {DAYS[b.dayOfWeek]}s {fmtTime(b.startTime)}–{fmtTime(b.endTime)} · {location?.name}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Last 3 session notes */}
      <div>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: TLP.gray500,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            marginBottom: 8,
          }}
        >
          Recent Coach Notes
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {STUB_NOTES.slice(0, 3).map((n, i) => (
            <div
              key={i}
              style={{
                padding: "10px 14px",
                background: TLP.gray50,
                borderRadius: 8,
                borderLeft: `3px solid ${TLP.teal}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: TLP.gray400,
                  marginBottom: 3,
                }}
              >
                {n.date}
              </div>
              <div style={{ fontSize: 13, color: TLP.gray700 }}>{n.note}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiz scores */}
      {quizAttempts.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: TLP.gray500,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 8,
            }}
          >
            Quiz Scores
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {quizAttempts.map((attempt) => {
              const quiz = LMS_QUIZZES.find((q) => q.id === attempt.quizId);
              const passed = attempt.score >= (quiz?.passingScorePct ?? 70);
              return (
                <div
                  key={attempt.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "8px 12px",
                    background: TLP.bg,
                    borderRadius: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>
                      {quiz?.title ?? "Quiz"}
                    </div>
                    <div style={{ fontSize: 11, color: TLP.gray500 }}>
                      {new Date(attempt.attemptedAt).toLocaleDateString("en-CA", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <Badge
                    label={`${attempt.score}%`}
                    color={passed ? TLP.green : TLP.red}
                    bg={passed ? TLP.greenLight : TLP.redLight}
                    size="md"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
