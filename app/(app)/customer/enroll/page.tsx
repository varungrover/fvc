"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";
import { TLP, planetStyle } from "@/lib/theme/tokens";
import { MEMBERS_BY_CUSTOMER } from "@/lib/mock/members";
import { PLANETS } from "@/lib/mock/planets";
import { LEVELS_BY_PLANET } from "@/lib/mock/levels";
import { VARIANTS_BY_LEVEL } from "@/lib/mock/courseVariants";
import { BATCHES, BATCHES_BY_LOCATION } from "@/lib/mock/batches";
import { LOCATIONS } from "@/lib/mock/locations";
import { ENROLLMENTS_BY_BATCH } from "@/lib/mock/enrollments";
import { PAYMENT_METHODS } from "@/lib/mock/invoices";
import type { Member, Planet, Level, CourseVariant, Batch, Location } from "@/lib/types";

const CUSTOMER_ID = "cust_raj";
const AVATAR_COLORS = [TLP.teal, TLP.purple, TLP.navy, TLP.blue];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STEPS = [
  { id: "member", label: "Member" },
  { id: "course", label: "Planet & Level" },
  { id: "location", label: "Location" },
  { id: "schedule", label: "Schedule" },
  { id: "payment", label: "Payment" },
];

function fmtTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hr = h > 12 ? h - 12 : h || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, "0")}${ampm}`;
}

type Selection = {
  member: Member | null;
  planet: Planet | null;
  level: Level | null;
  variant: CourseVariant | null;
  location: Location | null;
  batch: Batch | null;
};

const BLANK: Selection = {
  member: null,
  planet: null,
  level: null,
  variant: null,
  location: null,
  batch: null,
};

export default function EnrollPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Selection>(BLANK);
  const [confirmed, setConfirmed] = useState(false);

  const members = MEMBERS_BY_CUSTOMER[CUSTOMER_ID] ?? [];
  const defaultCard = PAYMENT_METHODS.find((p) => p.customerId === CUSTOMER_ID && p.isDefault);

  const canNext = [
    !!sel.member,
    !!(sel.planet && sel.level && sel.variant),
    !!sel.location,
    !!sel.batch,
    true,
  ];

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }
  function back() {
    if (step > 0) setStep((s) => s - 1);
    else router.push("/customer/dashboard");
  }

  if (confirmed) {
    return <ConfirmationScreen sel={sel} onDone={() => router.push("/customer/dashboard")} />;
  }

  return (
    <div style={{ padding: 24, maxWidth: 680, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Button variant="secondary" size="sm" onClick={back}>
          ← Back
        </Button>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: TLP.navy }}>
          Enroll in a Course
        </h1>
      </div>

      <Card style={{ padding: "28px 32px" }}>
        <div style={{ marginBottom: 28 }}>
          <Stepper steps={STEPS} activeIndex={step} />
        </div>

        {step === 0 && (
          <Step1Members members={members} sel={sel} setSel={setSel} />
        )}
        {step === 1 && (
          <Step2Course sel={sel} setSel={setSel} />
        )}
        {step === 2 && (
          <Step3Location sel={sel} setSel={setSel} />
        )}
        {step === 3 && (
          <Step4Schedule sel={sel} setSel={setSel} />
        )}
        {step === 4 && (
          <Step5Payment sel={sel} defaultCard={defaultCard} />
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
          <Button variant="secondary" onClick={back}>
            {step === 0 ? "Cancel" : "← Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button variant="primary" onClick={next} disabled={!canNext[step]}>
              Continue →
            </Button>
          ) : (
            <Button
              variant="amber"
              onClick={() => setConfirmed(true)}
              disabled={!canNext[step]}
              icon="✓"
            >
              Confirm Enrollment
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Step 1: Select Member ──────────────────────────────────────────

function Step1Members({
  members,
  sel,
  setSel,
}: {
  members: Member[];
  sel: Selection;
  setSel: React.Dispatch<React.SetStateAction<Selection>>;
}) {
  return (
    <div>
      <h3 style={{ margin: "0 0 16px", color: TLP.navy, fontSize: 16, fontWeight: 700 }}>
        Select Member
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {members.map((m, i) => {
          const isSelected = sel.member?.id === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setSel((s) => ({ ...s, member: m }))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderRadius: 10,
                border: `2px solid ${isSelected ? TLP.teal : TLP.gray200}`,
                cursor: "pointer",
                background: isSelected ? TLP.tealLight : TLP.white,
                transition: "all 0.15s",
              }}
            >
              <Avatar
                name={m.fullName}
                size={38}
                color={[TLP.teal, TLP.purple, TLP.navy, TLP.blue][i % 4]}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: TLP.navy }}>{m.fullName}</div>
                <div style={{ fontSize: 12, color: TLP.gray500 }}>{m.grade ?? "Adult"}</div>
              </div>
              {isSelected && <span style={{ color: TLP.teal, fontSize: 18 }}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: Planet, Level, Frequency ──────────────────────────────

function Step2Course({
  sel,
  setSel,
}: {
  sel: Selection;
  setSel: React.Dispatch<React.SetStateAction<Selection>>;
}) {
  return (
    <div>
      <h3 style={{ margin: "0 0 16px", color: TLP.navy, fontSize: 16, fontWeight: 700 }}>
        Choose Planet & Level
      </h3>

      {/* Planet grid */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: "block", marginBottom: 10 }}>
          Planet <span style={{ color: TLP.red }}>*</span>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {PLANETS.filter((p) => p.isActive).map((planet) => {
            const ps = planetStyle(planet.name);
            const isSelected = sel.planet?.id === planet.id;
            return (
              <div
                key={planet.id}
                onClick={() =>
                  setSel((s) => ({ ...s, planet, level: null, variant: null, batch: null }))
                }
                style={{
                  padding: "14px 10px",
                  borderRadius: 10,
                  border: `2px solid ${isSelected ? ps.color : TLP.gray200}`,
                  cursor: "pointer",
                  textAlign: "center",
                  background: isSelected ? ps.bg : TLP.white,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{ps.icon}</div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isSelected ? ps.color : TLP.gray700,
                  }}
                >
                  {planet.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Level picker */}
      {sel.planet && (
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: "block", marginBottom: 10 }}>
            Level <span style={{ color: TLP.red }}>*</span>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {(LEVELS_BY_PLANET[sel.planet.id] ?? []).map((level) => {
              const ps = planetStyle(sel.planet!.name);
              const isSelected = sel.level?.id === level.id;
              return (
                <div
                  key={level.id}
                  onClick={() => setSel((s) => ({ ...s, level, variant: null, batch: null }))}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: `2px solid ${isSelected ? ps.color : TLP.gray200}`,
                    cursor: "pointer",
                    background: isSelected ? ps.bg : TLP.white,
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: isSelected ? ps.color : TLP.gray300,
                      flexShrink: 0,
                      transition: "background 0.15s",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? ps.color : TLP.gray700,
                    }}
                  >
                    {level.name}
                  </span>
                  {isSelected && (
                    <span style={{ marginLeft: "auto", color: ps.color, fontSize: 13 }}>✓</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Frequency / pricing */}
      {sel.level && (
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: "block", marginBottom: 10 }}>
            Frequency <span style={{ color: TLP.red }}>*</span>
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            {(VARIANTS_BY_LEVEL[sel.level.id] ?? []).map((variant) => {
              const isSelected = sel.variant?.id === variant.id;
              return (
                <div
                  key={variant.id}
                  onClick={() => setSel((s) => ({ ...s, variant, batch: null }))}
                  style={{
                    flex: 1,
                    padding: "14px 12px",
                    borderRadius: 10,
                    border: `2px solid ${isSelected ? TLP.navy : TLP.gray200}`,
                    cursor: "pointer",
                    textAlign: "center",
                    background: isSelected ? TLP.navy : TLP.white,
                    transition: "all 0.15s",
                  }}
                >
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 800,
                      color: isSelected ? "#fff" : TLP.navy,
                    }}
                  >
                    ${variant.price}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: isSelected ? "rgba(255,255,255,0.7)" : TLP.gray500,
                      marginTop: 2,
                    }}
                  >
                    Weekly {variant.frequencyPerWeek}x/mo
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step 3: Location ───────────────────────────────────────────────

function Step3Location({
  sel,
  setSel,
}: {
  sel: Selection;
  setSel: React.Dispatch<React.SetStateAction<Selection>>;
}) {
  const availableLocations = sel.level
    ? LOCATIONS.filter((loc) =>
        BATCHES.some(
          (b) => b.locationId === loc.id && b.levelId === sel.level!.id && b.isActive,
        ),
      )
    : [];

  return (
    <div>
      <h3 style={{ margin: "0 0 16px", color: TLP.navy, fontSize: 16, fontWeight: 700 }}>
        Choose Location
      </h3>
      {availableLocations.length === 0 ? (
        <p style={{ color: TLP.gray500, fontSize: 14 }}>
          No locations available for the selected level.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {availableLocations.map((loc) => {
            const isSelected = sel.location?.id === loc.id;
            const slotCount = BATCHES.filter(
              (b) => b.locationId === loc.id && b.levelId === sel.level!.id && b.isActive,
            ).length;
            return (
              <div
                key={loc.id}
                onClick={() => setSel((s) => ({ ...s, location: loc, batch: null }))}
                style={{
                  padding: "16px 18px",
                  borderRadius: 10,
                  border: `2px solid ${isSelected ? TLP.teal : TLP.gray200}`,
                  cursor: "pointer",
                  background: isSelected ? TLP.tealLight : TLP.white,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontWeight: 700, color: TLP.navy, marginBottom: 3 }}>
                  {loc.name}
                </div>
                <div style={{ fontSize: 12, color: TLP.gray500 }}>
                  {loc.addressLine1}, {loc.city}, {loc.stateProvince} · {slotCount} time slot
                  {slotCount !== 1 ? "s" : ""} available
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Step 4: Schedule ───────────────────────────────────────────────

function Step4Schedule({
  sel,
  setSel,
}: {
  sel: Selection;
  setSel: React.Dispatch<React.SetStateAction<Selection>>;
}) {
  const batches =
    sel.location && sel.level
      ? BATCHES.filter(
          (b) =>
            b.locationId === sel.location!.id &&
            b.levelId === sel.level!.id &&
            b.isActive,
        )
      : [];

  return (
    <div>
      <h3 style={{ margin: "0 0 6px", color: TLP.navy, fontSize: 16, fontWeight: 700 }}>
        Pick a Weekly Slot
      </h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: TLP.gray500 }}>
        Select 1 time slot. Spots available are shown below.
      </p>
      {batches.length === 0 ? (
        <p style={{ color: TLP.gray500, fontSize: 14 }}>
          No available batches. Please go back and try a different location.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
          {batches.map((batch) => {
            const isSelected = sel.batch?.id === batch.id;
            const enrolled = (ENROLLMENTS_BY_BATCH[batch.id] ?? []).length;
            const spots = batch.capacity - enrolled;
            const full = spots <= 0;
            return (
              <div
                key={batch.id}
                onClick={() => {
                  if (!full) setSel((s) => ({ ...s, batch }));
                }}
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: `2px solid ${isSelected ? TLP.teal : TLP.gray200}`,
                  cursor: full ? "not-allowed" : "pointer",
                  background: isSelected ? TLP.tealLight : full ? TLP.gray50 : TLP.white,
                  opacity: full ? 0.55 : 1,
                  transition: "all 0.15s",
                }}
              >
                <div style={{ fontWeight: 700, color: TLP.navy, fontSize: 14 }}>
                  {DAYS[batch.dayOfWeek]}s
                </div>
                <div style={{ fontSize: 13, color: TLP.gray600, marginTop: 2 }}>
                  {fmtTime(batch.startTime)} – {fmtTime(batch.endTime)}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: spots <= 2 ? TLP.red : TLP.gray500,
                    marginTop: 4,
                    fontWeight: spots <= 2 ? 600 : 400,
                  }}
                >
                  {full ? "Full" : `${spots} spot${spots !== 1 ? "s" : ""} left`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Step 5: Payment Review ─────────────────────────────────────────

function Step5Payment({
  sel,
  defaultCard,
}: {
  sel: Selection;
  defaultCard: ReturnType<typeof PAYMENT_METHODS.find>;
}) {
  const price = sel.variant?.price ?? 0;
  const gst = Math.round(price * 0.05 * 100) / 100;
  const setupFee = sel.variant?.setupFee ?? 25;

  return (
    <div>
      <h3 style={{ margin: "0 0 16px", color: TLP.navy, fontSize: 16, fontWeight: 700 }}>
        Review & Pay
      </h3>

      <Card style={{ padding: 18, marginBottom: 16, background: TLP.bg }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 14 }}>
          <SummaryRow label="Member" value={sel.member?.fullName ?? "—"} />
          <SummaryRow
            label="Course"
            value={`${sel.planet?.name ?? "—"} · ${sel.level?.name ?? "—"}`}
          />
          <SummaryRow label="Location" value={sel.location?.name ?? "—"} />
          {sel.batch && (
            <SummaryRow
              label="Schedule"
              value={`${DAYS[sel.batch.dayOfWeek]}s ${fmtTime(sel.batch.startTime)}–${fmtTime(sel.batch.endTime)}`}
            />
          )}
          <SummaryRow
            label="Frequency"
            value={sel.variant ? `Weekly ${sel.variant.frequencyPerWeek}x` : "—"}
          />
          <div style={{ height: 1, background: TLP.gray200, margin: "2px 0" }} />
          <SummaryRow label="Monthly fee" value={`$${price.toFixed(2)}`} />
          <SummaryRow label="Member setup fee (first time)" value={`$${setupFee.toFixed(2)}`} />
          <SummaryRow label="GST (5%)" value={`$${gst.toFixed(2)}`} />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: 8,
              borderTop: `1px solid ${TLP.gray200}`,
            }}
          >
            <span style={{ fontWeight: 700, color: TLP.navy }}>First month total</span>
            <span style={{ fontWeight: 800, color: TLP.navy, fontSize: 16 }}>
              ${(price + setupFee + gst).toFixed(2)} CAD
            </span>
          </div>
          <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
            Then ${(price + gst).toFixed(2)}/mo on the 1st of each month
          </div>
        </div>
      </Card>

      {/* Payment method */}
      {defaultCard && (
        <div style={{ marginBottom: 14 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: TLP.gray700,
              display: "block",
              marginBottom: 8,
            }}
          >
            Payment Method
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 10,
              border: `2px solid ${TLP.teal}`,
              background: TLP.tealLight,
            }}
          >
            <span style={{ fontSize: 20 }}>💳</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: TLP.navy }}>
                {defaultCard.cardBrand.charAt(0).toUpperCase() + defaultCard.cardBrand.slice(1)}{" "}
                ending in {defaultCard.last4}
              </div>
              <div style={{ fontSize: 11, color: TLP.gray500 }}>
                Charged on 1st of each month
              </div>
            </div>
            <Badge label="Default" color={TLP.teal} bg={TLP.tealLight} />
          </div>
        </div>
      )}

      <div
        style={{
          background: TLP.amberLight,
          borderRadius: 8,
          padding: "10px 14px",
          fontSize: 12,
          color: TLP.gray700,
          display: "flex",
          gap: 8,
        }}
      >
        <span>ℹ️</span>
        <span>
          By enrolling, you agree to the 15-day cancellation notice policy. You can cancel at
          any time from your account.
        </span>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
      <span style={{ color: TLP.gray500 }}>{label}</span>
      <span style={{ fontWeight: 600, color: TLP.navy, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ── Confirmation Screen ────────────────────────────────────────────

function ConfirmationScreen({
  sel,
  onDone,
}: {
  sel: Selection;
  onDone: () => void;
}) {
  return (
    <div
      style={{
        padding: 24,
        maxWidth: 480,
        margin: "48px auto",
        textAlign: "center",
      }}
    >
      <Card style={{ padding: "40px 36px" }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 800, color: TLP.navy }}>
          Enrollment Confirmed!
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: TLP.gray600, lineHeight: 1.6 }}>
          <strong>{sel.member?.fullName}</strong> is now enrolled in{" "}
          <strong>
            {sel.planet?.name} · {sel.level?.name}
          </strong>{" "}
          at <strong>{sel.location?.name}</strong>.
        </p>
        {sel.batch && (
          <div
            style={{
              background: TLP.tealLight,
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 14,
              color: TLP.teal,
              fontWeight: 600,
            }}
          >
            📅 {DAYS[sel.batch.dayOfWeek]}s · {fmtTime(sel.batch.startTime)} –{" "}
            {fmtTime(sel.batch.endTime)}
          </div>
        )}
        <p style={{ margin: "0 0 24px", fontSize: 12, color: TLP.gray400 }}>
          This is a prototype — no real data was saved.
        </p>
        <Button variant="primary" onClick={onDone} style={{ width: "100%", justifyContent: "center" }}>
          Back to Dashboard
        </Button>
      </Card>
    </div>
  );
}
