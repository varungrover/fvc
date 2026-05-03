"use client";

import type { ReactNode } from "react";
import { TLP } from "@/lib/theme/tokens";

interface Props {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon = "📭", title, description, action }: Props) {
  return (
    <div
      style={{
        padding: "40px 24px",
        textAlign: "center",
        color: TLP.gray500,
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: TLP.navy, marginBottom: 4 }}>{title}</div>
      {description ? (
        <div style={{ fontSize: 13, color: TLP.gray500, marginBottom: action ? 16 : 0 }}>
          {description}
        </div>
      ) : null}
      {action}
    </div>
  );
}
