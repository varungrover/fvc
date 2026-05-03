"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TLP } from "@/lib/theme/tokens";

export type NavItem =
  | { kind: "link"; id: string; label: string; href: string; icon: string }
  | { kind: "divider"; id: string };

interface Props {
  items: NavItem[];
  collapsed?: boolean;
}

export function Sidebar({ items, collapsed = false }: Props) {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: collapsed ? 60 : 220,
        background: TLP.navy,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.2s",
        paddingTop: 8,
      }}
    >
      {items.map((item) => {
        if (item.kind === "divider") {
          return (
            <div
              key={item.id}
              style={{
                height: 1,
                background: "rgba(255,255,255,0.08)",
                margin: "8px 0",
              }}
            />
          );
        }
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href + "/"));

        return (
          <Link
            key={item.id}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: collapsed ? "12px 0" : "10px 16px",
              background: isActive ? "rgba(10,155,138,0.2)" : "transparent",
              color: isActive ? TLP.teal : "rgba(255,255,255,0.7)",
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              borderLeft: `3px solid ${isActive ? TLP.teal : "transparent"}`,
              transition: "all 0.15s",
              justifyContent: collapsed ? "center" : "flex-start",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
            }}
            onMouseLeave={(e) => {
              if (!isActive) (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
