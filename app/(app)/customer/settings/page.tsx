"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Lock, Star, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageHeader } from "@/components/layout/PageHeader";
import { TLP } from "@/lib/theme/tokens";
import { DEMO_CUSTOMER } from "@/lib/mock/customers";
import { DEMO_ACCOUNTS } from "@/lib/mock/auth";

const CUSTOMER_ID = "cust_raj";

function mask(value: string, showCount = 4) {
  if (!value) return "—";
  const visible = value.slice(-showCount);
  return "•".repeat(Math.max(0, value.length - showCount)) + visible;
}

export default function SettingsPage() {
  const customer = DEMO_CUSTOMER;
  const account = DEMO_ACCOUNTS.find((a) => a.customerId === CUSTOMER_ID);

  const [piiRevealed, setPiiRevealed] = useState(false);
  const [notifClass, setNotifClass] = useState(true);
  const [notifPayment, setNotifPayment] = useState(true);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwSaved, setPwSaved] = useState(false);

  function handleSavePassword() {
    if (!pwForm.current || !pwForm.next || pwForm.next !== pwForm.confirm) return;
    setPwSaved(true);
    setPwForm({ current: "", next: "", confirm: "" });
    setTimeout(() => setPwSaved(false), 3000);
  }

  return (
    <div style={{ padding: 24, maxWidth: 720 }}>
      <PageHeader title="Account Settings" subtitle="Manage your profile and preferences" />

      {/* Profile card */}
      <Section title="Profile">
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>
          <Avatar name={customer.fullName} size={64} color={TLP.teal} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: TLP.navy }}>
              {customer.fullName}
            </div>
            <div style={{ fontSize: 13, color: TLP.gray500, marginTop: 3 }}>
              {account?.email}
            </div>
            <div style={{ marginTop: 6 }}>
              <Badge label="Customer" color={TLP.teal} bg={TLP.tealLight} />
              {customer.cfcId && (
                <Badge
                  label={`CFC: ${customer.cfcId}`}
                  color={TLP.blue}
                  bg={TLP.blueLight}
                />
              )}
            </div>
          </div>
          <Button variant="secondary" size="sm">
            Change Photo
          </Button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <InfoRow
            label="Full Name"
            value={customer.fullName}
            sensitive={false}
            revealed={piiRevealed}
          />
          <InfoRow
            label="Email"
            value={account?.email ?? "—"}
            sensitive
            revealed={piiRevealed}
          />
          <InfoRow
            label="Date of Birth"
            value={customer.dob}
            sensitive
            revealed={piiRevealed}
          />
          <InfoRow
            label="Phone"
            value={customer.phone}
            sensitive
            revealed={piiRevealed}
          />
          <InfoRow
            label="Gender"
            value={customer.gender ?? "—"}
            sensitive
            revealed={piiRevealed}
          />
          <InfoRow
            label="Emergency Contact"
            value={customer.emergencyContact ?? "—"}
            sensitive
            revealed={piiRevealed}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            background: TLP.amberLight,
            borderRadius: 8,
            fontSize: 12,
            color: TLP.gray700,
          }}
        >
          <span style={{ display: "flex", color: TLP.amber }}>
            <Lock size={16} strokeWidth={2.5} />
          </span>
          <span style={{ flex: 1 }}>
            Personal information is masked. Reveal requires 2FA verification.
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPiiRevealed((v) => !v)}
          >
            {piiRevealed ? "Hide" : "Reveal (2FA)"}
          </Button>
        </div>
      </Section>

      {/* Loyalty */}
      <Section title="Loyalty Points">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 20px",
            background: "#fff8e1",
            borderRadius: 10,
            border: `1px solid #fde68a`,
          }}
        >
          <span style={{ display: "flex", color: TLP.amber }}>
            <Star size={32} fill={TLP.amber} />
          </span>
          <div>
            <div style={{ fontSize: 24, fontWeight: 800, color: TLP.navy }}>
              {customer.loyaltyPoints} pts
            </div>
            <div style={{ fontSize: 13, color: TLP.gray500 }}>
              Earn 1 point per $1 spent · Redemption coming in a future phase
            </div>
          </div>
        </div>
      </Section>

      {/* Password */}
      <Section title="Password & Security">
        {pwSaved && (
          <div
            style={{
              background: TLP.greenLight,
              border: `1px solid ${TLP.green}`,
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: TLP.green,
              fontWeight: 600,
              marginBottom: 14,
              display: "flex",
              gap: 8,
            }}
          >
            <Check size={16} strokeWidth={3} /> Password changed successfully (prototype — no real change persisted)
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input
            label="Current Password"
            type="password"
            value={pwForm.current}
            onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
            placeholder="Enter current password"
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input
              label="New Password"
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
              placeholder="At least 8 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
              placeholder="Repeat new password"
              error={
                pwForm.confirm && pwForm.next !== pwForm.confirm
                  ? "Passwords do not match"
                  : undefined
              }
            />
          </div>
          <div>
            <Button
              variant="primary"
              onClick={handleSavePassword}
              disabled={
                !pwForm.current ||
                !pwForm.next ||
                !pwForm.confirm ||
                pwForm.next !== pwForm.confirm
              }
            >
              Change Password
            </Button>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            paddingTop: 20,
            borderTop: `1px solid ${TLP.gray100}`,
          }}
        >
          <div style={{ fontWeight: 600, color: TLP.navy, fontSize: 14, marginBottom: 8 }}>
            Two-Factor Authentication
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderRadius: 9,
              border: `1.5px solid ${TLP.gray200}`,
              background: TLP.gray50,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700 }}>
                SMS / Authenticator App
              </div>
              <div style={{ fontSize: 12, color: TLP.gray400, marginTop: 2 }}>
                Required for all logins and PII access
              </div>
            </div>
            <Badge label="Not set up" color={TLP.red} bg={TLP.redLight} />
          </div>
          <Button variant="secondary" size="sm" style={{ marginTop: 10 }}>
            Set up 2FA
          </Button>
        </div>
      </Section>

      {/* Notification preferences */}
      <Section title="Notifications">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <NotifToggle
            label="Missed class alerts"
            description="Email when a member misses a scheduled class"
            value={notifClass}
            onChange={setNotifClass}
          />
          <NotifToggle
            label="Payment reminders & failures"
            description="Email for upcoming charges and failed payments"
            value={notifPayment}
            onChange={setNotifPayment}
          />
        </div>
        <p style={{ margin: "14px 0 0", fontSize: 11, color: TLP.gray400 }}>
          SMS notifications are available in a future phase. All notifications are email only
          at launch.
        </p>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone">
        <div
          style={{
            padding: "16px 18px",
            borderRadius: 10,
            border: `1.5px solid ${TLP.red}`,
            background: TLP.redLight,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: TLP.red, fontSize: 13 }}>
              Delete Account
            </div>
            <div style={{ fontSize: 12, color: TLP.gray600, marginTop: 2 }}>
              Permanently removes your account and all member profiles. Cannot be undone.
            </div>
          </div>
          <Button variant="danger" size="sm">
            Delete Account
          </Button>
        </div>
      </Section>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={{ padding: "20px 24px", marginBottom: 20 }}>
      <h3
        style={{
          margin: "0 0 16px",
          fontSize: 14,
          fontWeight: 700,
          color: TLP.gray500,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </h3>
      {children}
    </Card>
  );
}

// ── Info row with masking ──────────────────────────────────────────

function InfoRow({
  label,
  value,
  sensitive,
  revealed,
}: {
  label: string;
  value: string;
  sensitive: boolean;
  revealed: boolean;
}) {
  const display = sensitive && !revealed ? mask(value, 0) : value;
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: TLP.gray400, marginBottom: 4 }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          color: sensitive && !revealed ? TLP.gray300 : TLP.navy,
          fontWeight: 500,
          letterSpacing: sensitive && !revealed ? "2px" : "normal",
          padding: "7px 12px",
          background: TLP.bg,
          borderRadius: 8,
          minHeight: 36,
          display: "flex",
          alignItems: "center",
        }}
      >
        {sensitive && !revealed ? "••••••••" : display}
      </div>
    </div>
  );
}

// ── Notification toggle ────────────────────────────────────────────

function NotifToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: TLP.navy }}>{label}</div>
        <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>{description}</div>
      </div>
      <button
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        style={{
          width: 44,
          height: 24,
          borderRadius: 12,
          background: value ? TLP.teal : TLP.gray300,
          border: "none",
          cursor: "pointer",
          position: "relative",
          transition: "background 0.2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: value ? 23 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#fff",
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </div>
  );
}
