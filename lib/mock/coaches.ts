import type { Coach, CoachAvailability, CoachLeave } from "@/lib/types";

export const COACHES: Coach[] = [
  {
    id: "coach_priya",
    userId: "user_priya",
    ownershipId: "ten_tlp",
    fullName: "Priya Patel",
    email: "coach@demo.com",
    phone: "+1-604-555-0102",
    locationId: "loc_tlp_surrey",
    status: "active",
    planetIds: ["pl_chess", "pl_math"],
  },
  {
    id: "coach_james",
    userId: "user_james",
    ownershipId: "ten_tlp",
    fullName: "James Park",
    email: "james@learningplanet.com",
    phone: "+1-604-555-0103",
    locationId: "loc_tlp_surrey",
    status: "on_leave",
    planetIds: ["pl_chess"],
  },
  {
    id: "coach_aiden",
    userId: "user_aiden",
    ownershipId: "ten_tlp",
    fullName: "Aiden Chen",
    email: "aiden@learningplanet.com",
    phone: "+1-604-555-0104",
    locationId: "loc_tlp_abbotsford",
    status: "active",
    planetIds: ["pl_math", "pl_english"],
  },
  {
    id: "coach_sara",
    userId: "user_sara",
    ownershipId: "ten_tlp",
    fullName: "Sara Wong",
    email: "sara@learningplanet.com",
    phone: "+1-604-555-0105",
    locationId: "loc_tlp_langley",
    status: "active",
    planetIds: ["pl_english", "pl_arts"],
  },
  {
    id: "coach_mike",
    userId: "user_mike",
    ownershipId: "ten_tlp",
    fullName: "Mike Thompson",
    email: "mike@learningplanet.com",
    phone: "+1-604-555-0106",
    locationId: "loc_tlp_surrey",
    status: "active",
    planetIds: ["pl_arts", "pl_finance"],
  },
  {
    id: "coach_lisa",
    userId: "user_lisa",
    ownershipId: "ten_mla",
    fullName: "Lisa Kumar",
    email: "lisa@mapleleafacademy.ca",
    phone: "+1-416-555-0107",
    locationId: "loc_mla_toronto",
    status: "active",
    planetIds: ["pl_chess", "pl_finance"],
  },
];

export const COACH_BY_ID: Record<string, Coach> = Object.fromEntries(
  COACHES.map((c) => [c.id, c]),
);

export const DEMO_COACH = COACHES[0];

const fullWeek: { day: 0 | 1 | 2 | 3 | 4 | 5 | 6; start: string; end: string }[] = [
  { day: 1, start: "16:00", end: "20:00" },
  { day: 2, start: "16:00", end: "20:00" },
  { day: 3, start: "16:00", end: "20:00" },
  { day: 4, start: "16:00", end: "20:00" },
  { day: 5, start: "16:00", end: "20:00" },
  { day: 6, start: "09:00", end: "17:00" },
];

export const COACH_AVAILABILITY: CoachAvailability[] = COACHES.flatMap((c) =>
  fullWeek.map((w, i) => ({
    id: `avail_${c.id}_${i}`,
    coachId: c.id,
    dayOfWeek: w.day,
    startTime: w.start,
    endTime: w.end,
    effectiveFrom: "2026-01-01",
  })),
);

export const COACH_LEAVES: CoachLeave[] = [
  { id: "leave_james_1", coachId: "coach_james", leaveDate: "2026-05-04", reason: "Medical leave" },
  { id: "leave_james_2", coachId: "coach_james", leaveDate: "2026-05-05", reason: "Medical leave" },
  { id: "leave_james_3", coachId: "coach_james", leaveDate: "2026-05-06", reason: "Medical leave" },
  { id: "leave_james_4", coachId: "coach_james", leaveDate: "2026-05-07", reason: "Medical leave" },
];
