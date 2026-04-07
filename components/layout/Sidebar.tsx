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
    { label: "Events", href: "/events", icon: "event" },
    { label: "Payments", href: "/parent/payments", icon: "payments" },
  ],
  student: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "My Lessons", href: "/student/lessons", icon: "menu_book" },
    { label: "Achievements", href: "/student/achievements", icon: "emoji_events" },
    { label: "Leaderboard", href: "/student/leaderboard", icon: "leaderboard" },
  ],
  coach: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "My Schedule", href: "/coach/schedule", icon: "calendar_month" },
    { label: "Attendance", href: "/coach/attendance", icon: "how_to_reg" },
    { label: "Students", href: "/coach/students", icon: "groups" },
  ],
  admin: [
    { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
    { label: "Students", href: "/admin/students", icon: "groups" },
    { label: "Courses", href: "/admin/courses", icon: "school" },
    { label: "Staff", href: "/admin/staff", icon: "badge" },
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
    { label: "Campaigns", href: "/marketing/campaigns", icon: "campaign" },
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
    <aside className="w-64 bg-sidebar-dark border-r border-border-dark flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border-dark">
        <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(43,108,238,0.25)] flex-shrink-0">
          <span className="text-white text-lg">♟</span>
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">Fraser Valley</p>
          <p className="text-slate-500 text-xs">Chess Academy</p>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-primary/10 text-primary border-l-[3px] border-primary pl-[9px]"
                  : "text-slate-400 hover:text-white hover:bg-surface-hover border-l-[3px] border-transparent pl-[9px]"
              }`}
            >
              <span className={`material-icons-round text-[20px] ${isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300"}`}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings + User */}
      <div className="border-t border-border-dark px-3 py-3 space-y-0.5">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
            pathname === "/settings"
              ? "bg-primary/10 text-primary border-l-[3px] border-primary pl-[9px]"
              : "text-slate-400 hover:text-white hover:bg-surface-hover border-l-[3px] border-transparent pl-[9px]"
          }`}
        >
          <span className="material-icons-round text-[20px] text-slate-500 group-hover:text-slate-300">settings</span>
          Settings
        </Link>

        <div className="flex items-center gap-3 px-3 py-2.5 mt-1">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-xs font-bold">{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{profile.full_name}</p>
            <p className="text-slate-500 text-xs capitalize">{profile.role.replace("_", " ")}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-slate-500 hover:text-error transition-colors"
          >
            <span className="material-icons-round text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
