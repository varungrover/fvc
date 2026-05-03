"use client";

import type { ReactNode, MouseEvent } from "react";
import { TLP } from "@/lib/theme/tokens";
import { Card } from "./Card";

interface Props {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaColor?: string;
  icon?: ReactNode;
  iconColor?: string;
  iconBg?: string;
  onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

export function StatTile({
  label,
  value,
  delta,
  deltaColor = TLP.green,
  icon,
  iconColor = TLP.teal,
  iconBg = TLP.tealLight,
  onClick,
}: Props) {
  return (
    <Card hover={!!onClick} onClick={onClick} style={{ padding: "18px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div
            style={{
              fontSize: 12,
              color: TLP.gray500,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 6,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: TLP.navy, lineHeight: 1.1 }}>
            {value}
          </div>
          {delta ? (
            <div style={{ fontSize: 12, color: deltaColor, fontWeight: 600, marginTop: 4 }}>
              {delta}
            </div>
          ) : null}
        </div>
        {icon ? (
          <div
            style={{
              fontSize: 24,
              background: iconBg,
              color: iconColor,
              width: 44,
              height: 44,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
        ) : null}
      </div>
    </Card>
  );
}
