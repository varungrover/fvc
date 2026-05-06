import type { Event, EventRegistration } from "@/lib/types";

export const EVENTS: Event[] = [
  {
    id: "evt_chess_open",
    ownershipId: "ten_tlp",
    locationId: "loc_tlp_surrey",
    title: "Spring Chess Open 2026",
    description:
      "An exciting chess tournament open to all members across all levels. Prizes for top 3 in each age group. Come show your skills!",
    eventType: "tournament",
    startDate: "2026-06-07",
    endDate: "2026-06-07",
    price: 25,
    capacity: 48,
  },
  {
    id: "evt_math_camp",
    ownershipId: "ten_tlp",
    title: "Summer Math Camp 2026",
    description:
      "An intensive week-long Math camp covering advanced problem-solving techniques for Grades 5-10. Limited spots available.",
    eventType: "camp",
    startDate: "2026-07-14",
    endDate: "2026-07-18",
    price: 199,
    capacity: 20,
  },
  {
    id: "evt_english_workshop",
    ownershipId: "ten_tlp",
    locationId: "loc_tlp_langley",
    title: "Creative Writing Workshop",
    description:
      "A one-day creative writing workshop led by our top English coaches. Open to all levels. Lunch included.",
    eventType: "event",
    startDate: "2026-05-24",
    endDate: "2026-05-24",
    price: 0,
    capacity: 30,
  },
  {
    id: "evt_finance_bootcamp",
    ownershipId: "ten_tlp",
    title: "Teen Finance Bootcamp",
    description:
      "A weekend bootcamp teaching teens the fundamentals of personal finance, investing, and budgeting.",
    eventType: "camp",
    startDate: "2026-08-22",
    endDate: "2026-08-23",
    price: 149,
    capacity: 25,
  },
];

export const EVENT_REGISTRATIONS: EventRegistration[] = [
  {
    id: "ereg_aarav_chess",
    eventId: "evt_chess_open",
    memberId: "mem_aarav",
    customerId: "cust_raj",
    status: "registered",
  },
  {
    id: "ereg_anaya_writing",
    eventId: "evt_english_workshop",
    memberId: "mem_anaya",
    customerId: "cust_raj",
    status: "registered",
  },
  {
    id: "ereg_lin_chess",
    eventId: "evt_chess_open",
    memberId: "mem_lin_chen",
    customerId: "cust_chen",
    status: "registered",
  },
  {
    id: "ereg_ada_chess",
    eventId: "evt_chess_open",
    memberId: "mem_ada_okafor",
    customerId: "cust_okafor",
    status: "registered",
  },
];

export const EVENT_BY_ID: Record<string, Event> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
);

export const REGISTRATIONS_BY_EVENT: Record<string, EventRegistration[]> =
  EVENT_REGISTRATIONS.reduce(
    (acc, r) => {
      (acc[r.eventId] ??= []).push(r);
      return acc;
    },
    {} as Record<string, EventRegistration[]>,
  );

export const REGISTRATIONS_BY_CUSTOMER: Record<string, EventRegistration[]> =
  EVENT_REGISTRATIONS.reduce(
    (acc, r) => {
      (acc[r.customerId] ??= []).push(r);
      return acc;
    },
    {} as Record<string, EventRegistration[]>,
  );
