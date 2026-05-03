"use client";

import { TLP } from "@/lib/theme/tokens";

interface Props {
  value: number;
  max?: number;
  color?: string;
  height?: number;
}

export function ProgressBar({ value, max = 100, color = TLP.teal, height = 6 }: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div
      style={{
        background: TLP.gray100,
        borderRadius: 99,
        height,
        overflow: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: color,
          borderRadius: 99,
          transition: "width 0.4s",
        }}
      />
    </div>
  );
}
