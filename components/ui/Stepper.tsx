"use client";

import { TLP } from "@/lib/theme/tokens";

export type Step = { id: string; label: string };

interface Props {
  steps: Step[];
  activeIndex: number;
}

export function Stepper({ steps, activeIndex }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, width: "100%" }}>
      {steps.map((s, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        const dotColor = isDone ? TLP.teal : isActive ? TLP.teal : TLP.gray200;
        const dotTextColor = isDone || isActive ? "#fff" : TLP.gray500;

        return (
          <div
            key={s.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              flex: i < steps.length - 1 ? 1 : "0 0 auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: dotColor,
                  color: dotTextColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                  border: isActive ? `2px solid ${TLP.teal}` : "none",
                  boxShadow: isActive ? `0 0 0 4px ${TLP.tealLight}` : undefined,
                }}
              >
                {isDone ? "✓" : i + 1}
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? TLP.navy : TLP.gray500,
                  whiteSpace: "nowrap",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: i < activeIndex ? TLP.teal : TLP.gray200,
                  margin: "0 8px",
                  transition: "background 0.2s",
                }}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
