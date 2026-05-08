"use client";

import { useState } from "react";
import { MapPin, ChevronUp, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Select } from "@/components/ui/Select";
import { TLP } from "@/lib/theme/tokens";
import { TICKETS } from "@/lib/mock/tickets";
import type { SupportTicket, SupportTicketStatus, SupportTicketCategory } from "@/lib/types";

// Admin (franchisor) view: sees all tickets from all ownerships
const ALL_TICKETS: SupportTicket[] = [
  ...TICKETS,
  // TLP corporate tickets
  {
    id: "tkt_tlp_1",
    ownershipId: "ten_tlp",
    locationId: "loc_tlp_surrey",
    raisedBy: "user_franchisor_admin",
    category: "IT",
    shortDescription: "Attendance export CSV not generating for Surrey location — last 3 exports failed.",
    status: "open",
    createdAt: "2026-05-02T10:00:00Z",
  },
  {
    id: "tkt_tlp_2",
    ownershipId: "ten_tlp",
    raisedBy: "user_franchisor_admin",
    category: "Non-IT",
    shortDescription: "Request to update Mentora platform branding colors across all pages.",
    status: "in_progress",
    createdAt: "2026-04-25T11:30:00Z",
  },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "IT", label: "IT" },
  { value: "Non-IT", label: "Non-IT" },
];

const OWNERSHIP_OPTIONS = [
  { value: "", label: "All Ownerships" },
  { value: "ten_tlp", label: "The Learning Planet" },
  { value: "ten_mla", label: "Maple Leaf Academy" },
];

function ownershipLabel(id: string) {
  const map: Record<string, string> = {
    ten_tlp: "The Learning Planet",
    ten_mla: "Maple Leaf Academy",
  };
  return map[id] ?? id;
}

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

export default function AdminTicketsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [ownershipFilter, setOwnershipFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>(ALL_TICKETS);

  const filtered = tickets.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (categoryFilter && t.category !== categoryFilter) return false;
    if (ownershipFilter && t.ownershipId !== ownershipFilter) return false;
    return true;
  });

  const openCount = tickets.filter((t) => t.status === "open" || t.status === "in_progress").length;

  function updateStatus(id: string, status: SupportTicketStatus) {
    setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    setExpandedId(null);
  }

  return (
    <div style={{ padding: 24 }}>
      <PageHeader
        title="Support Tickets"
        subtitle={`All ownerships — ${openCount} open`}
      />

      {/* Summary tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {(["open", "in_progress", "resolved", "closed"] as SupportTicketStatus[]).map((s) => {
          const count = tickets.filter((t) => t.status === s).length;
          const badge = statusBadge(s);
          return (
            <Card key={s} style={{ padding: "16px 18px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: TLP.navy }}>{count}</div>
              <div style={{ marginTop: 4 }}>{badge}</div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ width: 180 }}>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUS_OPTIONS} />
        </div>
        <div style={{ width: 160 }}>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} options={CATEGORY_OPTIONS} />
        </div>
        <div style={{ width: 220 }}>
          <Select value={ownershipFilter} onChange={(e) => setOwnershipFilter(e.target.value)} options={OWNERSHIP_OPTIONS} />
        </div>
        <span style={{ fontSize: 13, color: TLP.gray500 }}>
          {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      <Card style={{ overflow: "hidden", padding: 0 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "80px 80px 1fr 200px 140px 110px 90px",
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
          <span>Ownership</span>
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
            .map((ticket) => {
              const isExpanded = expandedId === ticket.id;
              return (
                <div key={ticket.id}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "80px 80px 1fr 200px 140px 110px 90px",
                      padding: "14px 20px",
                      fontSize: 13,
                      gap: 8,
                      borderBottom: `1px solid ${TLP.gray100}`,
                      alignItems: "center",
                      background:
                        ticket.status === "open"
                          ? `${TLP.blue}06`
                          : ticket.status === "in_progress"
                          ? `${TLP.amber}06`
                          : "transparent",
                    }}
                  >
                    <span>{categoryBadge(ticket.category)}</span>
                    <span>{statusBadge(ticket.status)}</span>
                    <div style={{ fontWeight: 500, color: TLP.navy, lineHeight: 1.4 }}>
                      {ticket.shortDescription}
                    </div>
                    <span style={{ fontSize: 12, color: TLP.gray600 }}>
                      {ownershipLabel(ticket.ownershipId)}
                    </span>
                    <span style={{ color: TLP.gray500, fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                      {ticket.locationId ? <><MapPin size={12} strokeWidth={2} color={TLP.red} />Location</> : "—"}
                    </span>
                    <span style={{ color: TLP.gray500 }}>{fmtDate(ticket.createdAt)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                      style={{ color: TLP.teal, display: "flex", alignItems: "center" }}
                    >
                      {isExpanded ? <ChevronUp size={16} strokeWidth={2} /> : <ChevronDown size={16} strokeWidth={2} />}
                    </Button>
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
                          Ticket ID: {ticket.id} · {ownershipLabel(ticket.ownershipId)}
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
                                onClick={() => updateStatus(ticket.id, s)}
                              >
                                Mark {s === "in_progress" ? "In Progress" : s.charAt(0).toUpperCase() + s.slice(1)}
                              </Button>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </Card>
    </div>
  );
}
