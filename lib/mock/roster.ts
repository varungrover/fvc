import type { Roster, RosterAssignment, Batch } from "@/lib/types";
import { BATCHES } from "./batches";
import { COACH_LEAVES } from "./coaches";

/**
 * Today is 2026-05-03 (Sunday). The next two roster weeks are:
 *   Week of Mon 2026-05-04
 *   Week of Mon 2026-05-11
 *
 * Each batch contributes one session per week on its `dayOfWeek`.
 * Assignments default to the batch's coach. For batches whose coach is on
 * leave on the session date, we drop the coach (unassigned) — matching the
 * franchisor admin's "fill the gap" workflow.
 */

const WEEK_STARTS = ["2026-05-04", "2026-05-11"] as const;

function dateForWeek(weekStart: string, dayOfWeek: number): string {
  const [y, m, d] = weekStart.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  // weekStart is a Monday → offset = (dayOfWeek + 6) % 7
  const offset = (dayOfWeek + 6) % 7;
  start.setUTCDate(start.getUTCDate() + offset);
  return start.toISOString().slice(0, 10);
}

const onLeaveDates = new Set(COACH_LEAVES.map((l) => `${l.coachId}|${l.leaveDate}`));

export const ROSTERS: Roster[] = [
  // One roster per (location, week) for TLP locations.
  ...["loc_tlp_surrey", "loc_tlp_abbotsford", "loc_tlp_langley"].flatMap((locId) =>
    WEEK_STARTS.map((wk) => ({
      id: `ros_${locId}_${wk}`,
      locationId: locId,
      weekStartDate: wk,
      publishedAt: "2026-04-28T18:00:00Z",
    })),
  ),
];

export const ROSTER_ASSIGNMENTS: RosterAssignment[] = ROSTERS.flatMap((r) => {
  const locBatches = BATCHES.filter((b: Batch) => b.locationId === r.locationId && b.isActive);
  return locBatches.map((b) => {
    const sessionDate = dateForWeek(r.weekStartDate, b.dayOfWeek);
    const coachOnLeave =
      b.coachId && onLeaveDates.has(`${b.coachId}|${sessionDate}`);
    return {
      id: `ra_${b.id}_${r.weekStartDate}`,
      rosterId: r.id,
      coachId: coachOnLeave ? undefined : b.coachId,
      batchId: b.id,
      sessionDate,
    };
  });
});

export const ASSIGNMENT_BY_ID: Record<string, RosterAssignment> = Object.fromEntries(
  ROSTER_ASSIGNMENTS.map((a) => [a.id, a]),
);
