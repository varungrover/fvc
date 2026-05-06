import type { MemberAchievement } from "@/lib/types";

export const ACHIEVEMENTS: MemberAchievement[] = [
  {
    id: "ach_aarav_knight",
    memberId: "mem_aarav",
    awardedBy: "coach_priya",
    badgeName: "Knight's Gambit",
    notes: "Exceptional chess problem solving — solved 5 advanced knight fork puzzles without hints.",
    awardedAt: "2026-04-15T16:00:00Z",
  },
  {
    id: "ach_aarav_rook",
    memberId: "mem_aarav",
    awardedBy: "coach_priya",
    badgeName: "Rook Star",
    notes: "Demonstrated strong endgame rook technique in three consecutive matches.",
    awardedAt: "2026-03-10T15:30:00Z",
  },
  {
    id: "ach_anaya_math1",
    memberId: "mem_anaya",
    awardedBy: "coach_aiden",
    badgeName: "Algebra Ace",
    notes: "Scored 100% on the Grade 7 algebra module quiz.",
    awardedAt: "2026-04-22T14:00:00Z",
  },
  {
    id: "ach_anaya_math2",
    memberId: "mem_anaya",
    awardedBy: "coach_aiden",
    badgeName: "Speed Solver",
    notes: "Completed all 20 practice problems in under 15 minutes.",
    awardedAt: "2026-02-18T15:00:00Z",
  },
  {
    id: "ach_lin_chess",
    memberId: "mem_lin_chen",
    awardedBy: "coach_priya",
    badgeName: "Opening Master",
    notes: "Memorized and correctly applied 8 chess openings from the PP syllabus.",
    awardedAt: "2026-04-01T16:00:00Z",
  },
  {
    id: "ach_kai_math",
    memberId: "mem_kai_chen",
    awardedBy: "coach_aiden",
    badgeName: "Problem Pioneer",
    notes: "First in the class to complete the Grade 7 geometry unit.",
    awardedAt: "2026-03-25T15:00:00Z",
  },
  {
    id: "ach_ada_chess",
    memberId: "mem_ada_okafor",
    awardedBy: "coach_priya",
    badgeName: "Queen's Defender",
    notes: "Successfully defended against queen sacrifices in 3 out of 3 practice games.",
    awardedAt: "2026-04-30T16:30:00Z",
  },
];

export const ACHIEVEMENTS_BY_MEMBER: Record<string, MemberAchievement[]> =
  ACHIEVEMENTS.reduce(
    (acc, a) => {
      (acc[a.memberId] ??= []).push(a);
      return acc;
    },
    {} as Record<string, MemberAchievement[]>,
  );

export const ACHIEVEMENTS_BY_COACH: Record<string, MemberAchievement[]> =
  ACHIEVEMENTS.reduce(
    (acc, a) => {
      (acc[a.awardedBy] ??= []).push(a);
      return acc;
    },
    {} as Record<string, MemberAchievement[]>,
  );
