import type {
  Session,
  Attendance,
  SessionNote,
  AttendanceStatus,
} from "@/lib/types";
import { ENROLLMENTS } from "./enrollments";
import { BATCH_BY_ID } from "./batches";

/**
 * Historical sessions for the past 4 weeks (weeks of Apr 6, Apr 13, Apr 20,
 * Apr 27 in 2026). For each enrollment we synthesize one attendance row per
 * historical session of that enrollment's batch.
 *
 * Status pattern: present → present → absent → present (with one missed
 * payment-related no-show baked into the demo customer's child Aarav).
 */

const HISTORICAL_WEEK_STARTS = ["2026-04-06", "2026-04-13", "2026-04-20", "2026-04-27"] as const;

function dateForWeek(weekStart: string, dayOfWeek: number): string {
  const [y, m, d] = weekStart.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const offset = (dayOfWeek + 6) % 7;
  start.setUTCDate(start.getUTCDate() + offset);
  return start.toISOString().slice(0, 10);
}

interface BuildItem {
  session: Session;
  attendance: Attendance[];
  note: SessionNote;
}

const built: BuildItem[] = [];

const NOTES: Record<string, string> = {
  bat_chess_pp_mon: "Pawn structure basics — opposition + key squares.",
  bat_chess_pp_thu: "Opening principles — control the centre, develop pieces.",
  bat_chess_rr_tue: "Tactical motifs: fork, pin, skewer.",
  bat_chess_rr_sat: "Endgame: K+Q vs K mating pattern.",
  bat_math_g5_wed: "Fractions — common denominators and addition.",
  bat_math_g7_wed: "Linear equations in one variable.",
  bat_math_g7_fri: "Word problems involving rates and ratios.",
  bat_eng_g5_tue: "Reading comprehension — inferencing.",
  bat_fin_basics_sat: "Budgeting fundamentals: needs vs wants.",
  bat_arts_beg_sat: "Sketching — basic shapes and shading.",
};

let coachIdForBatch = (batchId: string) => BATCH_BY_ID[batchId]?.coachId ?? "coach_priya";

HISTORICAL_WEEK_STARTS.forEach((wk, weekIdx) => {
  ENROLLMENTS.forEach((enr) => {
    const batch = BATCH_BY_ID[enr.batchId];
    if (!batch) return;
    const sessionDate = dateForWeek(wk, batch.dayOfWeek);
    const sessionId = `sess_${enr.batchId}_${wk}`;
    const assignmentId = `ra_${enr.batchId}_${wk}`;

    const session: Session = {
      id: sessionId,
      rosterAssignmentId: assignmentId,
      batchId: enr.batchId,
      sessionDate,
    };

    // Pattern: present, present, absent (week 3), present
    let status: AttendanceStatus = "present";
    if (weekIdx === 2) status = "absent";

    const attendance: Attendance = {
      id: `att_${sessionId}_${enr.memberId}`,
      sessionId,
      memberId: enr.memberId,
      enrollmentId: enr.id,
      status,
      markedAt: `${sessionDate}T${batch.endTime}:00Z`,
    };

    const noteText = NOTES[enr.batchId] ?? "Session held.";
    const note: SessionNote = {
      id: `note_${sessionId}`,
      sessionId,
      coachId: coachIdForBatch(enr.batchId),
      topicCovered: noteText,
      homeworkNotes: "Practice problems sent home.",
    };

    // Dedup sessions/notes (same session may serve multiple enrollments)
    if (!built.find((b) => b.session.id === sessionId)) {
      built.push({ session, attendance: [attendance], note });
    } else {
      built.find((b) => b.session.id === sessionId)!.attendance.push(attendance);
    }
  });
});

export const SESSIONS: Session[] = built.map((b) => b.session);
export const ATTENDANCE: Attendance[] = built.flatMap((b) => b.attendance);
export const SESSION_NOTES: SessionNote[] = built.map((b) => b.note);

export const SESSIONS_BY_BATCH: Record<string, Session[]> = SESSIONS.reduce(
  (acc, s) => {
    (acc[s.batchId] ??= []).push(s);
    return acc;
  },
  {} as Record<string, Session[]>,
);

export const ATTENDANCE_BY_MEMBER: Record<string, Attendance[]> = ATTENDANCE.reduce(
  (acc, a) => {
    (acc[a.memberId] ??= []).push(a);
    return acc;
  },
  {} as Record<string, Attendance[]>,
);
