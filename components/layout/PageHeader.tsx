"use client";

import type { ReactNode } from "react";
import { TLP } from "@/lib/theme/tokens";

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        gap: 12,
        marginBottom: 24,
      }}
    >
      <div>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: TLP.navy, letterSpacing: "-0.4px" }}>
          {title}
        </h1>
        {subtitle ? (
          <p style={{ margin: "4px 0 0", fontSize: 14, color: TLP.gray500 }}>{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div style={{ display: "flex", gap: 8 }}>{actions}</div> : null}
    </header>
  );
}
