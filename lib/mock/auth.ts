import type { Role, User } from "@/lib/types";

export interface DemoAccount {
  email: string;
  role: Role;
  /** The path the login screen redirects to on success. */
  landing: string;
  /** Display label for the role (used by the login screen list). */
  label: string;
  /** Single-line description shown in the demo accounts list. */
  description: string;
  /** Tenant the user belongs to (omitted for franchisor staff = "all corporate"). */
  ownershipId?: string;
  /** Friendly user name shown in the topbar. */
  fullName: string;
  /** Optional link to a domain record (customer or coach). */
  customerId?: string;
  coachId?: string;
}

export const DEMO_PASSWORD = "demo";

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "parent@demo.com",
    role: "customer",
    landing: "/customer/dashboard",
    label: "Customer",
    description: "Parent of two — manages members, enrolls in courses, pays bills.",
    fullName: "Raj Sharma",
    customerId: "cust_raj",
  },
  {
    email: "coach@demo.com",
    role: "coach",
    landing: "/coach/dashboard",
    label: "Coach",
    description: "Teaches Chess + Math at TLP Surrey — marks attendance and writes notes.",
    ownershipId: "ten_tlp",
    fullName: "Priya Patel",
    coachId: "coach_priya",
  },
  {
    email: "franchisor.admin@demo.com",
    role: "franchisor_admin",
    landing: "/admin/dashboard",
    label: "Franchisor Admin",
    description: "Runs The Learning Planet — manages locations, coaches, planets, roster.",
    ownershipId: "ten_tlp",
    fullName: "Mira Sandhu",
  },
  {
    email: "franchisee.admin@demo.com",
    role: "franchisee_admin",
    landing: "/franchisee-admin/dashboard",
    label: "Franchisee Admin",
    description: "Runs Maple Leaf Academy — same surface, scoped to one ownership.",
    ownershipId: "ten_mla",
    fullName: "Jordan Bell",
  },
  {
    email: "franchisor.mgmt@demo.com",
    role: "franchisor_mgmt",
    landing: "/management/dashboard",
    label: "Franchisor Management",
    description: "Network-wide revenue, pricing approvals, rollups across all ownerships.",
    ownershipId: "ten_tlp",
    fullName: "Anika Iyer",
  },
  {
    email: "franchisee.mgmt@demo.com",
    role: "franchisee_mgmt",
    landing: "/management/dashboard",
    label: "Franchisee Management",
    description: "Single-ownership revenue + price-change requests upstream.",
    ownershipId: "ten_mla",
    fullName: "David Chen",
  },
];

export const ACCOUNT_BY_EMAIL: Record<string, DemoAccount> = Object.fromEntries(
  DEMO_ACCOUNTS.map((a) => [a.email.toLowerCase(), a]),
);

/**
 * Resolve a login attempt against the demo accounts list. Any password works
 * (the prototype has no real auth) — only the email needs to match.
 *
 * Returns null when the email isn't a known demo account.
 */
export function resolveDemoLogin(email: string): DemoAccount | null {
  return ACCOUNT_BY_EMAIL[email.trim().toLowerCase()] ?? null;
}

/** Synthesized User rows mirroring the ER diagram's `users` table. */
export const USERS: User[] = DEMO_ACCOUNTS.map((a) => ({
  id: `user_${a.role}`,
  email: a.email,
  role: a.role,
  ownershipId: a.ownershipId,
  fullName: a.fullName,
  mustResetPw: false,
}));
