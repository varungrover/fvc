"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatTile } from "@/components/ui/StatTile";
import { TLP } from "@/lib/theme/tokens";

const AVATAR_COLORS = [TLP.teal, TLP.purple, TLP.navy, TLP.blue];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CustomerDashboardClient({ 
  customer, 
  members, 
  enrollments, 
  invoices,
  userName 
}: any) {
  const router = useRouter();

  const activeEnrollments = enrollments.filter((e: any) => e.status === "active");
  const monthlyTotal = activeEnrollments.reduce((sum: number, enr: any) => sum + (Number(enr.offering_price) || 0), 0);
  const gst = Math.round(monthlyTotal * 0.05 * 100) / 100;

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
            Welcome back, {userName.split(" ")[0]}!
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
          value={`${customer.loyalty_points || 0} pts`}
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
        {/* Left: members */}
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
          {members.length === 0 && (
            <Card style={{ padding: 40, textAlign: "center", color: TLP.gray400 }}>
               No members added yet. 
            </Card>
          )}
          {members.map((m: any, i: number) => {
            const memberEnrollments = activeEnrollments.filter((e: any) => e.member_id === m.id);
            return (
              <Card key={m.id} style={{ padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Avatar name={m.full_name} size={42} color={AVATAR_COLORS[i % AVATAR_COLORS.length]} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: TLP.navy }}>{m.full_name}</div>
                    <div style={{ fontSize: 12, color: TLP.gray500 }}>
                      {m.grade ? `${m.grade} · ` : ""}DOB: {m.dob}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: TLP.teal, fontWeight: 700 }}>
                    {memberEnrollments.length} ENROLLMENTS
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right column: Recent Payments */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: "18px 20px" }}>
            <SectionHeader title="Recent Payments" />
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {invoices.length === 0 && <div style={{ fontSize: 12, color: TLP.gray400 }}>No payment history.</div>}
              {invoices.slice(0, 3).map((inv: any) => {
                const isPaid = inv.status === "paid";
                return (
                  <div key={inv.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{new Date(inv.issued_at).toLocaleDateString()}</div>
                      <div style={{ fontSize: 11, color: TLP.gray500 }}>Invoice #{inv.id.slice(0, 8)}</div>
                    </div>
                    <Badge label={isPaid ? "Paid" : "Pending"} color={isPaid ? TLP.green : TLP.amber} bg={isPaid ? TLP.greenLight : TLP.amberLight} />
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
