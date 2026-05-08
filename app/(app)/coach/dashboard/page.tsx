"use client";

import { useRouter } from "next/navigation";
import { CalendarDays, Users, Pencil, Building, CheckCircle, Crown, Calculator, BookOpen, DollarSign, Palette, Briefcase, Globe } from "lucide-react";
import type { ReactNode } from "react";
import { Badge, PlanetBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatTile } from "@/components/ui/StatTile";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { DEMO_COACH } from "@/lib/mock/coaches";
import { BATCHES } from "@/lib/mock/batches";
import { ENROLLMENTS_BY_BATCH } from "@/lib/mock/enrollments";
import { ROSTER_ASSIGNMENTS } from "@/lib/mock/roster";
import { SESSIONS, SESSION_NOTES } from "@/lib/mock/sessions";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { LOCATION_BY_ID } from "@/lib/mock/locations";

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

const coach = DEMO_COACH;
const myBatches = BATCHES.filter((b) => b.coachId === COACH_ID);
const myBatchIds = new Set(myBatches.map((b) => b.id));

const todaysAssignments = ROSTER_ASSIGNMENTS.filter(
  (a) => a.coachId === COACH_ID && a.sessionDate === TODAY,
);

const recentNotes = SESSION_NOTES.filter((n) => {
  const session = SESSIONS.find((s) => s.id === n.sessionId);
  return session && myBatchIds.has(session.batchId);
}).slice(-3).reverse();

const allStudentIds = new Set(
  myBatches.flatMap((b) => (ENROLLMENTS_BY_BATCH[b.id] ?? []).map((e) => e.memberId)),
);

export default function CoachDashboard() {
  const router = useRouter();

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${TLP.navy} 0%, ${TLP.navyLight} 100%)`,
          borderRadius: 14,
          padding: "22px 28px",
          color: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Good morning</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.3px" }}>
            Welcome back, {coach.fullName.split(" ")[0]}!
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.75 }}>
            {todaysAssignments.length} session{todaysAssignments.length !== 1 ? "s" : ""} today
            &nbsp;·&nbsp;{myBatches.length} batches&nbsp;·&nbsp;{allStudentIds.size} students
          </p>
        </div>
        <Button
          variant="amber"
          onClick={() => router.push("/coach/sessions")}
          icon={<CalendarDays size={16} strokeWidth={2.5} />}
          style={{ whiteSpace: "nowrap", flexShrink: 0 }}
        >
          Mark Attendance
        </Button>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
        }}
      >
        <StatTile
          label="Today's Sessions"
          value={todaysAssignments.length}
          icon={<CalendarDays size={20} />}
          iconBg={TLP.tealLight}
          iconColor={TLP.teal}
          onClick={() => router.push("/coach/sessions")}
        />
        <StatTile
          label="Total Students"
          value={allStudentIds.size}
          icon={<Users size={20} />}
          iconBg={TLP.blueLight}
          iconColor={TLP.blue}
          onClick={() => router.push("/coach/students")}
        />
        <StatTile
          label="Pending Notes"
          value={todaysAssignments.length}
          delta="From today's sessions"
          deltaColor={TLP.gray500}
          icon={<Pencil size={20} />}
          iconBg={TLP.amberLight}
          iconColor={TLP.amber}
        />
        <StatTile
          label="Batches Taught"
          value={myBatches.length}
          icon={<Building size={20} />}
          iconBg={TLP.purpleLight}
          iconColor={TLP.purple}
        />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Today's schedule */}
          <Card style={{ padding: "18px 20px" }}>
            <SectionHeader
              title="Today's Batches"
              subtitle={`${TODAY} (Monday)`}
              action={
                <Button variant="secondary" size="sm" onClick={() => router.push("/coach/sessions")}>
                  All sessions
                </Button>
              }
            />
            {todaysAssignments.length === 0 ? (
              <div style={{ fontSize: 13, color: TLP.gray400, textAlign: "center", padding: "24px 0" }}>
                No batches today.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {todaysAssignments.map((a) => {
                  const batch = myBatches.find((b) => b.id === a.batchId);
                  if (!batch) return null;
                  const level = LEVEL_BY_ID[batch.levelId];
                  const planet = level ? PLANET_BY_ID[level.planetId] : null;
                  const location = LOCATION_BY_ID[batch.locationId];
                  const enrolled = (ENROLLMENTS_BY_BATCH[batch.id] ?? []).length;
                  const ps = planet ? planetStyle(planet.name) : null;

                  return (
                    <div
                      key={a.id}
                      style={{
                        background: TLP.bg,
                        borderRadius: 10,
                        padding: "12px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                              flexShrink: 0,
                            }}
                          >
                            {getPlanetIcon(planet?.name ?? "", 20)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: TLP.navy }}>
                            {planet?.name} · {level?.name}
                          </div>
                          <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
                            {location?.name} · {fmtTime(batch.startTime)}–{fmtTime(batch.endTime)}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TLP.teal }}>
                          {enrolled}/{batch.capacity}
                        </div>
                        <div style={{ fontSize: 11, color: TLP.gray500 }}>enrolled</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent session notes */}
          <Card style={{ padding: "18px 20px" }}>
            <SectionHeader
              title="Recent Session Notes"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push("/coach/sessions")}>
                  View all
                </Button>
              }
            />
            {recentNotes.length === 0 ? (
              <div style={{ fontSize: 13, color: TLP.gray400, textAlign: "center", padding: "16px 0" }}>
                No notes yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentNotes.map((n) => {
                  const session = SESSIONS.find((s) => s.id === n.sessionId);
                  const batch = session ? myBatches.find((b) => b.id === session.batchId) : null;
                  const level = batch ? LEVEL_BY_ID[batch.levelId] : null;
                  const planet = level ? PLANET_BY_ID[level.planetId] : null;
                  return (
                    <div
                      key={n.id}
                      style={{
                        padding: "10px 14px",
                        background: TLP.gray50,
                        borderRadius: 9,
                        borderLeft: `3px solid ${TLP.teal}`,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: TLP.navy }}>
                          {planet?.name} · {level?.name}
                        </span>
                        <span style={{ fontSize: 11, color: TLP.gray400 }}>{session?.sessionDate}</span>
                      </div>
                      <div style={{ fontSize: 13, color: TLP.gray700 }}>{n.topicCovered}</div>
                      {n.homeworkNotes && (
                        <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 4 }}>
                          HW: {n.homeworkNotes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right column: my batches */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: "18px 20px" }}>
            <SectionHeader
              title="My Batches"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push("/coach/students")}>
                  Students
                </Button>
              }
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {myBatches.map((batch) => {
                const level = LEVEL_BY_ID[batch.levelId];
                const planet = level ? PLANET_BY_ID[level.planetId] : null;
                const enrolled = (ENROLLMENTS_BY_BATCH[batch.id] ?? []).length;
                const ps = planet ? planetStyle(planet.name) : null;

                return (
                  <div key={batch.id}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 6,
                      }}
                    >
                      {ps && (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: ps.bg,
                            color: ps.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {getPlanetIcon(planet?.name ?? "", 16)}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: TLP.navy }}>
                          {planet?.name} · {level?.name}
                        </div>
                        <div style={{ fontSize: 11, color: TLP.gray500 }}>
                          {DAYS[batch.dayOfWeek]}s {fmtTime(batch.startTime)}–{fmtTime(batch.endTime)}
                        </div>
                      </div>
                      <Badge
                        label={`${enrolled}/${batch.capacity}`}
                        color={enrolled >= batch.capacity ? TLP.red : TLP.teal}
                        bg={enrolled >= batch.capacity ? TLP.redLight : TLP.tealLight}
                      />
                    </div>
                    <ProgressBar
                      value={enrolled}
                      max={batch.capacity}
                      color={enrolled >= batch.capacity ? TLP.amber : TLP.teal}
                      height={5}
                    />
                    {batch !== myBatches[myBatches.length - 1] && (
                      <div style={{ borderBottom: `1px solid ${TLP.gray100}`, marginTop: 12 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick links */}
          <Card style={{ padding: "18px 20px" }}>
            <SectionHeader title="Quick Links" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Mark Attendance", href: "/coach/sessions", icon: <CheckCircle size={18} color={TLP.teal} /> },
                { label: "View Students", href: "/coach/students", icon: <Users size={18} color={TLP.blue} /> },
                { label: "LMS Authoring", href: "/coach/lms", icon: <Pencil size={18} color={TLP.purple} /> },
                { label: "Set Availability", href: "/coach/availability", icon: <CalendarDays size={18} color={TLP.amber} /> },
              ].map((link) => (
                <button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 9,
                    border: `1.5px solid ${TLP.gray200}`,
                    background: TLP.white,
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    color: TLP.navy,
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <span style={{ display: "flex", color: TLP.gray600 }}>{link.icon}</span>
                  {link.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
