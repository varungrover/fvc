"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, PlanetBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatTile } from "@/components/ui/StatTile";
import { TLP } from "@/lib/theme/tokens";
import { DEMO_CUSTOMER } from "@/lib/mock/customers";
import { MEMBERS_BY_CUSTOMER } from "@/lib/mock/members";
import { ENROLLMENTS } from "@/lib/mock/enrollments";
import { BATCH_BY_ID } from "@/lib/mock/batches";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { VARIANT_BY_ID } from "@/lib/mock/courseVariants";
import { LOCATION_BY_ID } from "@/lib/mock/locations";
import { INVOICES_BY_CUSTOMER } from "@/lib/mock/invoices";

const CUSTOMER_ID = "cust_raj";
const AVATAR_COLORS = [TLP.teal, TLP.purple, TLP.navy, TLP.blue];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const UPCOMING_EVENTS = [
  { id: "ev1", title: "Surrey Chess Tournament", date: "May 17, 2026", location: "Surrey Central", type: "Tournament", fee: 20 },
  { id: "ev2", title: "Monthly Trivia Night", date: "May 24, 2026", location: "Abbotsford", type: "Event", fee: 0 },
  { id: "ev3", title: "Math Summer Camp", date: "Jul 7–11, 2026", location: "Surrey Central", type: "Camp", fee: 299 },
];

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h > 12 ? h - 12 : h || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

function nextClassLabel(dayOfWeek: number) {
  // Mock "today" is 2026-05-03 (Sunday = 0)
  const base = new Date("2026-05-03T00:00:00");
  const diff = ((dayOfWeek - 0 + 7) % 7) || 7;
  const d = new Date(base);
  d.setDate(base.getDate() + diff);
  return d.toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric" });
}

export default function CustomerDashboard() {
  const router = useRouter();
  const customer = DEMO_CUSTOMER;
  const members = MEMBERS_BY_CUSTOMER[CUSTOMER_ID] ?? [];
  const activeEnrollments = ENROLLMENTS.filter(
    (e) => e.customerId === CUSTOMER_ID && e.status === "active",
  );

  const monthlyTotal = activeEnrollments.reduce((sum, enr) => {
    const batch = BATCH_BY_ID[enr.batchId];
    const variant = batch ? VARIANT_BY_ID[batch.courseVariantId] : null;
    return sum + (variant?.price ?? 0);
  }, 0);
  const gst = Math.round(monthlyTotal * 0.05 * 100) / 100;

  const invoices = [...(INVOICES_BY_CUSTOMER[CUSTOMER_ID] ?? [])].reverse();

  function getMemberEnrollments(memberId: string) {
    return activeEnrollments
      .filter((e) => e.memberId === memberId)
      .map((enr) => {
        const batch = BATCH_BY_ID[enr.batchId];
        const level = batch ? LEVEL_BY_ID[batch.levelId] : null;
        const planet = level ? PLANET_BY_ID[level.planetId] : null;
        const variant = batch ? VARIANT_BY_ID[batch.courseVariantId] : null;
        const location = batch ? LOCATION_BY_ID[batch.locationId] : null;
        return { enr, batch, level, planet, variant, location };
      });
  }

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
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Good morning 👋</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.3px" }}>
            Welcome back, {customer.fullName.split(" ")[0]}!
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.75 }}>
            {members.length} members · {activeEnrollments.length} active enrollments · CAD $
            {(monthlyTotal + gst).toFixed(2)}/mo
          </p>
        </div>
        <Button
          variant="amber"
          onClick={() => router.push("/customer/enroll")}
          icon="➕"
          style={{ whiteSpace: "nowrap", flexShrink: 0 }}
        >
          Enroll in Course
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
          label="Active Enrollments"
          value={activeEnrollments.length}
          icon="📚"
          iconBg={TLP.tealLight}
          iconColor={TLP.teal}
          onClick={() => router.push("/customer/enroll")}
        />
        <StatTile
          label="Monthly Total"
          value={`$${monthlyTotal}`}
          delta="+5% GST"
          deltaColor={TLP.gray500}
          icon="💳"
          iconBg={TLP.amberLight}
          iconColor={TLP.amber}
          onClick={() => router.push("/customer/payments")}
        />
        <StatTile
          label="Loyalty Points"
          value={`${customer.loyaltyPoints} pts`}
          delta="Earn 1 pt per $1"
          deltaColor={TLP.gray500}
          icon="⭐"
          iconBg="#fff8e1"
          iconColor="#d4a017"
        />
        <StatTile
          label="Members"
          value={members.length}
          icon="👨‍👩‍👧"
          iconBg={TLP.blueLight}
          iconColor={TLP.blue}
          onClick={() => router.push("/customer/members")}
        />
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Left: members + schedules */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionHeader
            title="My Members"
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push("/customer/members")}
              >
                Manage Members
              </Button>
            }
          />
          {members.map((m, i) => {
            const memberEnrollments = getMemberEnrollments(m.id);
            const planetNames = [
              ...new Set(
                memberEnrollments.map((x) => x.planet?.name).filter(Boolean) as string[],
              ),
            ];
            return (
              <Card key={m.id} style={{ padding: "16px 20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    marginBottom: memberEnrollments.length > 0 ? 12 : 0,
                  }}
                >
                  <Avatar
                    name={m.fullName}
                    size={42}
                    color={AVATAR_COLORS[i % AVATAR_COLORS.length]}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: TLP.navy }}>
                      {m.fullName}
                    </div>
                    <div style={{ fontSize: 12, color: TLP.gray500 }}>
                      {m.grade ? `${m.grade} · ` : ""}DOB: ••/••/••••
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {planetNames.map((name) => (
                      <PlanetBadge key={name} planet={name} />
                    ))}
                  </div>
                </div>
                {memberEnrollments.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {memberEnrollments.map(({ enr, batch, level, planet, variant, location }) => (
                      <div
                        key={enr.id}
                        style={{
                          background: TLP.bg,
                          borderRadius: 8,
                          padding: "10px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>
                            {planet?.name} · {level?.name}
                          </div>
                          <div style={{ fontSize: 11, color: TLP.gray500 }}>
                            {location?.name} · {DAYS[batch?.dayOfWeek ?? 0]}s{" "}
                            {fmtTime(batch?.startTime ?? "")}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: TLP.teal }}>
                            ${variant?.price}/mo
                          </div>
                          <div style={{ fontSize: 11, color: TLP.gray500 }}>
                            Next: {nextClassLabel(batch?.dayOfWeek ?? 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: TLP.gray400, paddingTop: 4 }}>
                    No active enrollments ·{" "}
                    <span
                      style={{ color: TLP.teal, cursor: "pointer", fontWeight: 600 }}
                      onClick={() => router.push("/customer/enroll")}
                    >
                      Enroll now
                    </span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Upcoming events */}
          <Card style={{ padding: "18px 20px" }}>
            <SectionHeader
              title="Upcoming Events"
              action={<Button variant="ghost" size="sm">See all</Button>}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {UPCOMING_EVENTS.map((ev, i) => (
                <div
                  key={ev.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    paddingBottom: 12,
                    paddingTop: i > 0 ? 12 : 0,
                    borderBottom:
                      i < UPCOMING_EVENTS.length - 1 ? `1px solid ${TLP.gray100}` : "none",
                    gap: 8,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>
                      {ev.title}
                    </div>
                    <div style={{ fontSize: 11, color: TLP.gray500, marginTop: 2 }}>
                      {ev.date} · {ev.location}
                    </div>
                    <div style={{ marginTop: 5 }}>
                      <Badge
                        label={ev.type}
                        color={
                          ev.type === "Tournament"
                            ? TLP.teal
                            : ev.type === "Camp"
                              ? TLP.blue
                              : TLP.purple
                        }
                        bg={
                          ev.type === "Tournament"
                            ? TLP.tealLight
                            : ev.type === "Camp"
                              ? TLP.blueLight
                              : TLP.purpleLight
                        }
                      />
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" style={{ flexShrink: 0 }}>
                    {ev.fee === 0 ? "Free" : `$${ev.fee}`}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent payments */}
          <Card style={{ padding: "18px 20px" }}>
            <SectionHeader
              title="Recent Payments"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/customer/payments")}
                >
                  View all
                </Button>
              }
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {invoices.slice(0, 3).map((inv) => {
                const isPaid = inv.status === "paid";
                const dt = new Date(inv.issuedAt);
                const label = dt.toLocaleDateString("en-CA", {
                  month: "long",
                  year: "numeric",
                });
                return (
                  <div
                    key={inv.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{label}</div>
                      <div style={{ fontSize: 11, color: TLP.gray500 }}>
                        {dt.toLocaleDateString("en-CA", { month: "short", day: "numeric" })}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: TLP.navy }}>
                        ${inv.total.toFixed(2)}
                      </span>
                      <Badge
                        label={isPaid ? "Paid" : "Failed"}
                        color={isPaid ? TLP.green : TLP.red}
                        bg={isPaid ? TLP.greenLight : TLP.redLight}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
