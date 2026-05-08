"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TLP } from "@/lib/theme/tokens";
import {
  Home, Users, ClipboardList, BookOpen, CreditCard, Bell, User,
  Calendar, Trophy, Edit, CalendarDays, Palmtree, Globe, Library,
  MapPin, UserCircle, Tag, Ticket, Banknote, TrendingUp, PieChart,
  LogOut, HelpCircle
} from "lucide-react";

const IconMap: Record<string, React.FC<any>> = {
  Home, Users, ClipboardList, BookOpen, CreditCard, Bell, User,
  Calendar, Trophy, Edit, CalendarDays, Palmtree, Globe, Library,
  MapPin, UserCircle, Tag, Ticket, Banknote, TrendingUp, PieChart,
  LogOut, HelpCircle
};

export type NavItem =
  | { kind: "link"; id: string; label: string; href: string; icon: string; position?: "top" | "bottom" }
  | { kind: "divider"; id: string; position?: "top" | "bottom" };

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

    const IconComponent = item.kind === "link" && item.icon ? IconMap[item.icon] || HelpCircle : HelpCircle;

    return (
      <Link
        key={item.id}
        href={item.href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          margin: collapsed ? "4px 8px" : "4px 12px",
          padding: collapsed ? "10px" : "10px 14px",
          borderRadius: 8,
          background: isActive ? "rgba(10,155,138,0.15)" : "transparent",
          color: isActive ? TLP.teal : "rgba(255,255,255,0.6)",
          fontSize: 13,
          fontWeight: isActive ? 700 : 500,
          transition: "all 0.15s ease",
          justifyContent: collapsed ? "center" : "flex-start",
          textDecoration: "none",
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.color = "rgba(255,255,255,0.95)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
          }
          e.currentTarget.style.transform = "scale(1)";
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
        onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
      >
        <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {IconComponent && <IconComponent size={18} strokeWidth={isActive ? 2.5 : 2} />}
        </span>
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
            {brand.productIcon ? (
              IconMap[brand.productIcon] ? 
                React.createElement(IconMap[brand.productIcon], { size: 16, strokeWidth: 2.5 }) : 
                <Globe size={16} strokeWidth={2.5} />
            ) : <Globe size={16} strokeWidth={2.5} />}
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
        {items.filter(i => i.position !== "bottom").map(renderItem)}
      </div>

      {/* Bottom Actions */}
      <div style={{ paddingBottom: 60 }}>
        {items.filter(i => i.position === "bottom").map(renderItem)}
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
            width: collapsed ? "calc(100% - 16px)" : "calc(100% - 24px)",
            margin: collapsed ? "4px 8px" : "4px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: collapsed ? "10px" : "10px 14px",
            borderRadius: 8,
            background: "transparent",
            color: "rgba(255,255,255,0.6)",
            fontSize: 13,
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
            justifyContent: collapsed ? "center" : "flex-start",
            textAlign: "left",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(244,63,94,0.1)"; // Soft red
            e.currentTarget.style.color = TLP.red;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(255,255,255,0.6)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.97)"}
          onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <LogOut size={18} strokeWidth={2} />
          </span>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </nav>
  );
}
