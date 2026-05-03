"use client";

import type { ReactNode } from "react";
import { TLP } from "@/lib/theme/tokens";

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, action }: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 14,
        gap: 12,
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: TLP.navy }}>{title}</h2>
        {subtitle ? (
          <p style={{ margin: "2px 0 0", fontSize: 13, color: TLP.gray500 }}>{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
