"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP } from "@/lib/theme/tokens";
import { EVENTS, REGISTRATIONS_BY_EVENT } from "@/lib/mock/events";
import type { Event, EventType } from "@/lib/types";

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "tournament", label: "Tournament" },
  { value: "camp", label: "Camp" },
  { value: "event", label: "Event" },
];

const NEW_TYPE_OPTIONS = [
  { value: "tournament", label: "Tournament" },
  { value: "camp", label: "Camp" },
  { value: "event", label: "Event" },
];

const LOCATION_OPTIONS = [
  { value: "", label: "All Locations" },
  { value: "loc_tlp_surrey", label: "Surrey Central" },
  { value: "loc_tlp_abbotsford", label: "Abbotsford" },
  { value: "loc_tlp_langley", label: "Langley" },
];

const NEW_LOCATION_OPTIONS = [
  { value: "", label: "Network-wide" },
  { value: "loc_tlp_surrey", label: "Surrey Central" },
  { value: "loc_tlp_abbotsford", label: "Abbotsford" },
  { value: "loc_tlp_langley", label: "Langley" },
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
    month: "short",
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

type AddForm = {
  title: string;
  description: string;
  eventType: EventType;
  locationId: string;
  startDate: string;
  endDate: string;
  price: string;
  capacity: string;
};

const BLANK_FORM: AddForm = {
  title: "",
  description: "",
  eventType: "event",
  locationId: "",
  startDate: "",
  endDate: "",
  price: "0",
  capacity: "30",
};

export default function AdminEventsPage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState<Event | null>(null);
  const [form, setForm] = useState<AddForm>(BLANK_FORM);
  const [extraEvents, setExtraEvents] = useState<Event[]>([]);

  const allEvents = [...EVENTS, ...extraEvents];

  const filtered = allEvents.filter((e) => {
    if (typeFilter && e.eventType !== typeFilter) return false;
    if (locationFilter) {
      if (locationFilter === "" ) return true;
      if (e.locationId && e.locationId !== locationFilter) return false;
    }
    return true;
  });

  const upcoming = filtered.filter((e) => daysUntil(e.startDate) >= 0);
  const past = filtered.filter((e) => daysUntil(e.startDate) < 0);

  function field(k: keyof AddForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  function handleAdd() {
    if (!form.title || !form.startDate || !form.endDate) return;
    const newEvent: Event = {
      id: `evt_new_${Date.now()}`,
      ownershipId: "ten_tlp",
      locationId: form.locationId || undefined,
      title: form.title,
      description: form.description || undefined,
      eventType: form.eventType,
      startDate: form.startDate,
      endDate: form.endDate,
      price: parseFloat(form.price) || 0,
      capacity: parseInt(form.capacity) || 30,
    };
    setExtraEvents((prev) => [newEvent, ...prev]);
    setShowAdd(false);
    setForm(BLANK_FORM);
  }

  function EventCard({ evt }: { evt: Event }) {
    const regs = REGISTRATIONS_BY_EVENT[evt.id] ?? [];
    const fillPct = Math.round((regs.length / evt.capacity) * 100);
    const days = daysUntil(evt.startDate);
    const isSoon = days >= 0 && days <= 14;

    return (
      <Card
        style={{
          padding: "18px 20px",
          border: isSoon ? `1.5px solid ${TLP.amber}` : undefined,
          cursor: "pointer",
        }}
        onClick={() => setShowDetail(evt)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 6, flexWrap: "wrap", alignItems: "center" }}>
              {typeBadge(evt.eventType)}
              {evt.locationId ? (
                <Badge label={locationLabel(evt.locationId)} color={TLP.gray500} bg={TLP.gray100} />
              ) : (
                <Badge label="Network-wide" color={TLP.navy} bg={TLP.tealLight} />
              )}
              {evt.price === 0 && <Badge label="Free" color={TLP.green} bg={TLP.greenLight} />}
              {isSoon && <Badge label={`In ${days}d`} color={TLP.amber} bg={TLP.amberLight} />}
            </div>
            <div style={{ fontWeight: 700, fontSize: 15, color: TLP.navy, marginBottom: 4 }}>
              {evt.title}
            </div>
            {evt.description && (
              <div style={{ fontSize: 12, color: TLP.gray500, lineHeight: 1.5, marginBottom: 8, maxWidth: 480 }}>
                {evt.description.length > 120 ? evt.description.slice(0, 120) + "…" : evt.description}
              </div>
            )}
            <div style={{ fontSize: 12, color: TLP.gray600 }}>
              📅 {fmtDateRange(evt.startDate, evt.endDate)}
              {evt.price > 0 && (
                <span style={{ marginLeft: 14 }}>💲{evt.price}/person</span>
              )}
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: TLP.navy }}>
              {regs.length}
              <span style={{ fontSize: 13, fontWeight: 500, color: TLP.gray500 }}>
                /{evt.capacity}
              </span>
            </div>
            <div style={{ fontSize: 11, color: TLP.gray400, marginBottom: 6 }}>registered</div>
            <div
              style={{
                width: 72,
                height: 6,
                borderRadius: 3,
                background: TLP.gray200,
                overflow: "hidden",
                marginLeft: "auto",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${fillPct}%`,
                  background: fillPct >= 80 ? TLP.red : TLP.teal,
                  borderRadius: 3,
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Events & Camps"
        subtitle="Manage tournaments, camps, and special events"
        actions={
          <Button variant="primary" icon="➕" onClick={() => { setForm(BLANK_FORM); setShowAdd(true); }}>
            New Event
          </Button>
        }
      />

      {/* Filters */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <div style={{ width: 160 }}>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={TYPE_OPTIONS} />
        </div>
        <div style={{ width: 180 }}>
          <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} options={LOCATION_OPTIONS} />
        </div>
      </div>

      {/* Upcoming */}
      <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, color: TLP.gray500, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        Upcoming ({upcoming.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {upcoming.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: TLP.gray400, fontSize: 13 }}>
            No upcoming events match the selected filters.
          </div>
        ) : (
          upcoming
            .sort((a, b) => a.startDate.localeCompare(b.startDate))
            .map((e) => <EventCard key={e.id} evt={e} />)
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <>
          <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 700, color: TLP.gray400, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Past ({past.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: 0.65 }}>
            {past.map((e) => <EventCard key={e.id} evt={e} />)}
          </div>
        </>
      )}

      {/* Detail modal */}
      {showDetail && (
        <Modal
          open
          onClose={() => setShowDetail(null)}
          title={showDetail.title}
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDetail(null)}>Close</Button>
              <Button variant="primary" onClick={() => setShowDetail(null)}>Edit Event</Button>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {typeBadge(showDetail.eventType)}
              {showDetail.locationId ? (
                <Badge label={locationLabel(showDetail.locationId)} color={TLP.gray500} bg={TLP.gray100} />
              ) : (
                <Badge label="Network-wide" color={TLP.navy} bg={TLP.tealLight} />
              )}
              {showDetail.price === 0 && <Badge label="Free" color={TLP.green} bg={TLP.greenLight} />}
            </div>

            {showDetail.description && (
              <div style={{ fontSize: 14, color: TLP.gray700, lineHeight: 1.6 }}>
                {showDetail.description}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: TLP.gray400, textTransform: "uppercase", marginBottom: 4 }}>Date</div>
                <div style={{ fontSize: 14, color: TLP.navy }}>{fmtDateRange(showDetail.startDate, showDetail.endDate)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: TLP.gray400, textTransform: "uppercase", marginBottom: 4 }}>Price</div>
                <div style={{ fontSize: 14, color: TLP.navy }}>
                  {showDetail.price === 0 ? "Free" : `$${showDetail.price}/person`}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: TLP.gray400, textTransform: "uppercase", marginBottom: 8 }}>
                Registrations ({(REGISTRATIONS_BY_EVENT[showDetail.id] ?? []).length}/{showDetail.capacity})
              </div>
              {(REGISTRATIONS_BY_EVENT[showDetail.id] ?? []).length === 0 ? (
                <div style={{ fontSize: 13, color: TLP.gray400 }}>No registrations yet.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {(REGISTRATIONS_BY_EVENT[showDetail.id] ?? []).map((r) => (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 12px", background: TLP.gray50, borderRadius: 8 }}>
                      <span style={{ color: TLP.navy, fontWeight: 500 }}>{r.memberId}</span>
                      <Badge label={r.status} color={TLP.green} bg={TLP.greenLight} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Add modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="New Event / Camp / Tournament"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={!form.title || !form.startDate || !form.endDate}
            >
              Create Event
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Title" value={form.title} onChange={field("title")} required placeholder="e.g. Summer Chess Camp 2026" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Type" value={form.eventType} onChange={field("eventType")} options={NEW_TYPE_OPTIONS} />
            <Select label="Location" value={form.locationId} onChange={field("locationId")} options={NEW_LOCATION_OPTIONS} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Start Date" type="date" value={form.startDate} onChange={field("startDate")} required />
            <Input label="End Date" type="date" value={form.endDate} onChange={field("endDate")} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Input label="Price ($)" type="number" value={form.price} onChange={field("price")} hint="0 for free" />
            <Input label="Capacity" type="number" value={form.capacity} onChange={field("capacity")} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: "block", marginBottom: 4 }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={field("description")}
              rows={3}
              placeholder="Describe the event for parents…"
              style={{
                width: "100%",
                border: `1.5px solid ${TLP.gray200}`,
                borderRadius: 8,
                padding: "9px 12px",
                fontSize: 14,
                color: TLP.gray800,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                background: TLP.white,
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function locationLabel(id: string) {
  const map: Record<string, string> = {
    loc_tlp_surrey: "Surrey Central",
    loc_tlp_abbotsford: "Abbotsford",
    loc_tlp_langley: "Langley",
  };
  return map[id] ?? id;
}
