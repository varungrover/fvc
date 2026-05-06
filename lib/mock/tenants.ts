import type { Ownership } from "@/lib/types";

export const TENANTS: Ownership[] = [
  {
    id: "ten_tlp",
    fullName: "The Learning Planet",
    email: "ops@learningplanet.com",
    ownershipType: "corporate",
    isActive: true,
    slug: "learning-planet",
    brandPrimary: "#805ad5", // purple
    brandAccent: "#f5a623", // amber
    tagline: "Where curious kids become confident learners.",
  },
  {
    id: "ten_mla",
    fullName: "Maple Leaf Academy",
    email: "hello@mapleleafacademy.ca",
    ownershipType: "franchisee",
    isActive: true,
    slug: "maple-leaf",
    brandPrimary: "#0a9b8a", // teal
    brandAccent: "#e67e22", // orange
    tagline: "Canadian academies for tomorrow's leaders.",
  },
];

export const TENANT_BY_SLUG: Record<string, Ownership> = Object.fromEntries(
  TENANTS.map((t) => [t.slug, t]),
);

export const TENANT_BY_ID: Record<string, Ownership> = Object.fromEntries(
  TENANTS.map((t) => [t.id, t]),
);

export const TLP_TENANT = TENANTS[0];
export const MLA_TENANT = TENANTS[1];
