"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP } from "@/lib/theme/tokens";
import { EVENTS, REGISTRATIONS_BY_CUSTOMER } from "@/lib/mock/events";
import { MEMBERS_BY_CUSTOMER } from "@/lib/mock/members";
import type { Event, EventType } from "@/lib/types";

const DEMO_CUSTOMER_ID = "cust_raj";

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "tournament", label: "Tournaments" },
  { value: "camp", label: "Camps" },
  { value: "event", label: "Events" },
];

function typeBadge(t: EventType) {
  switch (t) {
    case "tournament":
      return <Badge label="Tournament" color={TLP.amber} bg={TLP.amberLight} />;
    case "camp":
      return <Badge label="Camp" color={TLP.teal} bg={TLP.tealLight} />;
    case "event":
      return <Badge label="Event" color={TLP.blue} bg={TLP.blueLight} />;
  }
}

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-CA", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function fmtDateRange(start: string, end: string) {
  if (start === end) return fmtDate(start);
  return `${fmtDate(start)} – ${fmtDate(end)}`;
}

function daysUntil(iso: string) {
  const today = new Date("2026-05-04");
  const d = new Date(iso + "T00:00:00");
  return Math.round((d.getTime() - today.getTime()) / 86400000);
}

export default function CustomerEventsPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [registerFor, setRegisterFor] = useState<Event | null>(null);
  const [selectedMember, setSelectedMember] = useState("");
  const [newRegs, setNewRegs] = useState<Record<string, string[]>>({});

  const myRegs = REGISTRATIONS_BY_CUSTOMER[DEMO_CUSTOMER_ID] ?? [];
  const registeredEventIds = new Set([
    ...myRegs.map((r) => r.eventId),
    ...Object.entries(newRegs).flatMap(([evtId, mIds]) => (mIds.length > 0 ? [evtId] : [])),
  ]);

  const members = MEMBERS_BY_CUSTOMER[DEMO_CUSTOMER_ID] ?? [];
  const memberOptions = members.map((m) => ({ value: m.id, label: m.fullName }));

  const upcoming = EVENTS.filter((e) => {
    if (typeFilter && e.eventType !== typeFilter) return false;
    return daysUntil(e.startDate) >= 0;
  }).sort((a, b) => a.startDate.localeCompare(b.startDate));

  function handleRegister() {
    if (!registerFor || !selectedMember) return;
    setNewRegs((prev) => ({
      ...prev,
      [registerFor.id]: [...(prev[registerFor.id] ?? []), selectedMember],
    }));
    setRegisterFor(null);
    setSelectedMember("");
  }

  function isRegisteredForEvent(evtId: string) {
    const localRegs = newRegs[evtId] ?? [];
    return registeredEventIds.has(evtId) || localRegs.length > 0;
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Events & Camps"
        subtitle="Browse upcoming events and register your members"
      />

      {/* Filter */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12 }}>
        <div style={{ width: 180 }}>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={TYPE_OPTIONS} />
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div style={{ padding: "60px 0", textAlign: "center", color: TLP.gray400, fontSize: 14 }}>
          No upcoming events right now. Check back soon!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {upcoming.map((evt) => {
            const days = daysUntil(evt.startDate);
            const isSoon = days <= 14;
            const spotsLeft = evt.capacity - ((EVENTS.find(e => e.id === evt.id) ? (EVENTS.findIndex(e => e.id === evt.id) < 4 ? [3, 2, 1, 5][EVENTS.findIndex(e => e.id === evt.id)] : 0) : 0));
            const registered = isRegisteredForEvent(evt.id);

            return (
              <Card
                key={evt.id}
                style={{
                  padding: "20px 24px",
                  border: isSoon ? `1.5px solid ${TLP.amber}` : undefined,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    {/* Header badges */}
                    <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      {typeBadge(evt.eventType)}
                      {evt.price === 0 && <Badge label="Free" color={TLP.green} bg={TLP.greenLight} />}
                      {registered && <Badge label="✓ Registered" color={TLP.green} bg={TLP.greenLight} />}
                      {isSoon && <Badge label={`In ${days} day${days !== 1 ? "s" : ""}`} color={TLP.amber} bg={TLP.amberLight} />}
                    </div>

                    <div style={{ fontSize: 18, fontWeight: 700, color: TLP.navy, marginBottom: 6 }}>
                      {evt.title}
                    </div>

                    {evt.description && (
                      <div style={{ fontSize: 13, color: TLP.gray600, lineHeight: 1.6, marginBottom: 10, maxWidth: 500 }}>
                        {evt.description}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 20, fontSize: 13, color: TLP.gray500, flexWrap: "wrap" }}>
                      <span>📅 {fmtDateRange(evt.startDate, evt.endDate)}</span>
                      {evt.price > 0 && <span>💲{evt.price} per person</span>}
                      <span>👥 {evt.capacity} spots</span>
                    </div>
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    {registered ? (
                      <Button variant="secondary" disabled>
                        Registered
                      </Button>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => { setRegisterFor(evt); setSelectedMember(members[0]?.id ?? ""); }}
                      >
                        Register
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Registration modal */}
      <Modal
        open={!!registerFor}
        onClose={() => setRegisterFor(null)}
        title={registerFor ? `Register for ${registerFor.title}` : "Register"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRegisterFor(null)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleRegister}
              disabled={!selectedMember}
            >
              {registerFor?.price === 0 ? "Confirm Registration" : `Pay $${registerFor?.price ?? 0} & Register`}
            </Button>
          </>
        }
      >
        {registerFor && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: TLP.tealLight, borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: TLP.navy, marginBottom: 2 }}>
                {registerFor.title}
              </div>
              <div style={{ fontSize: 13, color: TLP.gray600 }}>
                📅 {fmtDateRange(registerFor.startDate, registerFor.endDate)}
              </div>
              {registerFor.price > 0 && (
                <div style={{ fontSize: 13, color: TLP.gray600, marginTop: 2 }}>
                  💲{registerFor.price} will be charged to your payment method on file
                </div>
              )}
            </div>

            <Select
              label="Register for which member?"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              options={memberOptions}
            />

            <div style={{ background: TLP.amberLight, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: TLP.gray700 }}>
              Registrations are confirmed immediately. Cancellations must be made at least 72 hours before the event.
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
