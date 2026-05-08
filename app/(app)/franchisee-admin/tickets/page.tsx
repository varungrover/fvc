"use client";

import { useState } from "react";
import { Plus, MapPin, ChevronUp, ChevronDown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP } from "@/lib/theme/tokens";
import { TICKETS } from "@/lib/mock/tickets";
import { LOCATION_BY_ID } from "@/lib/mock/locations";
import type { SupportTicket, SupportTicketStatus, SupportTicketCategory } from "@/lib/types";

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const CATEGORY_OPTIONS_FILTER = [
  { value: "", label: "All Categories" },
  { value: "IT", label: "IT" },
  { value: "Non-IT", label: "Non-IT" },
];

const LOCATION_OPTIONS = [
  { value: "", label: "All Locations" },
  { value: "loc_mla_toronto", label: "Toronto Downtown" },
  { value: "loc_mla_mississauga", label: "Mississauga" },
  { value: "loc_mla_brampton", label: "Brampton" },
];

const NEW_CATEGORY_OPTIONS = [
  { value: "IT", label: "IT" },
  { value: "Non-IT", label: "Non-IT" },
];

const NEW_LOCATION_OPTIONS = [
  { value: "", label: "Network-wide (no specific location)" },
  { value: "loc_mla_toronto", label: "Toronto Downtown" },
  { value: "loc_mla_mississauga", label: "Mississauga" },
  { value: "loc_mla_brampton", label: "Brampton" },
];

function statusBadge(status: SupportTicketStatus) {
  switch (status) {
    case "open":
      return <Badge label="Open" color={TLP.blue} bg={TLP.blueLight} />;
    case "in_progress":
      return <Badge label="In Progress" color={TLP.amber} bg={TLP.amberLight} />;
    case "resolved":
      return <Badge label="Resolved" color={TLP.green} bg={TLP.greenLight} />;
    case "closed":
      return <Badge label="Closed" color={TLP.gray500} bg={TLP.gray100} />;
  }
}

function categoryBadge(category: SupportTicketCategory) {
  return category === "IT"
    ? <Badge label="IT" color={TLP.purple} bg={TLP.purpleLight} />
    : <Badge label="Non-IT" color={TLP.teal} bg={TLP.tealLight} />;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
}

type AddForm = {
  category: SupportTicketCategory;
  locationId: string;
  shortDescription: string;
};

const BLANK_FORM: AddForm = { category: "IT", locationId: "", shortDescription: "" };

export default function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<AddForm>(BLANK_FORM);
  const [extraTickets, setExtraTickets] = useState<SupportTicket[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allTickets = [...TICKETS, ...extraTickets];

  const filtered = allTickets.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (categoryFilter && t.category !== categoryFilter) return false;
    if (locationFilter && t.locationId !== locationFilter) return false;
    return true;
  });

  const openCount = allTickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  function handleSubmit() {
    if (!form.shortDescription.trim()) return;
    const newTicket: SupportTicket = {
      id: `tkt_new_${Date.now()}`,
      ownershipId: "ten_mla",
      locationId: form.locationId || undefined,
      raisedBy: "user_franchisee_admin",
      category: form.category,
      shortDescription: form.shortDescription.trim(),
      status: "open",
      createdAt: new Date().toISOString(),
    };
    setExtraTickets((prev) => [newTicket, ...prev]);
    setShowAdd(false);
    setForm(BLANK_FORM);
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Support Tickets"
        subtitle={`Maple Leaf Academy — ${openCount} open`}
        actions={
          <Button variant="primary" icon={<Plus size={15} strokeWidth={2.5} />} onClick={() => { setForm(BLANK_FORM); setShowAdd(true); }}>
            New Ticket
          </Button>
        }
      />

      {/* Filters */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ width: 180 }}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
        </div>
        <div style={{ width: 160 }}>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={CATEGORY_OPTIONS_FILTER} />
        </div>
        <div style={{ width: 200 }}>
          <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} options={LOCATION_OPTIONS} />
        </div>
        <span style={{ fontSize: 13, color: TLP.gray500 }}>
          {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <Card style={{ overflow: "hidden", padding: 0 }}>
        {/* Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 80px 1fr 160px 110px 90px",
            padding: "10px 20px",
            background: TLP.gray50,
            fontSize: 11,
            fontWeight: 700,
            color: TLP.gray500,
            textTransform: "uppercase",
            letterSpacing: "0.4px",
            gap: 8,
            borderBottom: `1px solid ${TLP.gray100}`,
          }}
        >
          <span>Category</span>
          <span>Status</span>
          <span>Description</span>
          <span>Location</span>
          <span>Created</span>
          <span></span>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: TLP.gray400, fontSize: 14 }}>
            No tickets match the selected filters.
          </div>
        ) : (
          [...filtered]
            .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            .map((ticket, i) => {
              const location = ticket.locationId ? LOCATION_BY_ID[ticket.locationId] : null;
              const isExpanded = expandedId === ticket.id;
              return (
                <div key={ticket.id}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 80px 1fr 160px 110px 90px",
                      padding: "14px 20px",
                      fontSize: 13,
                      gap: 8,
                      borderBottom: `1px solid ${TLP.gray100}`,
                      alignItems: "center",
                      background: ticket.status === "open" ? `${TLP.blue}06` : ticket.status === "in_progress" ? `${TLP.amber}06` : "transparent",
                    }}
                  >
                    <span>{categoryBadge(ticket.category)}</span>
                    <span>{statusBadge(ticket.status)}</span>
                    <div style={{ fontWeight: 500, color: TLP.navy, lineHeight: 1.4 }}>
                      {ticket.shortDescription}
                    </div>
                    <span style={{ color: TLP.gray600, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                      {location
                        ? <><MapPin size={12} strokeWidth={2} color={TLP.red} />{location.name}</>
                        : "—"}
                    </span>
                    <span style={{ color: TLP.gray500 }}>{fmtDate(ticket.createdAt)}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                        style={{ color: TLP.teal, display: "flex", alignItems: "center" }}
                      >
                        {isExpanded ? <ChevronUp size={16} strokeWidth={2} /> : <ChevronDown size={16} strokeWidth={2} />}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div
                      style={{
                        padding: "14px 20px 18px",
                        borderBottom: `1px solid ${TLP.gray100}`,
                        background: TLP.gray50,
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 20,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: TLP.gray500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                          Full Description
                        </div>
                        <div style={{ fontSize: 13, color: TLP.gray700, lineHeight: 1.6 }}>
                          {ticket.shortDescription}
                        </div>
                        <div style={{ marginTop: 12, fontSize: 11, color: TLP.gray400 }}>
                          Ticket ID: {ticket.id} · Raised by: Jordan Bell
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: TLP.gray500, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                          Update Status
                        </div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {(["open", "in_progress", "resolved", "closed"] as SupportTicketStatus[])
                            .filter((s) => s !== ticket.status)
                            .map((s) => (
                              <Button
                                key={s}
                                variant="secondary"
                                size="sm"
                                onClick={() => setExpandedId(null)}
                              >
                                Mark {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                              </Button>
                            ))}
                        </div>
                        <div style={{ marginTop: 12, fontSize: 12, color: TLP.gray400 }}>
                          Status changes are visual only in this prototype.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </Card>

      {/* New Ticket Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title="New Support Ticket"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!form.shortDescription.trim()}>
              Submit Ticket
            </Button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select
              label="Category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as SupportTicketCategory }))}
              options={NEW_CATEGORY_OPTIONS}
            />
            <Select
              label="Location"
              value={form.locationId}
              onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}
              options={NEW_LOCATION_OPTIONS}
            />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: TLP.gray700, display: "block", marginBottom: 4 }}>
              Description <span style={{ color: TLP.red }}>*</span>
            </label>
            <textarea
              value={form.shortDescription}
              onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))}
              placeholder="Describe the issue clearly so the support team can assist you…"
              rows={4}
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
          <div style={{ background: TLP.amberLight, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: TLP.amber, display: "flex", alignItems: "center", gap: 6 }}>
            <Zap size={13} strokeWidth={2} />
            IT tickets are typically responded to within 24 hours. Non-IT requests within 48 hours.
          </div>
        </div>
      </Modal>
    </div>
  );
}
