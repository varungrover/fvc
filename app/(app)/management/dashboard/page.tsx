"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { StatTile } from "@/components/ui/StatTile";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TLP } from "@/lib/theme/tokens";
import { PRICE_REQUESTS } from "@/lib/mock/priceRequests";
import { TENANT_BY_ID } from "@/lib/mock/tenants";

const pendingRequests = PRICE_REQUESTS.filter((r) => r.status === "pending");

const REVENUE_DATA = [
  { month: "February 2026", tlp: 1251, mla: 2100 },
  { month: "March 2026", tlp: 1251, mla: 2250 },
  { month: "April 2026", tlp: 1252, mla: 2400 },
];

const QUICK_ACTIONS = [
  { label: "Revenue Pivot", icon: "📊", path: "/management/revenue" },
  { label: "Pricing Requests", icon: "💲", path: "/management/pricing" },
  { label: "All Locations", icon: "📍", path: "/management/locations" },
  { label: "Reports", icon: "📄", path: "/management/reports" },
];

export default function ManagementDashboard() {
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
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>Franchisor Management</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, letterSpacing: "-0.3px" }}>
            Welcome back, Anika!
          </h1>
          <p style={{ margin: "6px 0 0", fontSize: 13, opacity: 0.75 }}>
            Network-wide overview · 2 ownerships · 6 locations · 6 coaches
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button variant="amber" onClick={() => router.push("/management/revenue")} icon="📊">
            Revenue Pivot
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/management/pricing")}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}
          >
            Pricing Requests
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        <StatTile
          label="Total Ownerships"
          value={2}
          icon="🏢"
          iconBg={TLP.purpleLight}
          iconColor={TLP.purple}
        />
        <StatTile
          label="Total Locations"
          value={6}
          delta="3 TLP · 3 MLA"
          deltaColor={TLP.gray500}
          icon="📍"
          iconBg={TLP.blueLight}
          iconColor={TLP.blue}
          onClick={() => router.push("/management/locations")}
        />
        <StatTile
          label="Total Coaches"
          value={6}
          delta="5 TLP · 1 MLA"
          deltaColor={TLP.gray500}
          icon="🧑‍🏫"
          iconBg={TLP.tealLight}
          iconColor={TLP.teal}
        />
        <StatTile
          label="Network Revenue"
          value="$3,652"
          delta="April 2026"
          deltaColor={TLP.green}
          icon="💰"
          iconBg={TLP.amberLight}
          iconColor={TLP.amber}
          onClick={() => router.push("/management/revenue")}
        />
        <StatTile
          label="Pending Requests"
          value={pendingRequests.length}
          delta={pendingRequests.length > 0 ? "Needs review" : "All clear"}
          deltaColor={pendingRequests.length > 0 ? TLP.amber : TLP.green}
          icon="📋"
          iconBg={pendingRequests.length > 0 ? TLP.amberLight : TLP.greenLight}
          iconColor={pendingRequests.length > 0 ? TLP.amber : TLP.green}
          onClick={() => router.push("/management/pricing")}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 20 }}>
        {/* Left: Revenue by ownership */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${TLP.gray100}` }}>
            <SectionHeader
              title="Revenue by Ownership — Last 3 Months"
              action={
                <Button variant="ghost" size="sm" onClick={() => router.push("/management/revenue")}>
                  Full pivot →
                </Button>
              }
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
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
            <span>Month</span>
            <span>TLP (BC)</span>
            <span>MLA (ON)</span>
            <span>Network Total</span>
          </div>
          {REVENUE_DATA.map((row, i) => (
            <div
              key={row.month}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                padding: "14px 20px",
                fontSize: 13,
                gap: 8,
                borderBottom: i < REVENUE_DATA.length - 1 ? `1px solid ${TLP.gray100}` : "none",
                alignItems: "center",
              }}
            >
              <span style={{ fontWeight: 600, color: TLP.navy }}>{row.month}</span>
              <span style={{ color: TLP.navy, fontWeight: 600 }}>
                ${row.tlp.toLocaleString()}
                <span
                  style={{
                    display: "inline-block",
                    marginLeft: 6,
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: TLP.navy,
                    verticalAlign: "middle",
                    opacity: 0.4,
                  }}
                />
              </span>
              <span style={{ color: TLP.teal, fontWeight: 600 }}>
                ${row.mla.toLocaleString()}
                <span
                  style={{
                    display: "inline-block",
                    marginLeft: 6,
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: TLP.teal,
                    verticalAlign: "middle",
                    opacity: 0.4,
                  }}
                />
              </span>
              <span style={{ fontWeight: 700, color: TLP.gray800 }}>
                ${(row.tlp + row.mla).toLocaleString()}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr",
              padding: "12px 20px",
              fontSize: 13,
              gap: 8,
              background: TLP.gray50,
              alignItems: "center",
              borderTop: `2px solid ${TLP.gray200}`,
            }}
          >
            <span style={{ fontWeight: 700, color: TLP.gray700 }}>Q1 Total</span>
            <span style={{ fontWeight: 700, color: TLP.navy }}>
              ${REVENUE_DATA.reduce((s, r) => s + r.tlp, 0).toLocaleString()}
            </span>
            <span style={{ fontWeight: 700, color: TLP.teal }}>
              ${REVENUE_DATA.reduce((s, r) => s + r.mla, 0).toLocaleString()}
            </span>
            <span style={{ fontWeight: 700, color: TLP.gray800 }}>
              ${REVENUE_DATA.reduce((s, r) => s + r.tlp + r.mla, 0).toLocaleString()}
            </span>
          </div>
        </Card>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Pending price requests */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${TLP.gray100}` }}>
              <SectionHeader
                title="Pending Pricing Requests"
                action={
                  <Button variant="ghost" size="sm" onClick={() => router.push("/management/pricing")}>
                    Review →
                  </Button>
                }
              />
            </div>
            {pendingRequests.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: TLP.green, fontSize: 13, fontWeight: 600 }}>
                ✓ No pending requests
              </div>
            ) : (
              <div>
                {pendingRequests.map((req, i) => {
                  const ownership = TENANT_BY_ID[req.requestingOwnershipId];
                  const delta = req.requestedPrice - req.currentPrice;
                  return (
                    <div
                      key={req.id}
                      style={{
                        padding: "12px 20px",
                        borderBottom: i < pendingRequests.length - 1 ? `1px solid ${TLP.gray100}` : "none",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>
                          {ownership?.fullName ?? req.requestingOwnershipId}
                        </div>
                        <div style={{ fontSize: 11, color: TLP.gray500, marginTop: 2 }}>
                          ${req.currentPrice} → ${req.requestedPrice}
                          <span style={{ color: TLP.green, marginLeft: 4 }}>+${delta}</span>
                        </div>
                      </div>
                      <Badge label="Pending" color={TLP.amber} bg={TLP.amberLight} />
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
              {QUICK_ACTIONS.map((action) => (
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
                  <span style={{ fontSize: 18 }}>{action.icon}</span>
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
