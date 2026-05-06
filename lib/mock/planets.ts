import type { Planet } from "@/lib/types";

export const PLANETS: Planet[] = [
  {
    id: "pl_chess",
    name: "Chess",
    description: "Strategy, problem-solving, and tournament play.",
    isActive: true,
  },
  {
    id: "pl_math",
    name: "Math",
    description: "Curriculum-aligned math from grade 1 to grade 10.",
    isActive: true,
  },
  {
    id: "pl_english",
    name: "English",
    description: "Reading comprehension, writing, and verbal reasoning.",
    isActive: true,
  },
  {
    id: "pl_finance",
    name: "Finance",
    description: "Personal money skills and intro to investing.",
    isActive: true,
  },
  {
    id: "pl_arts",
    name: "Arts",
    description: "Visual arts, drawing, and creative expression.",
    isActive: true,
  },
];

export const PLANET_BY_ID: Record<string, Planet> = Object.fromEntries(
  PLANETS.map((p) => [p.id, p]),
);
