import type { CourseVariant } from "@/lib/types";

const SETUP_FEE = 25;

/**
 * Pricing curve: weekly-once is the base, 2x adds ~26%, 3x adds ~44%.
 * Higher levels are pricier.
 */
function variants(
  levelId: string,
  base: number,
  imageUrl?: string,
): CourseVariant[] {
  return [
    { id: `${levelId}_1x`, levelId, frequencyPerWeek: 1, price: base, setupFee: SETUP_FEE, imageUrl, isActive: true },
    {
      id: `${levelId}_2x`,
      levelId,
      frequencyPerWeek: 2,
      price: Math.round(base * 1.26),
      setupFee: SETUP_FEE,
      imageUrl,
      isActive: true,
    },
    {
      id: `${levelId}_3x`,
      levelId,
      frequencyPerWeek: 3,
      price: Math.round(base * 1.44),
      setupFee: SETUP_FEE,
      imageUrl,
      isActive: true,
    },
  ];
}

export const COURSE_VARIANTS: CourseVariant[] = [
  ...variants("lvl_chess_pp", 139),
  ...variants("lvl_chess_rr", 159),
  ...variants("lvl_math_g3", 149),
  ...variants("lvl_math_g5", 159),
  ...variants("lvl_math_g7", 169),
  ...variants("lvl_math_g9", 189),
  ...variants("lvl_eng_g3", 149),
  ...variants("lvl_eng_g5", 159),
  ...variants("lvl_eng_g8", 179),
  ...variants("lvl_fin_basics", 129),
  ...variants("lvl_fin_invest", 169),
  ...variants("lvl_arts_beg", 119),
  ...variants("lvl_arts_int", 149),
];

export const VARIANT_BY_ID: Record<string, CourseVariant> = Object.fromEntries(
  COURSE_VARIANTS.map((v) => [v.id, v]),
);

export const VARIANTS_BY_LEVEL: Record<string, CourseVariant[]> = COURSE_VARIANTS.reduce(
  (acc, v) => {
    (acc[v.levelId] ??= []).push(v);
    return acc;
  },
  {} as Record<string, CourseVariant[]>,
);
