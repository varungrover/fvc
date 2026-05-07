import type { Level } from "@/lib/types";

export const LEVELS: Level[] = [
  // Chess
  { id: "lvl_chess_pp", planetId: "pl_chess", name: "PP", sortOrder: 1, isActive: true },
  { id: "lvl_chess_rr", planetId: "pl_chess", name: "RR", sortOrder: 2, isActive: true },

  // Math
  { id: "lvl_math_g3", planetId: "pl_math", name: "Grade 3", sortOrder: 3, isActive: true },
  { id: "lvl_math_g5", planetId: "pl_math", name: "Grade 5", sortOrder: 5, isActive: true },
  { id: "lvl_math_g7", planetId: "pl_math", name: "Grade 7", sortOrder: 7, isActive: true },
  { id: "lvl_math_g9", planetId: "pl_math", name: "Grade 9", sortOrder: 9, isActive: true },

  // English
  { id: "lvl_eng_g3", planetId: "pl_english", name: "Grade 3", sortOrder: 3, isActive: true },
  { id: "lvl_eng_g5", planetId: "pl_english", name: "Grade 5", sortOrder: 5, isActive: true },
  { id: "lvl_eng_g8", planetId: "pl_english", name: "Grade 8", sortOrder: 8, isActive: true },

  // Finance
  { id: "lvl_fin_basics", planetId: "pl_finance", name: "Money Basics", sortOrder: 1, isActive: true },
  { id: "lvl_fin_invest", planetId: "pl_finance", name: "Intro to Investing", sortOrder: 2, isActive: true },

  // Arts
  { id: "lvl_arts_beg", planetId: "pl_arts", name: "Beginner", sortOrder: 1, isActive: true },
  { id: "lvl_arts_int", planetId: "pl_arts", name: "Intermediate", sortOrder: 2, isActive: true },
];

export const LEVEL_BY_ID: Record<string, Level> = Object.fromEntries(
  LEVELS.map((l) => [l.id, l]),
);

export const LEVELS_BY_PLANET: Record<string, Level[]> = LEVELS.reduce(
  (acc, lvl) => {
    (acc[lvl.planetId] ??= []).push(lvl);
    return acc;
  },
  {} as Record<string, Level[]>,
);
