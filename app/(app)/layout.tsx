"use client";

import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { type NavItem } from "@/components/layout/Sidebar";
import { DEMO_ACCOUNTS } from "@/lib/mock/auth";
import type { Role } from "@/lib/types";

const CUSTOMER_NAV: NavItem[] = [
  { kind: "link", id: "dashboard", label: "Dashboard", href: "/customer/dashboard", icon: "🏠" },
  { kind: "link", id: "members", label: "My Members", href: "/customer/members", icon: "👨‍👧" },
  { kind: "link", id: "enroll", label: "Enroll", href: "/customer/enroll", icon: "📋" },
  { kind: "link", id: "lms", label: "Learning Portal", href: "/customer/lms", icon: "📚" },
  { kind: "link", id: "events", label: "Events & Camps", href: "/customer/events", icon: "🎉" },
  { kind: "divider", id: "d1" },
  { kind: "link", id: "payments", label: "Payments", href: "/customer/payments", icon: "💳" },
  { kind: "link", id: "notifications", label: "Notifications", href: "/customer/notifications", icon: "🔔" },
  { kind: "link", id: "settings", label: "Settings", href: "/customer/settings", icon: "⚙️" },
];

const COACH_NAV: NavItem[] = [
  { kind: "link", id: "dashboard", label: "Dashboard", href: "/coach/dashboard", icon: "🏠" },
  { kind: "link", id: "sessions", label: "Sessions", href: "/coach/sessions", icon: "📅" },
  { kind: "link", id: "students", label: "Students", href: "/coach/students", icon: "👥" },
  { kind: "link", id: "achievements", label: "Achievements", href: "/coach/achievements", icon: "🏆" },
  { kind: "link", id: "lms", label: "LMS Authoring", href: "/coach/lms", icon: "✏️" },
  { kind: "divider", id: "d1" },
  { kind: "link", id: "availability", label: "Availability", href: "/coach/availability", icon: "🗓️" },
];

const ADMIN_NAV: NavItem[] = [
  { kind: "link", id: "dashboard", label: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
  { kind: "link", id: "locations", label: "Locations", href: "/admin/locations", icon: "📍" },
  { kind: "link", id: "coaches", label: "Coaches", href: "/admin/coaches", icon: "👤" },
  { kind: "link", id: "customers", label: "Customers", href: "/admin/customers", icon: "👥" },
  { kind: "link", id: "roster", label: "Roster", href: "/admin/roster", icon: "📋" },
  { kind: "divider", id: "d1" },
  { kind: "link", id: "events", label: "Events & Camps", href: "/admin/events", icon: "🎉" },
  { kind: "link", id: "payments", label: "Payments", href: "/admin/payments", icon: "💳" },
  { kind: "link", id: "discounts", label: "Discounts", href: "/admin/discounts", icon: "🏷️" },
  { kind: "link", id: "holidays", label: "Holidays", href: "/admin/holidays", icon: "🗓️" },
  { kind: "link", id: "tickets", label: "Tickets", href: "/admin/tickets", icon: "🎫" },
  { kind: "link", id: "planets", label: "Planets", href: "/admin/planets", icon: "🪐" },
];

const FRANCHISEE_ADMIN_NAV: NavItem[] = [
  { kind: "link", id: "dashboard", label: "Dashboard", href: "/franchisee-admin/dashboard", icon: "🏠" },
  { kind: "link", id: "locations", label: "Locations", href: "/franchisee-admin/locations", icon: "📍" },
  { kind: "link", id: "coaches", label: "Coaches", href: "/franchisee-admin/coaches", icon: "👤" },
  { kind: "link", id: "customers", label: "Customers", href: "/franchisee-admin/customers", icon: "👥" },
  { kind: "link", id: "roster", label: "Roster", href: "/franchisee-admin/roster", icon: "📋" },
  { kind: "divider", id: "d1" },
  { kind: "link", id: "holidays", label: "Holidays", href: "/franchisee-admin/holidays", icon: "🗓️" },
  { kind: "link", id: "price-requests", label: "Price Requests", href: "/franchisee-admin/price-requests", icon: "💸" },
  { kind: "link", id: "tickets", label: "Tickets", href: "/franchisee-admin/tickets", icon: "🎫" },
];

const MANAGEMENT_NAV: NavItem[] = [
  { kind: "link", id: "dashboard", label: "Dashboard", href: "/management/dashboard", icon: "🏠" },
  { kind: "link", id: "revenue", label: "Revenue", href: "/management/revenue", icon: "📈" },
  { kind: "link", id: "pricing", label: "Pricing", href: "/management/pricing", icon: "💸" },
  { kind: "link", id: "locations", label: "Locations", href: "/management/locations", icon: "📍" },
  { kind: "link", id: "reports", label: "Reports", href: "/management/reports", icon: "📊" },
];

function deriveRole(pathname: string): Role | null {
  if (pathname.startsWith("/customer")) return "customer";
  if (pathname.startsWith("/coach")) return "coach";
  if (pathname.startsWith("/franchisee-admin")) return "franchisee_admin";
  if (pathname.startsWith("/admin")) return "franchisor_admin";
  if (pathname.startsWith("/management")) {
    // Default to franchisor_management when ambiguous
    return "franchisor_management";
  }
  return null;
}

function navForRole(role: Role): NavItem[] {
  switch (role) {
    case "customer": return CUSTOMER_NAV;
    case "coach": return COACH_NAV;
    case "franchisor_admin": return ADMIN_NAV;
    case "franchisee_admin": return FRANCHISEE_ADMIN_NAV;
    case "franchisor_management":
    case "franchisee_management": return MANAGEMENT_NAV;
  }
}

function roleLabelFor(role: Role): string {
  switch (role) {
    case "customer": return "Customer";
    case "coach": return "Coach";
    case "franchisor_admin": return "Franchisor Admin";
    case "franchisee_admin": return "Franchisee Admin";
    case "franchisor_management": return "Management";
    case "franchisee_management": return "Management";
  }
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const role = deriveRole(pathname);

  // Pick demo account for this role (falls back to first account)
  const account = role
    ? (DEMO_ACCOUNTS.find((a) => a.role === role) ?? DEMO_ACCOUNTS[0])
    : DEMO_ACCOUNTS[0];

  const nav = role ? navForRole(role) : CUSTOMER_NAV;
  const roleLabel = role ? roleLabelFor(role) : "—";

  return (
    <AppShell
      navItems={nav}
      topBar={{
        productName: "Mentora",
        tenantName: account.ownershipId === "ten_tlp"
          ? "The Learning Planet"
          : account.ownershipId === "ten_mla"
            ? "Maple Leaf Academy"
            : undefined,
        roleLabel,
        userName: account.fullName,
      }}
    >
      {children}
    </AppShell>
  );
}
