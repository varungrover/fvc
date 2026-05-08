"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TLP } from "@/lib/theme/tokens";

export type NavItem =
  | { kind: "link"; id: string; label: string; href: string; icon: string }
  | { kind: "divider"; id: string };

interface Props {
  items: NavItem[];
  collapsed?: boolean;
  brand?: {
    productName: string;
    productIcon?: string;
    tenantName?: string;
  };
}

export function Sidebar({ items, collapsed = false, brand }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = "/login";
    }
  }

  const renderItem = (item: NavItem) => {
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
  };

  return (
    <nav
      style={{
        width: collapsed ? 60 : 220,
        background: TLP.navy,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        transition: "width 0.2s",
        height: "100%",
        borderRight: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      {/* Brand Section */}
      {brand && (
        <div
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            padding: collapsed ? "0" : "0 16px",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 10,
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: TLP.teal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            {brand.productIcon || "🌍"}
          </div>
          {!collapsed && (
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 14,
                  letterSpacing: "-0.3px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {brand.tenantName || brand.productName}
              </span>
            </div>
          )}
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", paddingTop: brand ? 0 : 16 }}>
        {items.map(renderItem)}
      </div>

      {/* Bottom Actions */}
      <div style={{ paddingBottom: 60 }}>
        <div
          style={{
            height: 1,
            background: "rgba(255,255,255,0.08)",
            margin: "8px 0",
          }}
        />
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "12px 0" : "10px 16px",
            background: "transparent",
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
            fontWeight: 500,
            border: "none",
            borderLeft: "3px solid transparent",
            cursor: "pointer",
            transition: "all 0.15s",
            justifyContent: collapsed ? "center" : "flex-start",
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLButtonElement).style.color = TLP.red;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
          }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>🚪</span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </nav>
  );
}
