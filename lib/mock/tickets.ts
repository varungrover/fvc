import type { SupportTicket } from "@/lib/types";

export const TICKETS: SupportTicket[] = [
  {
    id: "tkt_1",
    ownershipId: "ten_mla",
    locationId: "loc_mla_toronto",
    raisedBy: "user_franchisee_admin",
    category: "IT",
    shortDescription: "Student portal login failing for Toronto location — students can't access LMS.",
    status: "in_progress",
    createdAt: "2026-04-29T09:15:00Z",
  },
  {
    id: "tkt_2",
    ownershipId: "ten_mla",
    locationId: "loc_mla_mississauga",
    raisedBy: "user_franchisee_admin",
    category: "Non-IT",
    shortDescription: "Request for additional chairs in Mississauga classroom.",
    status: "open",
    createdAt: "2026-04-27T14:00:00Z",
  },
  {
    id: "tkt_3",
    ownershipId: "ten_mla",
    raisedBy: "user_franchisee_admin",
    category: "IT",
    shortDescription: "Billing report export not working in admin panel.",
    status: "resolved",
    createdAt: "2026-04-10T10:00:00Z",
  },
  {
    id: "tkt_4",
    ownershipId: "ten_mla",
    locationId: "loc_mla_brampton",
    raisedBy: "user_franchisee_admin",
    category: "Non-IT",
    shortDescription: "Brampton location needs signage update — old logo still displayed.",
    status: "open",
    createdAt: "2026-05-01T08:30:00Z",
  },
];

export const TICKET_BY_ID: Record<string, SupportTicket> = Object.fromEntries(
  TICKETS.map((t) => [t.id, t]),
);
