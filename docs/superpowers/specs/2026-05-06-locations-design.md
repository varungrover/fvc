# Module 3 — Locations: Design Spec

_Date: 2026-05-06_
_Status: Approved — ready for implementation planning_

---

## Overview

Replace `lib/mock/locations.ts` with a real `locations` table. Establish the `location_id` FK anchor that Batches, Coaches, Holidays, and Enrollment will reference in subsequent modules. Wire the three locations pages (admin, franchisee-admin, management) to read from DB instead of mock data, and make the "Add Location" form functional.

**Stack:** Next.js 16.2.2 App Router · Supabase Postgres · `@supabase/ssr` · TypeScript 5

---

## Chosen Approach: `locations` table with FK to `ownerships`

`locations` has a `NOT NULL` FK to `ownerships.id`. Row-level scoping mirrors the ownerships pattern: JWT `app_metadata.role` determines whether a caller sees all rows (FA/FM) or only rows belonging to their `ownership_id` claim. Pages are converted from `"use client"` + mock imports to a Server Component that fetches real data and passes it as props to a sibling Client Component.

### Why this approach

- `ownership_id` FK keeps referential integrity at the DB layer — a location can never exist without a valid ownership.
- Moving the `select('ownerships(locations(*))')` join to the management page replaces two separate mock lookups with one query.
- The Server Component / Client Component split is the idiomatic Next.js App Router pattern for pages that need both server data-fetching and client interactivity (search, modals).

---

## Alternative Approaches

### Option B — Keep pages as `"use client"`, fetch via `useEffect` on mount

Pages remain client components. On mount they call `GET /api/locations` and update state.

- **Pro:** Smaller diff — no page-level restructure.
- **Con:** Flash of empty content on load; unnecessary client round-trip for data that's available at request time; breaks progressive enhancement. Not the Next.js App Router best practice.
- **Not chosen.**

### Option C — Include batch/coach/student stats in the locations query

Join locations with batches, enrollments, and coaches to show live stats on location cards.

- **Pro:** Removes the `—` placeholder from stat tiles immediately.
- **Con:** Batches are still mock data in this module; the join would return empty for all locations. Batches migrate in Module 4. Attempting to join would require partial DB data or complex fallback logic.
- **Deferred to Module 4.** Stat tiles intentionally show `—` in this module.

---

## Database

### `locations` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `ownership_id` | uuid | NOT NULL, FK → `ownerships(id)` | Scoping anchor |
| `name` | varchar(255) | NOT NULL | "Surrey Central" |
| `address_line1` | varchar(255) | NOT NULL | |
| `address_line2` | varchar(255) | nullable | |
| `city` | varchar(100) | NOT NULL | |
| `state_province` | varchar(100) | NOT NULL | |
| `country` | varchar(100) | NOT NULL, default 'Canada' | |
| `postal_code` | varchar(20) | nullable | |
| `is_active` | boolean | NOT NULL, default true | |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

### RLS policies

| Policy | Roles | Condition |
|---|---|---|
| Read all locations | FA, FM | `auth.jwt()->'app_metadata'->>'role' IN ('franchisor_admin','franchisor_mgmt')` |
| Read own ownership's locations | XA, XM, coach, customer | `ownership_id = (auth.jwt()->'app_metadata'->>'ownership_id')::uuid` |
| Public read active locations | unauthenticated | `is_active = true` |
| Insert any location | FA | `role = 'franchisor_admin'` |
| Insert own ownership's locations | XA | `role = 'franchisee_admin' AND ownership_id = (jwt->>'ownership_id')::uuid` |
| Update any location | FA | `role = 'franchisor_admin'` |
| Update own ownership's locations | XA | `role = 'franchisee_admin' AND ownership_id = (jwt->>'ownership_id')::uuid` |

No delete policy — locations are deactivated (`is_active = false`), never hard-deleted. Existing enrollments and batch history remain valid.

---

## API Design

### `GET /api/locations`

Returns scoped location list. FA/FM get all locations; XA/XM/coach/customer get only locations under their `ownership_id`. 401 if unauthenticated.

**Response:**
```json
[
  {
    "id": "uuid",
    "ownership_id": "uuid",
    "name": "Surrey Central",
    "address_line1": "10153 King George Blvd",
    "address_line2": null,
    "city": "Surrey",
    "state_province": "BC",
    "country": "Canada",
    "postal_code": "V3T 2W1",
    "is_active": true,
    "created_at": "2026-05-06T00:00:00Z",
    "updated_at": "2026-05-06T00:00:00Z"
  }
]
```

### `POST /api/locations`

FA and XA only. FA must supply `ownershipId` in the body. XA's `ownershipId` is inferred from their JWT claim (body `ownershipId` is ignored if present, preventing privilege escalation).

**Request body:**
```json
{
  "ownershipId": "uuid (FA only; XA uses JWT claim)",
  "name": "string",
  "addressLine1": "string",
  "addressLine2": "string (optional)",
  "city": "string",
  "stateProvince": "string",
  "country": "string (default: Canada)",
  "postalCode": "string (optional)"
}
```

**Response:** `201` with created `LocationRow`.

### `GET /api/locations/:id`

FA/FM can read any location. XA/XM/coach/customer can only read locations within their ownership. Returns `404` (not `403`) for out-of-scope locations — avoids leaking existence.

### `PATCH /api/locations/:id`

FA and XA only. Partial update; `ownership_id` is not patchable (changing ownership is a destructive operation outside this module's scope). Returns `404` for not-found or out-of-scope.

### `GET /api/public/locations?ownershipId=<uuid>`

Unauthenticated. Returns active locations for a given ownership. Used by the storefront (`/t/[tenant]`) to list available locations for trial booking CTAs. No email or sensitive fields — only address and `is_active`.

---

## Data Access Layer

All DB queries go through `lib/db/locations.ts` — pure functions that accept a typed Supabase client. Same pattern as `lib/db/ownerships.ts`.

```typescript
listLocations(supabase, session)           // LocationRow[] — scoped by role
getLocation(supabase, id, session)         // LocationRow | null (null = 404/403)
createLocation(supabase, input)            // LocationRow
updateLocation(supabase, id, patch, session) // LocationRow | null
listPublicLocations(supabase, ownershipId)  // LocationRow[] — no session required
```

Scoping logic lives in the data-access layer, not in route handlers:
- `franchisor_admin` / `franchisor_mgmt` → no `ownership_id` filter on `listLocations`
- All other roles → `WHERE ownership_id = session.ownershipId`

`updateLocation` enforces scoping at the application layer as a fast-fail before the DB write (RLS enforces it at the DB layer too — defence in depth).

---

## Page Architecture

### Conversion pattern

Current pages are `"use client"` components importing from `lib/mock/locations`. After this module:

1. `page.tsx` becomes an `async` Server Component — calls `getSession()`, creates Supabase client, fetches `LocationRow[]`, passes as props.
2. `LocationsClient.tsx` (new sibling file) carries all `useState` and event handlers; marked `"use client"`.

This pattern is used for all three locations pages.

### Admin locations (`/admin/locations`)

- Server Component: fetches locations scoped to corporate ownership (FA role sees all; `listLocations` returns only TLP locations for an FA whose ownership_id is TLP).
- Client Component: search filter, expand/collapse card, "Add Location" modal that calls `POST /api/locations` and optimistically appends to local state.
- Batch/coach/student stats: show `—` pending Module 4.

### Franchisee-admin locations (`/franchisee-admin/locations`)

- Same structure. Server Component uses `session.ownershipId` to resolve ownership name for the subtitle.
- Client Component: "Add Location" POST body omits `ownershipId` — API infers from JWT for `franchisee_admin`.

### Management locations (`/management/locations`)

- Read-only view. Server Component does a single join: `ownerships.select('id, full_name, locations(*)')` to get all ownerships with their locations in one query.
- Client Component: ownership filter dropdown, search bar, stat summary tiles.
- No create/edit actions — management role is read-only for locations.

---

## Key Flows

### Create location (admin)

1. FA or XA clicks "Add Location" → modal opens with address form fields.
2. On submit, client POSTs to `/api/locations`.
3. Route handler validates required fields, infers `ownership_id` (XA from JWT; FA from request body).
4. `createLocation(supabase, input)` inserts row; RLS enforces write permission at DB layer.
5. `201` response → new `LocationRow` appended to local client state (no full page reload).

### Deactivate location (PATCH)

1. Admin clicks "Deactivate" (out of scope for this module's UI, but the API supports it via `PATCH { isActive: false }`).
2. Route handler calls `updateLocation(supabase, id, { is_active: false }, session)`.
3. Location remains in DB; downstream batch/enrollment data remains valid.

### Storefront location listing

1. Storefront page (`/t/[tenant]`) already calls the public ownerships API to get `ownershipId`.
2. With Module 3, it can also call `GET /api/public/locations?ownershipId=<uuid>` to list real active locations for trial booking display. This call is optional — the storefront is not modified in this module but the endpoint is ready.

---

## Demo Data

6 locations matching `lib/mock/locations.ts`. Seeded via `scripts/seed-locations.ts`, which first fetches real ownership UUIDs by slug, then inserts locations. Script is idempotent (skips by `ownership_id + name`).

| name | city | province | ownership slug |
|---|---|---|---|
| Surrey Central | Surrey | BC | learning-planet |
| Abbotsford | Abbotsford | BC | learning-planet |
| Langley | Langley | BC | learning-planet |
| Toronto Downtown | Toronto | ON | maple-leaf |
| Mississauga | Mississauga | ON | maple-leaf |
| Brampton | Brampton | ON | maple-leaf |

---

## What This Module Does NOT Cover

- Batch/coach/student stats on location cards (Module 4 — Batches).
- Holiday calendar per location (Module to be determined; `holidays` table not yet created).
- Location-level course offerings (`location_course_offerings` table — Module 4 or 5).
- Storefront modification to show real location list (endpoint is ready; storefront wiring is out of scope).
- Hard-delete of locations (deactivate only; hard-delete is out of scope for prototype).
- `ownership_id` reassignment (location ownership is immutable after creation in this module).
