"use client";

import { TLP, planetStyle } from "@/lib/theme/tokens";
import type { ReactNode } from "react";
import { Crown, Calculator, BookOpen, DollarSign, Palette, Briefcase, Globe } from "lucide-react";

type BadgeSize = "sm" | "md";

interface Props {
  label: ReactNode;
  color?: string;
  bg?: string;
  size?: BadgeSize;
}

export function Badge({ label, color, bg, size = "sm" }: Props) {
  return (
    <span
      style={{
        background: bg ?? TLP.tealLight,
        color: color ?? TLP.teal,
        padding: size === "sm" ? "2px 8px" : "4px 12px",
        borderRadius: 20,
        fontSize: size === "sm" ? 11 : 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
        letterSpacing: "0.2px",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {label}
    </span>
  );
}

interface PlanetBadgeProps {
  planet: string;
  size?: BadgeSize;
}

function getPlanetIcon(name: string, size = 12) {
  switch (name) {
    case "Chess": return <Crown size={size} strokeWidth={2} />;
    case "Math":
    case "Maths": return <Calculator size={size} strokeWidth={2} />;
    case "English": return <BookOpen size={size} strokeWidth={2} />;
    case "Finance": return <DollarSign size={size} strokeWidth={2} />;
    case "Arts": return <Palette size={size} strokeWidth={2} />;
    case "Business": return <Briefcase size={size} strokeWidth={2} />;
    default: return <Globe size={size} strokeWidth={2} />;
  }
}

export function PlanetBadge({ planet, size = "sm" }: PlanetBadgeProps) {
  const p = planetStyle(planet);
  const iconSize = size === "sm" ? 11 : 12;
  const label = (
    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
      {getPlanetIcon(planet, iconSize)}
      <span>{planet}</span>
    </span>
  );
  return <Badge label={label} color={p.color} bg={p.bg} size={size} />;
}
