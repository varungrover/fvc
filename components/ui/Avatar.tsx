"use client";

import { TLP } from "@/lib/theme/tokens";

interface Props {
  name: string;
  size?: number;
  color?: string;
}

export function Avatar({ name, size = 36, color = TLP.teal }: Props) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div
      aria-label={`Avatar for ${name}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
        letterSpacing: "-0.5px",
      }}
    >
      {initials}
    </div>
  );
}
