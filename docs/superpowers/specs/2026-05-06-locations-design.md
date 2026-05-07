# Module 3 — Catalog, Locations & Offerings: Design Spec

_Date: 2026-05-06 (locations); expanded 2026-05-06 (catalog + offerings + holidays)_
_Status: Locations — Complete. Catalog, Offerings, Holidays — Approved, ready for planning._

---

## Overview

Full "what and where" setup layer for Mentora. Three sub-domains delivered in sequence:

1. **Locations** _(complete)_ — Replace `lib/mock/locations.ts` with a real `locations` table. Establish the FK anchor for Batches, Coaches, Holidays, and Enrollment.
2. **Catalog** _(pending)_ — Replace mock planets/levels/variants with real `planets`, `products`, and `product_variants` tables. FA-owned global data; all roles read.
3. **Offerings & Holidays** _(pending)_ — Replace mock offerings and holidays with `location_course_offerings` (price overrides per location) and `holidays`. These depend on both Locations and Catalog existing first.

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

## What This Module Does NOT Cover (Locations sub-domain)

- Batch/coach/student stats on location cards — Module 5 (Batches).
- Storefront modification to show real location list — endpoint is ready; storefront wiring is Module 19.
- Hard-delete of locations — deactivate only (`is_active = false`); hard-delete is out of scope for prototype.
- `ownership_id` reassignment — location ownership is immutable after creation.

---

---

# Catalog Sub-domain (Planets → Levels → Variants)

## Overview

Replace `lib/mock/planets.ts`, `lib/mock/levels.ts`, and `lib/mock/courseVariants.ts` with real DB tables. Catalog is globally-scoped and FA-owned: only Franchisor Admins can create or modify catalog entries; all authenticated roles can read them (needed for enrollment, roster, LMS, etc.).

The UX calls these "Planets", "Levels", and "Course Variants". The SQL uses `planets`, `products`, and `product_variants` — maintain this mapping explicitly in all type definitions and API handlers.

---

## Database — Catalog tables

### `planets` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `name` | varchar(100) | NOT NULL, UNIQUE | "Chess", "Math", "English", "Finance", "Arts" |
| `description` | text | nullable | |
| `is_active` | boolean | NOT NULL, default true | |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

### `products` table (UX: Levels)

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `planet_id` | uuid | NOT NULL, FK → `planets(id)` | |
| `name` | varchar(100) | NOT NULL | "PP", "RR", "Grade 7" |
| `sort_order` | integer | NOT NULL, default 0 | Display ordering within a planet |
| `is_active` | boolean | NOT NULL, default true | |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

Unique constraint: `(planet_id, name)`.

### `product_variants` table (UX: Course Variants)

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `product_id` | uuid | NOT NULL, FK → `products(id)` | |
| `frequency_per_week` | smallint | NOT NULL, CHECK (1–7) | 1, 2, or 3 sessions/week |
| `price` | numeric(10,2) | NOT NULL | Global default price |
| `setup_fee` | numeric(10,2) | NOT NULL, default 0 | Global default setup fee |
| `is_active` | boolean | NOT NULL, default true | |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

Unique constraint: `(product_id, frequency_per_week)`.

### RLS policies — Catalog tables

All three tables use the same pattern:

| Policy | Roles | Condition |
|---|---|---|
| Read any catalog row | All authenticated | `auth.role() = 'authenticated'` |
| Public read active catalog | unauthenticated | `is_active = true` |
| Insert/Update/Delete | FA only | `auth.jwt()->'app_metadata'->>'role' = 'franchisor_admin'` |

No delete policy exposed via API — deactivate with `is_active = false` to preserve FK integrity with existing enrollments. Hard-delete is only via FA direct DB access (out of scope for prototype).

---

## API Design — Catalog

### `GET /api/planets`
All authenticated roles + public (storefront). Returns active planets ordered by name.

### `POST /api/planets`
FA only. Body: `{ name, description? }`.

### `PATCH /api/planets/:id`
FA only. Partial update. Patchable fields: `name`, `description`, `isActive`.

### `DELETE /api/planets/:id`
FA only. Sets `is_active = false` — never hard-deletes (FK safety). Returns `204`.

### `GET /api/levels?planetId=<uuid>`
All authenticated + public. `planetId` required. Returns levels ordered by `sort_order`.

### `POST /api/levels`
FA only. Body: `{ planetId, name, sortOrder? }`.

### `PATCH /api/levels/:id`
FA only. Patchable: `name`, `sortOrder`, `isActive`.

### `DELETE /api/levels/:id`
FA only. Sets `is_active = false`. Returns `204`.

### `GET /api/course-variants?levelId=<uuid>`
All authenticated + public. `levelId` required. Returns variants ordered by `frequency_per_week`.

### `POST /api/course-variants`
FA only. Body: `{ levelId, frequencyPerWeek, basePrice, setupFee? }`.

### `PATCH /api/course-variants/:id`
FA only. Patchable: `frequencyPerWeek`, `basePrice`, `setupFee`, `isActive`.

### `DELETE /api/course-variants/:id`
FA only. Sets `is_active = false`. Returns `204`.

---

## Data Access Layer — Catalog

```
lib/db/catalog.ts
```

```typescript
listPlanets(supabase)                          // PlanetRow[]
createPlanet(supabase, input)                  // PlanetRow
updatePlanet(supabase, id, patch)              // PlanetRow | null
deactivatePlanet(supabase, id)                 // void

listLevels(supabase, planetId)                 // LevelRow[]
createLevel(supabase, input)                   // LevelRow
updateLevel(supabase, id, patch)               // LevelRow | null
deactivateLevel(supabase, id)                  // void

listVariants(supabase, levelId)                // VariantRow[]
createVariant(supabase, input)                 // VariantRow
updateVariant(supabase, id, patch)             // VariantRow | null
deactivateVariant(supabase, id)                // void
```

All write functions are FA-only enforced at the route handler level; RLS enforces at DB level (defence in depth).

---

## Page Architecture — Catalog

### Admin → Planets (`/admin/planets`)

FA-only page. Shows the full catalog tree: Planet → Level → Variants.

- Server Component fetches all planets with nested levels and variants in one query.
- Client Component renders an accordion: planet row expands to show levels; level row expands to show variant cards.
- "Add Planet" button → modal: name + description.
- "Add Level" button per planet → modal: name, sort order.
- "Add Variant" button per level → modal: frequency (1/2/3×/week), base price, setup fee.
- Edit/deactivate inline via PATCH; no hard-delete in UI.

---

## Demo Data — Catalog

Seeded via `scripts/seed-catalog.ts`. Idempotent (skips by name uniqueness).

**Planets & Levels:**

| Planet | Levels |
|---|---|
| Chess | PP, RR |
| Math | Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8, Grade 9, Grade 10 |
| English | Grade 1–10 (same pattern) |
| Finance | Beginner, Intermediate, Advanced |
| Arts | Beginner, Intermediate, Advanced |

**Variants per level (Chess example — apply to all levels):**

| frequency_per_week | price | setup_fee |
|---|---|---|
| 1 | 159.00 | 50.00 |
| 2 | 199.00 | 50.00 |
| 3 | 239.00 | 50.00 |

---

---

# Offerings Sub-domain (`location_course_offerings`)

## Overview

`location_course_offerings` is the join table that says "this product_variant is available at this location, at this price". It carries per-location price overrides on top of the global `price` from `product_variants`. This is the price the customer sees and what enrollment snapshots at booking time.

**Fixes gaps.md §4b:** TypeScript `LocationCourseOffering` was missing `price` and `setupFee` fields. This migration adds them to the DB and the TypeScript type must be updated accordingly.

---

## Database — `location_course_offerings`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `location_id` | uuid | NOT NULL, FK → `locations(id)` | |
| `product_variant_id` | uuid | NOT NULL, FK → `product_variants(id)` | |
| `price` | numeric(10,2) | NOT NULL | Per-location override; seeded from global `price` |
| `setup_fee` | numeric(10,2) | NOT NULL, default 0 | Per-location override |
| `is_active` | boolean | NOT NULL, default true | |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

Unique constraint: `(location_id, product_variant_id)`.

### RLS policies — Offerings

| Policy | Roles | Condition |
|---|---|---|
| Read all offerings | FA, FM | `role IN ('franchisor_admin','franchisor_mgmt')` |
| Read own ownership offerings | XA, XM, CO, CX | `location.ownership_id = jwt ownershipId` (via RLS function or row filter) |
| Public read active offerings | unauthenticated | `is_active = true` |
| Insert/Update | FA (any), XA (own ownership only) | role check + ownership_id scoping |

RLS on a join table referencing `locations` requires a subquery: `location_id IN (SELECT id FROM locations WHERE ownership_id = (jwt->>'ownership_id')::uuid)`.

---

## API Design — Offerings

### `GET /api/locations/:id/offerings`
Returns all offerings for a location. FA/FM see always; scoped roles only if location is in their ownership. CX-readable for enrollment step 1. Include joined variant data (frequency, price) so the client doesn't need a second request.

**Response:**
```json
[
  {
    "id": "uuid",
    "location_id": "uuid",
    "product_variant_id": "uuid",
    "price": 169.00,
    "setup_fee": 50.00,
    "is_active": true,
    "variant": {
      "frequency_per_week": 1,
      "price": 159.00,
      "product": { "id": "uuid", "name": "PP", "planet": { "name": "Chess" } }
    }
  }
]
```

### `POST /api/locations/:id/offerings`
FA and XA only (XA: own ownership locations only). Body: `{ productVariantId, price, setupFee? }`.

### `PATCH /api/locations/:id/offerings/:offeringId`
FA and XA only. Patchable: `price`, `setupFee`, `isActive`. This is also the endpoint that price-change approval writes to (Module 17).

---

## Data Access Layer — Offerings

```
lib/db/offerings.ts
```

```typescript
listOfferings(supabase, locationId, session)          // OfferingRow[] with joined variant+product+planet
createOffering(supabase, input, session)              // OfferingRow
updateOffering(supabase, id, patch, session)          // OfferingRow | null
```

---

## TypeScript Type Fix

Update `lib/types.ts` `LocationCourseOffering`:

```typescript
// Before (incomplete — gaps.md §4b)
type LocationCourseOffering = { id: ID; locationId: ID; levelId: ID; isActive: boolean }

// After
type LocationCourseOffering = {
  id: ID
  locationId: ID
  productVariantId: ID
  price: number
  setupFee: number
  isActive: boolean
}
```

---

## Demo Data — Offerings

Seeded via `scripts/seed-offerings.ts`. For each of the 6 demo locations, activate all Chess variants (PP 1×/2×/3×, RR 1×/2×/3×) with prices matching the current mock data. Other planets seeded as inactive offerings (available but not yet turned on per location).

---

---

# Holidays Sub-domain

## Overview

`holidays` defines dates on which no sessions run. Scope can be:
- **Global** (FA-set, no FK) — applies to all ownerships in the deployment
- **Ownership-wide** (FA or XA-set, `ownership_id` FK) — all locations under that ownership
- **Location-specific** (FA or XA-set, `location_id` FK) — one location only

**Fixes gaps.md §4a:** The original SQL schema had only `location_id` with no `ownership_id` column. This spec adds `ownership_id` with a constraint that at least one scope is set OR it is deliberately global (both FKs null = global holiday set by FA).

---

## Database — `holidays`

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `date` | date | NOT NULL | |
| `name` | varchar(255) | NOT NULL | "Christmas Day", "B.C. Day" |
| `ownership_id` | uuid | nullable, FK → `ownerships(id)` | null = applies globally or to a specific location |
| `location_id` | uuid | nullable, FK → `locations(id)` | null = applies to full ownership or globally |
| `created_at` | timestamptz | NOT NULL, default now() | |

CHECK constraint: `NOT (ownership_id IS NOT NULL AND location_id IS NOT NULL)` — a holiday is scoped to either ownership OR location, not both simultaneously (a location-specific holiday sets `location_id` only; the location's ownership is derivable via join).

No `is_active` — holidays are deleted, not deactivated (a past holiday is just a past date; no FK references to holidays from other tables in this module).

Unique constraint: `(date, ownership_id, location_id)` — prevents duplicate holiday entries for the same scope.

### RLS policies — Holidays

| Policy | Roles | Condition |
|---|---|---|
| Read global holidays | All authenticated | `ownership_id IS NULL AND location_id IS NULL` |
| Read own ownership holidays | XA, XM, CO | `ownership_id = jwt ownershipId` |
| Read own location holidays | XA, XM, CO | `location_id IN (SELECT id FROM locations WHERE ownership_id = jwt ownershipId)` |
| FA reads all | FA, FM | unconditional |
| FA inserts any | FA | unconditional |
| XA inserts own scope | XA | `ownership_id = jwt ownershipId` OR `location_id IN own locations` |
| FA/XA deletes | FA any; XA own scope | same scoping as insert |

---

## API Design — Holidays

### `GET /api/holidays?ownershipId=&locationId=`
FA/FM: returns all holidays (global + matching scope if filters provided). XA/XM/CO: returns global + own-ownership + own-location holidays. `ownershipId` and `locationId` are optional filters — without them, returns all holidays visible to the caller.

### `POST /api/holidays`
FA and XA only. Body:

```json
{
  "date": "2026-12-25",
  "name": "Christmas Day",
  "ownershipId": "uuid or null",
  "locationId": "uuid or null"
}
```

FA can set any combination. XA can only set `ownershipId` = own or `locationId` = own location. API rejects if XA tries to set `ownershipId` of another ownership.

### `DELETE /api/holidays/:id`
FA any; XA own-scope only. Hard delete (no deactivation pattern).

---

## Data Access Layer — Holidays

```
lib/db/holidays.ts
```

```typescript
listHolidays(supabase, filters, session)   // HolidayRow[] — scoped + filtered
createHoliday(supabase, input, session)    // HolidayRow
deleteHoliday(supabase, id, session)       // void | null (null = not found / out of scope)
```

---

## Page Architecture — Holidays

### Admin → Holidays (`/admin/holidays`)
FA-only. Calendar or list view. Shows all holidays (global + any ownership + any location). "Add Holiday" modal with date picker, name, optional ownership/location scope selectors. Delete button per holiday.

### Franchisee Admin → Holidays (`/franchisee-admin/holidays`)
XA-only. Shows global holidays (read-only) + own-ownership holidays (editable) + own-location holidays (editable). "Add Holiday" modal — scope limited to own ownership or own locations.

---

## Demo Data — Holidays

Seeded via `scripts/seed-holidays.ts`. Idempotent (skips by `date + ownership_id + location_id`).

| date | name | scope |
|---|---|---|
| 2026-01-01 | New Year's Day | global |
| 2026-02-16 | Family Day (BC) | TLP ownership |
| 2026-05-18 | Victoria Day | global |
| 2026-07-01 | Canada Day | global |
| 2026-08-03 | B.C. Day | TLP ownership |
| 2026-09-07 | Labour Day | global |
| 2026-10-12 | Thanksgiving | global |
| 2026-12-25 | Christmas Day | global |
| 2026-12-26 | Boxing Day | global |

---

## What This Full Module Does NOT Cover

- Batch/coach/student stats on location cards — Module 5 (Batches).
- Price-change request flow that writes back to `location_course_offerings` — Module 17.
- Storefront modification to display real location/offering data — Module 19.
- Hard-delete of planets/levels/variants — deactivate only.
- `ownership_id` reassignment on locations — immutable after creation.
- Setup fee per-planet tracking (`member_planet_setup_fees`) — flagged in gaps.md §7; deferred to Module 8 (Enrollment).
