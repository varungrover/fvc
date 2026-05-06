"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatTile } from "@/components/ui/StatTile";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { LOCATIONS_BY_TENANT } from "@/lib/mock/locations";
import { BATCHES, BATCH_BY_ID, BATCHES_BY_LOCATION } from "@/lib/mock/batches";
import { COACHES } from "@/lib/mock/coaches";
import { CUSTOMERS } from "@/lib/mock/customers";
import { ENROLLMENTS } from "@/lib/mock/enrollments";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { PRICE_REQUESTS } from "@/lib/mock/priceRequests";

const MLA_TEAL = "#0a9b8a";

const MLA_LOCATIONS = LOCATIONS_BY_TENANT["ten_mla"] ?? [];
const MLA_LOC_IDS = new Set(MLA_LOCATIONS.map((l) => l.id));
const MLA_BATCHES = BATCHES.filter((b) => MLA_LOC_IDS.has(b.locationId));
const MLA_COACHES = COACHES.filter((c) => c.ownershipId === "ten_mla");
const MLA_ACTIVE_STUDENT_IDS = new Set(
  ENROLLMENTS.filter(
    (e) => e.status === "active" && MLA_BATCHES.some((b) => b.id === e.batchId),
  ).map((e) => e.memberId),
);
const PENDING_REQUESTS = PRICE_REQUESTS.filter((r) => r.status === "pending");

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h > 12 ? h - 12 : h || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

const COURSE_VARIANT_LABELS: Record<string, string> = {
  "lvl_chess_pp_1x": "Chess PP · 1x/week",
  "lvl_fin_basics_1x": "Finance Basics · 1x/week",
  "lvl_math_g5_1x": "Math Grade 5 · 1x/week",
  "lvl_fin_invest_1x": "Finance Investment · 1x/week",
};

export default function FranchiseeAdminDashboard() {
  const router = useRouter();

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome banner */}
      <div
        style={{
          background: `linear-gradient(135deg, ${MLA_TEAL} 0%, #077d6e 100%)`,
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
          <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 4 }}>Franchisee Admin · Maple Leaf Academy</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.3px" }}>
            Welcome back, Jordan!
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.75 }}>
            Canadian academies for tomorrow's leaders · {MLA_LOCATIONS.length} locations · Ontario, Canada
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="secondary"
            onClick={() => router.push("/franchisee-admin/price-requests")}
            icon="💰"
            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff" }}
          >
            Price Requests
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/franchisee-admin/roster")}
            style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)", color: "#fff" }}
          >
            Manage Roster
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <StatTile
          label="Locations"
          value={MLA_LOCATIONS.length}
          icon="📍"
          iconBg={TLP.tealLight}
          iconColor={MLA_TEAL}
          onClick={() => router.push("/franchisee-admin/locations")}
        />
        <StatTile
          label="Active Coaches"
          value={MLA_COACHES.filter((c) => c.status === "active").length}
          icon="🧑‍🏫"
          iconBg={TLP.blueLight}
          iconColor={TLP.blue}
          onClick={() => router.push("/franchisee-admin/coaches")}
        />
        <StatTile
          label="Active Students"
          value={MLA_ACTIVE_STUDENT_IDS.size === 0 ? CUSTOMERS.length : MLA_ACTIVE_STUDENT_IDS.size}
          icon="🎓"
          iconBg={TLP.purpleLight}
          iconColor={TLP.purple}
          onClick={() => router.push("/franchisee-admin/customers")}
        />
        <StatTile
          label="Pending Requests"
          value={PENDING_REQUESTS.length}
          delta={PENDING_REQUESTS.length > 0 ? "Needs attention" : "All clear"}
          deltaColor={PENDING_REQUESTS.length > 0 ? TLP.amber : TLP.green}
          icon="📋"
          iconBg={TLP.amberLight}
          iconColor={TLP.amber}
          onClick={() => router.push("/franchisee-admin/price-requests")}
        />
      </div>

      {/* Pending price requests alert */}
      {PENDING_REQUESTS.length > 0 && (
        <Card style={{ padding: 0, overflow: "hidden", border: `1.5px solid ${TLP.amber}` }}>
          <div
            style={{
              padding: "12px 20px",
              background: TLP.amberLight,
              borderBottom: `1px solid ${TLP.amber}30`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>⏳</span>
              <span style={{ fontWeight: 700, color: TLP.amber, fontSize: 14 }}>
                {PENDING_REQUESTS.length} Price Request{PENDING_REQUESTS.length > 1 ? "s" : ""} Awaiting Review
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/franchisee-admin/price-requests")}>
              View all →
            </Button>
          </div>
          {PENDING_REQUESTS.map((req, i) => (
            <div
              key={req.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 20px",
                borderBottom: i < PENDING_REQUESTS.length - 1 ? `1px solid ${TLP.gray100}` : "none",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: TLP.navy }}>
                  {COURSE_VARIANT_LABELS[req.courseVariantId] ?? req.courseVariantId}
                </div>
                <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
                  ${req.currentPrice} → ${req.requestedPrice} · Submitted {fmtDate(req.submittedAt)}
                </div>
              </div>
              <Badge label="Pending" color={TLP.amber} bg={TLP.amberLight} />
            </div>
          ))}
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
        {/* Left: MLA batches overview */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${TLP.gray100}` }}>
            <SectionHeader
              title="Active Batches"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push("/franchisee-admin/roster")}>
                  View Roster →
                </Button>
              }
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 120px 100px",
              padding: "8px 20px",
              background: TLP.gray50,
              fontSize: 11,
              fontWeight: 700,
              color: TLP.gray500,
              textTransform: "uppercase",
              letterSpacing: "0.4px",
              gap: 8,
            }}
          >
            <span>Batch</span>
            <span>Location</span>
            <span>Schedule</span>
            <span>Coach</span>
          </div>
          {MLA_BATCHES.filter((b) => b.isActive).map((batch, i) => {
            const level = LEVEL_BY_ID[batch.levelId];
            const planet = level ? PLANET_BY_ID[level.planetId] : null;
            const pStyle = planetStyle(planet?.name ?? "");
            const loc = MLA_LOCATIONS.find((l) => l.id === batch.locationId);
            const coach = COACHES.find((c) => c.id === batch.coachId);
            return (
              <div
                key={batch.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 120px 100px",
                  padding: "12px 20px",
                  fontSize: 13,
                  gap: 8,
                  borderBottom: i < MLA_BATCHES.length - 1 ? `1px solid ${TLP.gray100}` : "none",
                  alignItems: "center",
                }}
              >
                <div>
                  <span
                    style={{
                      background: pStyle.bg,
                      color: pStyle.color,
                      padding: "1px 7px",
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
                <span style={{ color: TLP.gray600, fontSize: 12 }}>{loc?.city ?? "—"}</span>
                <span style={{ color: TLP.gray500, fontSize: 12 }}>
                  {DAYS[batch.dayOfWeek]}s {fmtTime(batch.startTime)}
                </span>
                <span style={{ fontSize: 12, color: coach ? TLP.navy : TLP.amber, fontWeight: coach ? 500 : 700 }}>
                  {coach ? coach.fullName.split(" ")[0] : "Unassigned"}
                </span>
              </div>
            );
          })}
        </Card>

        {/* Right: quick actions */}
        <Card style={{ padding: "18px 20px" }}>
          <SectionHeader title="Quick Actions" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "Manage Locations", icon: "📍", path: "/franchisee-admin/locations" },
              { label: "Manage Coaches", icon: "🧑‍🏫", path: "/franchisee-admin/coaches" },
              { label: "View Customers", icon: "👨‍👩‍👧", path: "/franchisee-admin/customers" },
              { label: "View Roster", icon: "📋", path: "/franchisee-admin/roster" },
              { label: "Price Requests", icon: "💰", path: "/franchisee-admin/price-requests" },
              { label: "Support Tickets", icon: "🎫", path: "/franchisee-admin/tickets" },
            ].map((action) => (
              <button
                key={action.path}
                onClick={() => router.push(action.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: `1.5px solid ${TLP.gray200}`,
                  background: TLP.white,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: TLP.navy,
                  textAlign: "left",
                  width: "100%",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = MLA_TEAL)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = TLP.gray200)}
              >
                <span style={{ fontSize: 18 }}>{action.icon}</span>
                {action.label}
                <span style={{ marginLeft: "auto", color: TLP.gray400 }}>→</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
