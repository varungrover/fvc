"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  role: string;
  full_name: string;
  email: string;
};

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const NAV_ITEMS: Record<string, NavItem[]> = {
  parent: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "My Children", href: "/parent/children", icon: "family_restroom" },
    { label: "Courses", href: "/courses", icon: "school" },
    { label: "My Enrollments", href: "/parent/enrollments", icon: "assignment_turned_in" },
    { label: "Events", href: "/events", icon: "event" },
    { label: "Payments", href: "/parent/payments", icon: "payments" },
  ],
  student: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "My Lessons", href: "/student/lessons", icon: "menu_book" },
    { label: "Check-In", href: "/student/checkin", icon: "how_to_reg" },
    { label: "Achievements", href: "/student/achievements", icon: "emoji_events" },
    { label: "Leaderboard", href: "/student/leaderboard", icon: "leaderboard" },
  ],
  coach: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "My Schedule", href: "/coach/schedule", icon: "calendar_month" },
    { label: "Attendance", href: "/coach/attendance", icon: "how_to_reg" },
    { label: "Students", href: "/coach/students", icon: "groups" },
    { label: "Leave Request", href: "/coach/leave", icon: "event_busy" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Students", href: "/admin/students", icon: "groups" },
    { label: "Attendance", href: "/admin/attendance", icon: "how_to_reg" },
    { label: "Courses", href: "/admin/courses", icon: "school" },
    { label: "Sessions", href: "/admin/sessions", icon: "calendar_month" },
    { label: "Staff", href: "/admin/staff", icon: "badge" },
    { label: "Coupons", href: "/admin/coupons", icon: "local_offer" },
    { label: "Loyalty", href: "/admin/loyalty", icon: "card_giftcard" },
    { label: "Merchandise", href: "/admin/merchandise", icon: "inventory_2" },
    { label: "Revenue", href: "/admin/revenue", icon: "bar_chart" },
    { label: "Events", href: "/admin/events", icon: "event" },
  ],
  super_admin: [
    { label: "Locations", href: "/dashboard", icon: "location_on" },
    { label: "Users", href: "/super-admin/users", icon: "manage_accounts" },
  ],
  marketing: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Leads", href: "/marketing/leads", icon: "person_add" },
    { label: "Lists", href: "/marketing/lists", icon: "segment" },
    { label: "Campaigns", href: "/marketing/campaigns", icon: "campaign" },
    { label: "Do Not Contact", href: "/marketing/dnc", icon: "block" },
  ],
};

export default function Sidebar({ profile }: { profile: Profile }) {
  const pathname = usePathname();
  const router = useRouter();
  const navItems = NAV_ITEMS[profile.role] ?? NAV_ITEMS.parent;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = profile.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className="w-64 flex flex-col flex-shrink-0"
      style={{ background: "linear-gradient(180deg, #0b0924 0%, #1a1040 100%)" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)", boxShadow: "0 0 12px rgba(124,58,237,0.4)" }}
        >
          <span className="text-white text-lg">♟</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Fraser Valley</p>
          <p className="text-white/40 text-xs">Chess Academy</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group border-l-[3px] pl-[9px]"
              style={
                isActive
                  ? { background: "rgba(124,58,237,0.25)", borderLeftColor: "#a78bfa", color: "#ffffff" }
                  : { borderLeftColor: "transparent", color: "rgba(255,255,255,0.6)" }
              }
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLElement).style.color = "#ffffff";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                }
              }}
            >
              <span
                className="material-icons-round text-[20px]"
                style={{ color: isActive ? "#a78bfa" : "rgba(255,255,255,0.4)" }}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings + User */}
      <div className="border-t border-white/[0.06] px-3 py-3 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border-l-[3px] pl-[9px]"
          style={
            pathname === "/settings"
              ? { background: "rgba(124,58,237,0.25)", borderLeftColor: "#a78bfa", color: "#ffffff" }
              : { borderLeftColor: "transparent", color: "rgba(255,255,255,0.6)" }
          }
        >
          <span className="material-icons-round text-[20px]" style={{ color: "rgba(255,255,255,0.4)" }}>settings</span>
          Settings
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
          >
            <span className="text-white text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{profile.full_name}</p>
            <p className="text-white/40 text-xs capitalize">{profile.role.replace("_", " ")}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="transition-colors"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#f87171")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)")}
          >
            <span className="material-icons-round text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
