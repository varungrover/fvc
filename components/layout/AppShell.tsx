"use client";

import { useState, type ReactNode } from "react";
import { Sidebar, type NavItem } from "./Sidebar";
import { TopBar } from "./TopBar";
import { TLP } from "@/lib/theme/tokens";

interface Props {
  navItems: NavItem[];
  topBar: {
    productName: string;
    productIcon?: string;
    tenantName?: string;
    roleLabel: string;
    userName: string;
  };
  children: ReactNode;
}

export function AppShell({ navItems, topBar, children }: Props) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <TopBar {...topBar} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <Sidebar items={navItems} collapsed={collapsed} />
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              position: "absolute",
              bottom: 16,
              right: collapsed ? "50%" : 12,
              transform: collapsed ? "translateX(50%)" : "none",
              background: "rgba(255,255,255,0.12)",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              borderRadius: 6,
              width: 28,
              height: 28,
              cursor: "pointer",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        <main style={{ flex: 1, overflow: "auto", background: TLP.bg }}>{children}</main>
      </div>
    </div>
  );
}
