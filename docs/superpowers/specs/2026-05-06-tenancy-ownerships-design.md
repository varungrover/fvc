# Module 2 — Tenancy & Ownerships: Design Spec

_Date: 2026-05-06_
_Status: Approved — ready for implementation planning_

---

## Overview

Replace `lib/mock/tenants.ts` with a real `ownerships` table. Establish the `ownership_id` FK that all downstream modules use for data scoping. Wire the app layout and public storefront to read ownership data from the DB instead of mock data.

**Stack:** Next.js 16.2.2 App Router · Supabase Postgres · `@supabase/ssr` · TypeScript 5

---

## Chosen Approach: Single `ownerships` table with branding fields

The V2 schema defines `ownerships` with: `id`, `full_name`, `email`, `ownership_type`, `is_active`, `created_at`, `updated_at`. We extend it with branding fields (`slug`, `logo_url`, `brand_primary`, `brand_accent`, `tagline`) because the prototype storefront and app layout need them immediately. These are already present in `lib/types.ts` as "prototype-only extensions."

### Why include branding in `ownerships`

- The storefront page (`/t/[tenant]`) and the app TopBar both need brand colours — having them in the DB means no separate config file or env var per tenant.
- Supabase's RLS ensures each ownership's branding is only readable by scoped callers.
- When production moves to subdomain routing, branding fields stay in the same table.

---

## Alternative Approaches

### Option B — Separate `brand_config` table

Keep `ownerships` pure (as in V2) and put branding in a side table.

- **Pro:** Cleaner domain separation.
- **Con:** Extra join on every TopBar render; overkill at prototype stage with two ownerships.
- **When to reconsider:** When the number of tenants and branding variants makes a dedicated CMS worth building.

### Option C — Branding in env vars / `brand_config.json`

Per-deployment config file for branding.

- **Pro:** Zero DB queries for branding.
- **Con:** Only supports one brand per deployment; breaks the multi-tenancy model entirely.
- **Not viable** for this use case.

---

## Database

### `ownerships` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `full_name` | varchar(255) | NOT NULL | "The Learning Planet" |
| `email` | varchar(255) | NOT NULL UNIQUE | Primary contact |
| `ownership_type` | varchar(20) | NOT NULL, CHECK IN ('corporate','franchisee') | |
| `slug` | varchar(100) | NOT NULL UNIQUE | URL slug for storefront: `/t/[slug]` |
| `logo_url` | varchar(500) | nullable | |
| `brand_primary` | varchar(20) | NOT NULL, default '#0a9b8a' | CSS hex colour |
| `brand_accent` | varchar(20) | NOT NULL, default '#e67e22' | CSS hex colour |
| `tagline` | text | nullable | |
| `is_active` | boolean | NOT NULL, default true | |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

### `profiles.ownership_id` FK

Once `ownerships` exists we add the FK constraint:

```sql
alter table public.profiles
  add constraint profiles_ownership_id_fkey
  foreign key (ownership_id) references public.ownerships(id);
```

This was deferred from `001_profiles.sql` because `ownerships` didn't exist yet.

### RLS policies

| Policy | Condition |
|---|---|
| FA/FM read all | `auth.jwt()->>'role' IN ('franchisor_admin','franchisor_mgmt')` |
| XA/XM/CO/CX read own | `id = (auth.jwt()->'app_metadata'->>'ownership_id')::uuid` |
| FA create | `auth.jwt()->>'role' = 'franchisor_admin'` |
| FA update | `auth.jwt()->>'role' = 'franchisor_admin'` |

---

## API Design

### `GET /api/ownerships`

Returns all ownerships for FA/FM. Returns own ownership only for XA/XM. 401 for unauthenticated.

**Response:**
```json
[
  {
    "id": "uuid",
    "fullName": "The Learning Planet",
    "email": "ops@learningplanet.com",
    "ownershipType": "corporate",
    "slug": "learning-planet",
    "brandPrimary": "#805ad5",
    "brandAccent": "#f5a623",
    "tagline": "Where curious kids become confident learners.",
    "isActive": true
  }
]
```

### `GET /api/ownerships/:id`

FA/FM can read any. XA/XM can only read their own (`ownership_id` claim matches). 403 otherwise.

### `POST /api/ownerships`

FA only. Creates ownership + invites a management account user via `admin.auth.admin.inviteUserByEmail()` with `app_metadata: { role: 'franchisee_mgmt', ownership_id: <new_id> }`.

**Request body:**
```json
{
  "fullName": "string",
  "email": "string",
  "ownershipType": "corporate | franchisee",
  "slug": "string",
  "brandPrimary": "#xxxxxx",
  "brandAccent": "#xxxxxx",
  "tagline": "string (optional)"
}
```

**Response:** `201` with created ownership.

### `PATCH /api/ownerships/:id`

FA only. Partial update of any field except `id` and `created_at`.

---

## Data Access Layer

All DB queries go through `lib/db/ownerships.ts` — pure functions that take a typed Supabase client. This makes the functions independently testable without hitting the network.

```typescript
// lib/db/ownerships.ts
listOwnerships(supabase, session)      // returns Ownership[]
getOwnership(supabase, id, session)    // returns Ownership | null (null = 403)
createOwnership(supabase, data)        // returns Ownership
updateOwnership(supabase, id, data)    // returns Ownership
```

Scoping logic lives here, not in the route handler:
- `franchisor_admin` / `franchisor_mgmt` → no filter
- All other roles → filter `WHERE id = session.ownershipId`

---

## Key Flows

### App layout — tenant name in TopBar

`app/(app)/layout.tsx` currently looks up `TENANT_BY_ID[session.ownershipId]`. After this module:
1. `getSession()` returns `ownershipId` (real UUID now that profiles are linked)
2. Layout calls `getOwnership(supabase, session.ownershipId, session)` if `ownershipId` is set
3. `tenantName` comes from `ownership.fullName` — no more mock lookup

### Public storefront

`app/t/[tenant]/page.tsx` currently reads from `TENANT_BY_SLUG`. After this module it calls `GET /api/public/ownerships?slug=[tenant]` (public, no auth) to get brand config.

We add a public read policy: `is_active = true` allows unauthenticated reads of the branding fields (not the email field).

### Create ownership (FA)

1. FA POSTs to `/api/ownerships`
2. Server creates the `ownerships` row
3. Server calls `admin.auth.admin.inviteUserByEmail(mgmt_email, { data: { role: 'franchisee_mgmt', ownership_id: new_id } })`
4. New user gets a magic-link email; on first login Module 1's `must_change_password` flow kicks in
5. Response returns the new ownership (without the mgmt email in the body)

---

## Demo Data

Two ownerships matching the existing mock data. Seed via `scripts/seed-ownerships.ts`:

| id (generated) | full_name | ownership_type | slug |
|---|---|---|---|
| (UUID) | The Learning Planet | corporate | learning-planet |
| (UUID) | Maple Leaf Academy | franchisee | maple-leaf |

After creating the ownerships:
- Update `franchisor.admin@demo.com`, `franchisor.mgmt@demo.com`, `coach@demo.com` → TLP UUID in app_metadata + profiles
- Update `franchisee.admin@demo.com`, `franchisee.mgmt@demo.com` → MLA UUID in app_metadata + profiles

---

## What This Module Does NOT Cover

- Full tenant admin UI (ownership list/edit pages are stubs for now)
- Coach and customer `ownership_id` assignment (Module 6 and 7 own those flows)
- Multi-brand / multi-deployment configuration
- Subscription / billing for franchisees (out of scope for prototype)
