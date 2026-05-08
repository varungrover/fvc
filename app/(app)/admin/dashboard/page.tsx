"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, UserRound, MapPin, DollarSign, ClipboardList, CreditCard, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatTile } from "@/components/ui/StatTile";
import { TLP } from "@/lib/theme/tokens";
import { INVOICES, INVOICES_BY_CUSTOMER } from "@/lib/mock/invoices";
import { ENROLLMENTS } from "@/lib/mock/enrollments";
import { CUSTOMERS, CUSTOMER_BY_ID } from "@/lib/mock/customers";
import { BATCHES } from "@/lib/mock/batches";
import { BATCH_BY_ID } from "@/lib/mock/batches";
import { LEVEL_BY_ID } from "@/lib/mock/levels";
import { PLANET_BY_ID } from "@/lib/mock/planets";
import { MEMBER_BY_ID } from "@/lib/mock/members";
import { COACHES } from "@/lib/mock/coaches";
import { LOCATIONS_BY_TENANT } from "@/lib/mock/locations";

const TLP_LOCATIONS = LOCATIONS_BY_TENANT["ten_tlp"] ?? [];
const TLP_LOC_IDS = new Set(TLP_LOCATIONS.map((l) => l.id));

const tlpBatches = BATCHES.filter((b) => TLP_LOC_IDS.has(b.locationId));
const tlpCoaches = COACHES.filter((c) => c.ownershipId === "ten_tlp");

const tlpEnrollments = ENROLLMENTS.filter((e) =>
  tlpBatches.some((b) => b.id === e.batchId),
);

const tlpCustomerIds = new Set(CUSTOMERS.map((c) => c.id));
const tlpInvoices = INVOICES.filter((i) => tlpCustomerIds.has(i.customerId));

const monthlyRevenue = tlpInvoices
  .filter((i) => i.status === "paid" && i.issuedAt.startsWith("2026-04"))
  .reduce((sum, i) => sum + i.total, 0);

const failedInvoices = tlpInvoices.filter((i) => i.status === "failed");

const unassignedBatches = tlpBatches.filter((b) => !b.coachId);

const recentEnrollments = [...tlpEnrollments]
  .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
  .slice(0, 5);

const uniqueStudents = new Set(tlpEnrollments.filter((e) => e.status === "active").map((e) => e.memberId)).size;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h > 12 ? h - 12 : h || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visibleFailed = failedInvoices.filter((i) => !dismissed.has(i.id));

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
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Franchisor Admin</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.3px" }}>
            Welcome back, Mira!
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.75 }}>
            The Learning Planet · {TLP_LOCATIONS.length} locations · {tlpCoaches.filter((c) => c.status === "active").length} active coaches
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="amber" onClick={() => router.push("/admin/coaches")} icon={<UserRound size={15} strokeWidth={2.5} />}>
            Add Coach
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/admin/roster")}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}
          >
            Manage Roster
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <StatTile
          label="Total Students"
          value={uniqueStudents}
          icon={<GraduationCap size={22} strokeWidth={1.75} />}
          iconBg={TLP.tealLight}
          iconColor={TLP.teal}
          onClick={() => router.push("/admin/customers")}
        />
        <StatTile
          label="Active Coaches"
          value={tlpCoaches.filter((c) => c.status === "active").length}
          delta={`${tlpCoaches.filter((c) => c.status === "on_leave").length} on leave`}
          deltaColor={TLP.amber}
          icon={<UserRound size={22} strokeWidth={1.75} />}
          iconBg={TLP.blueLight}
          iconColor={TLP.blue}
          onClick={() => router.push("/admin/coaches")}
        />
        <StatTile
          label="Locations"
          value={TLP_LOCATIONS.length}
          icon={<MapPin size={22} strokeWidth={1.75} />}
          iconBg={TLP.purpleLight}
          iconColor={TLP.purple}
          onClick={() => router.push("/admin/locations")}
        />
        <StatTile
          label="Monthly Revenue"
          value={`$${monthlyRevenue.toFixed(0)}`}
          delta="April 2026"
          deltaColor={TLP.gray500}
          icon={<DollarSign size={22} strokeWidth={1.75} />}
          iconBg={TLP.amberLight}
          iconColor={TLP.amber}
          onClick={() => router.push("/admin/payments")}
        />
      </div>

      {/* Missed payments alert */}
      {visibleFailed.length > 0 && (
        <Card style={{ padding: 0, overflow: "hidden", border: `1.5px solid ${TLP.red}` }}>
          <div
            style={{
              padding: "12px 20px",
              background: TLP.redLight,
              borderBottom: `1px solid ${TLP.red}20`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TriangleAlert size={18} strokeWidth={2} color={TLP.red} />
              <span style={{ fontWeight: 700, color: TLP.red, fontSize: 14 }}>
                {visibleFailed.length} Missed Payment{visibleFailed.length > 1 ? "s" : ""}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/payments")}>
              View all →
            </Button>
          </div>
          {visibleFailed.map((inv, i) => {
            const customer = CUSTOMER_BY_ID[inv.customerId];
            return (
              <div
                key={inv.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 20px",
                  borderBottom: i < visibleFailed.length - 1 ? `1px solid ${TLP.gray100}` : "none",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: TLP.navy }}>
                    {customer?.fullName ?? inv.customerId}
                  </div>
                  <div style={{ fontSize: 12, color: TLP.gray500 }}>
                    ${inv.total.toFixed(2)} · {new Date(inv.issuedAt).toLocaleDateString("en-CA", { month: "long", year: "numeric" })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Button variant="danger" size="sm" onClick={() => setDismissed((d) => new Set([...d, inv.id]))}>
                    Retry
                  </Button>
                  <Button variant="ghost" size="sm" style={{ color: TLP.gray500 }} onClick={() => setDismissed((d) => new Set([...d, inv.id]))}>
                    Dismiss
                  </Button>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
        {/* Left: recent enrollments */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${TLP.gray100}` }}>
              <SectionHeader
                title="Recent Enrollments"
                action={
                  <Button variant="ghost" size="sm" onClick={() => router.push("/admin/customers")}>
                    View all →
                  </Button>
                }
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 140px 80px",
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
              <span>Member</span>
              <span>Batch</span>
              <span>Enrolled</span>
              <span>Status</span>
            </div>
            {recentEnrollments.map((enr, i) => {
              const member = MEMBER_BY_ID[enr.memberId];
              const batch = BATCH_BY_ID[enr.batchId];
              const level = batch ? LEVEL_BY_ID[batch.levelId] : null;
              const planet = level ? PLANET_BY_ID[level.planetId] : null;
              return (
                <div
                  key={enr.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 140px 80px",
                    padding: "12px 20px",
                    fontSize: 13,
                    gap: 8,
                    borderBottom: i < recentEnrollments.length - 1 ? `1px solid ${TLP.gray100}` : "none",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontWeight: 600, color: TLP.navy }}>{member?.fullName ?? "—"}</span>
                  <span style={{ color: TLP.gray600 }}>
                    {planet?.name} · {level?.name} · {DAYS[batch?.dayOfWeek ?? 0]}s {fmtTime(batch?.startTime ?? "")}
                  </span>
                  <span style={{ color: TLP.gray500 }}>
                    {new Date(enr.enrolledAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <Badge
                    label={enr.status === "active" ? "Active" : enr.status}
                    color={enr.status === "active" ? TLP.green : TLP.gray500}
                    bg={enr.status === "active" ? TLP.greenLight : TLP.gray100}
                  />
                </div>
              );
            })}
          </Card>
        </div>

        {/* Right: staff coverage */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: "18px 20px" }}>
            <SectionHeader
              title="Staff Coverage Gaps"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push("/admin/roster")}>
                  Fix →
                </Button>
              }
            />
            {unassignedBatches.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "20px 0",
                  color: TLP.green,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <GraduationCap size={16} /> All batches have coaches assigned
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {unassignedBatches.map((b) => {
                  const level = LEVEL_BY_ID[b.levelId];
                  const planet = level ? PLANET_BY_ID[level.planetId] : null;
                  return (
                    <div
                      key={b.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        background: TLP.amberLight,
                        borderRadius: 8,
                        border: `1px solid ${TLP.amber}40`,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>
                          {planet?.name} · {level?.name}
                        </div>
                        <div style={{ fontSize: 11, color: TLP.gray600 }}>
                          {DAYS[b.dayOfWeek]}s {fmtTime(b.startTime)}
                        </div>
                      </div>
                      <Badge label="Unassigned" color={TLP.amber} bg={TLP.amberLight} />
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Quick actions */}
          <Card style={{ padding: "18px 20px" }}>
            <SectionHeader title="Quick Actions" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {([
                { label: "Add Coach", icon: <UserRound size={18} strokeWidth={1.75} />, path: "/admin/coaches" },
                { label: "Manage Roster", icon: <ClipboardList size={18} strokeWidth={1.75} />, path: "/admin/roster" },
                { label: "View Payments", icon: <CreditCard size={18} strokeWidth={1.75} />, path: "/admin/payments" },
                { label: "Manage Locations", icon: <MapPin size={18} strokeWidth={1.75} />, path: "/admin/locations" },
              ] as { label: string; icon: React.ReactNode; path: string }[]).map((action) => (
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
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = TLP.teal)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = TLP.gray200)}
                >
                  <span style={{ display: "flex", alignItems: "center", color: TLP.teal }}>{action.icon}</span>
                  {action.label}
                  <span style={{ marginLeft: "auto", color: TLP.gray400 }}>→</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
