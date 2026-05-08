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
        height: "100vh",
        overflow: "hidden",
        width: "100vw"
      }}
    >
      {/* Sidebar Section - Full Vertical Height */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <Sidebar 
          items={navItems} 
          collapsed={collapsed} 
          brand={{
            productName: topBar.productName,
            productIcon: topBar.productIcon,
            tenantName: topBar.tenantName
          }}
        />
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
            zIndex: 10,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Main Content Area - Contains TopBar and Page Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <TopBar {...topBar} />
        <main
          style={{
            flex: 1,
            overflow: "auto",
            background: TLP.bg,
            position: "relative",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ flex: 1 }}>{children}</div>
          <footer
            style={{
              padding: "20px 40px",
              borderTop: "1px solid rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "rgba(0,0,0,0.4)",
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            <div>© {new Date().getFullYear()} {topBar.tenantName || 'Franchisor'}. All rights reserved.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span>Powered by</span>
              <span style={{ fontWeight: 800, color: TLP.navy, letterSpacing: "-0.2px" }}>
                {topBar.productName}
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
