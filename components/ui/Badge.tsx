"use client";

import { TLP, planetStyle } from "@/lib/theme/tokens";

type BadgeSize = "sm" | "md";

interface Props {
  label: string;
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
        display: "inline-block",
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

export function PlanetBadge({ planet, size = "sm" }: PlanetBadgeProps) {
  const p = planetStyle(planet);
  return <Badge label={`${p.icon} ${planet}`} color={p.color} bg={p.bg} size={size} />;
}
