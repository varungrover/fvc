"use client";

import { TLP } from "@/lib/theme/tokens";

export type Tab = { id: string; label: string };

interface Props {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function Tabs({ tabs, active, onChange }: Props) {
  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        borderBottom: `2px solid ${TLP.gray100}`,
        marginBottom: 20,
      }}
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            style={{
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? TLP.teal : TLP.gray500,
              background: "none",
              border: "none",
              cursor: "pointer",
              borderBottom: `2px solid ${isActive ? TLP.teal : "transparent"}`,
              marginBottom: -2,
              transition: "color 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
