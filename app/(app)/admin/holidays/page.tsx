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

type HolidayScope = "all" | string;

type Holiday = {
  id: string;
  holidayDate: string;
  description: string;
  scope: HolidayScope;
};

const UPCOMING_HOLIDAYS: Holiday[] = [
  { id: "h_victoria", holidayDate: "2026-05-18", description: "Victoria Day", scope: "all" },
  { id: "h_canada", holidayDate: "2026-07-01", description: "Canada Day", scope: "all" },
  { id: "h_bc", holidayDate: "2026-08-03", description: "BC Day", scope: "all" },
];

const PAST_HOLIDAYS: Holiday[] = [
  { id: "h_good_friday", holidayDate: "2026-04-03", description: "Good Friday", scope: "all" },
  { id: "h_easter", holidayDate: "2026-04-05", description: "Easter Sunday", scope: "all" },
  { id: "h_family", holidayDate: "2026-02-16", description: "Family Day (BC)", scope: "all" },
  { id: "h_ny", holidayDate: "2026-01-01", description: "New Year's Day", scope: "all" },
];

const SCOPE_OPTIONS = [
  { value: "all", label: "All Locations" },
  { value: "loc_tlp_surrey", label: "Surrey Central only" },
  { value: "loc_tlp_abbotsford", label: "Abbotsford only" },
  { value: "loc_tlp_langley", label: "Langley only" },
];

type AddForm = {
  holidayDate: string;
  description: string;
  scope: string;
};

const BLANK_FORM: AddForm = {
  holidayDate: "",
  description: "",
  scope: "all",
};

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function fmtShortDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(iso: string) {
  const today = new Date("2026-05-03");
  const target = new Date(iso + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function scopeLabel(scope: HolidayScope) {
  if (scope === "all") return "System-wide";
  const found = SCOPE_OPTIONS.find((o) => o.value === scope);
  return found?.label ?? scope;
}

export default function HolidaysPage() {
  const [upcoming, setUpcoming] = useState<Holiday[]>(UPCOMING_HOLIDAYS);
  const [showPast, setShowPast] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddForm>(BLANK_FORM);

  function handleAdd() {
    if (!form.holidayDate || !form.description) return;
    const newHoliday: Holiday = {
      id: `h_custom_${Date.now()}`,
      holidayDate: form.holidayDate,
      description: form.description,
      scope: form.scope,
    };
    setUpcoming((prev) =>
      [...prev, newHoliday].sort((a, b) => a.holidayDate.localeCompare(b.holidayDate)),
    );
    setShowAdd(false);
    setForm(BLANK_FORM);
  }

  function set(field: keyof AddForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Holiday Calendar"
        subtitle="Manage system-wide and location-specific holidays"
        actions={
          <Button variant="primary" icon="➕" onClick={() => { setForm(BLANK_FORM); setShowAdd(true); }}>
            Add Holiday
          </Button>
        }
      />

      {/* Upcoming holidays */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: TLP.gray500, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          Upcoming Holidays (next 3 months)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {upcoming.map((h) => {
            const days = daysUntil(h.holidayDate);
            const isImminent = days <= 14;

            return (
              <Card key={h.id} style={{ padding: "16px 20px", border: isImminent ? `1.5px solid ${TLP.amber}` : undefined }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                    {/* Date box */}
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 10,
                        background: isImminent ? TLP.amberLight : TLP.tealLight,
                        color: isImminent ? TLP.amber : TLP.teal,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
                        {new Date(h.holidayDate + "T00:00:00").getDate()}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>
                        {new Date(h.holidayDate + "T00:00:00").toLocaleDateString("en-CA", { month: "short" })}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: TLP.navy }}>
                        {h.description}
                      </div>
                      <div style={{ fontSize: 12, color: TLP.gray500, marginTop: 2 }}>
                        {fmtDate(h.holidayDate)}
                      </div>
                      <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                        <Badge
                          label={scopeLabel(h.scope)}
                          color={h.scope === "all" ? TLP.blue : TLP.purple}
                          bg={h.scope === "all" ? TLP.blueLight : TLP.purpleLight}
                        />
                        {isImminent && (
                          <Badge
                            label={`In ${days} day${days !== 1 ? "s" : ""}`}
                            color={TLP.amber}
                            bg={TLP.amberLight}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" style={{ color: TLP.gray500 }}>
                    Edit
                  </Button>
                </div>
              </Card>
            );
          })}

          {upcoming.length === 0 && (
            <div style={{ textAlign: "center", padding: "32px 0", color: TLP.gray400, fontSize: 13 }}>
              No upcoming holidays.
            </div>
          )}
        </div>
      </div>

      {/* Past holidays (collapsible) */}
      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => setShowPast((s) => !s)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px 0",
            fontSize: 13,
            fontWeight: 700,
            color: TLP.gray600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {showPast ? "▲" : "▼"} Past Holidays ({PAST_HOLIDAYS.length})
        </button>

        {showPast && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {PAST_HOLIDAYS.map((h) => (
              <div
                key={h.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: TLP.gray50,
                  borderRadius: 10,
                  border: `1px solid ${TLP.gray200}`,
                  opacity: 0.75,
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13, color: TLP.gray700 }}>
                    {h.description}
                  </span>
                  <span style={{ color: TLP.gray400, fontSize: 12, marginLeft: 10 }}>
                    {fmtShortDate(h.holidayDate)}
                  </span>
                </div>
                <Badge
                  label={scopeLabel(h.scope)}
                  color={TLP.gray500}
                  bg={TLP.gray100}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Holiday Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="Add Holiday"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleAdd}
              disabled={!form.holidayDate || !form.description}
            >
              Add Holiday
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Date"
            type="date"
            value={form.holidayDate}
            onChange={set("holidayDate")}
            required
          />
          <Input
            label="Description"
            value={form.description}
            onChange={set("description")}
            required
            placeholder="e.g. Thanksgiving Day"
          />
          <Select
            label="Scope"
            value={form.scope}
            onChange={set("scope")}
            options={SCOPE_OPTIONS}
            hint="Select which locations this holiday applies to"
          />
          <div
            style={{
              background: TLP.amberLight,
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              color: TLP.gray700,
            }}
          >
            Adding a holiday will mark all sessions on that date as cancelled for the selected locations.
          </div>
        </div>
      </Modal>
    </div>
  );
}
