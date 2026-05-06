# Module 3 — Catalog, Locations & Offerings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all mock catalog/location/offering/holiday data with real DB tables — migrations, RLS, CRUD APIs, seed scripts, data-access layers, and updated pages. Three sub-domains delivered in dependency order:
1. **Locations** _(Tasks 1–7, complete)_ — `locations` table, API, seed, and three pages wired to DB.
2. **Catalog** _(Tasks 8–12)_ — `planets`, `products`, `product_variants` tables, API, seed, `lib/db/catalog.ts`, and Admin → Planets page.
3. **Offerings & Holidays** _(Tasks 13–18)_ — `location_course_offerings` + `holidays` tables, APIs, seeds, data-access layers, and holiday pages.

**Architecture:** Catalog is global/FA-owned with no ownership scoping. Locations and offerings scope by `ownership_id` from JWT `app_metadata`. Holidays scope by global / ownership / location. All pages follow the Server Component + Client Component split established in Tasks 5–7. Batch/enrollment stats remain placeholder (`—`) until Module 5 (Batches).

**Tech Stack:** Next.js 16.2.2 App Router · Supabase Postgres · `@supabase/ssr` · Vitest 3.x · TypeScript 5

**Supabase project ID:** `nxocuhlrldrbbltiqkqh`

---

## File Map

| File | Action | Status | Purpose |
|---|---|---|---|
| `supabase/migrations/003_locations.sql` | Create | ✅ Done | locations table, RLS, FK to ownerships |
| `scripts/seed-locations.ts` | Create | ✅ Done | Seed 6 demo locations |
| `lib/db/locations.ts` | Create | ✅ Done | Scoped data-access functions |
| `lib/db/locations.test.ts` | Create | ✅ Done | Unit tests for scoping / filtering |
| `app/api/locations/route.ts` | Create | ✅ Done | GET scoped list + POST create |
| `app/api/locations/[id]/route.ts` | Create | ✅ Done | GET single + PATCH update |
| `app/api/public/locations/route.ts` | Create | ✅ Done | GET active locations by ownership (storefront) |
| `app/(app)/admin/locations/LocationsClient.tsx` | Create | ✅ Done | Client component: search, expand, add-location modal |
| `app/(app)/admin/locations/page.tsx` | Modify | ✅ Done | Server Component: fetch DB locations |
| `app/(app)/franchisee-admin/locations/LocationsClient.tsx` | Create | ✅ Done | Client component for franchisee-admin locations |
| `app/(app)/franchisee-admin/locations/page.tsx` | Modify | ✅ Done | Server Component: fetch DB locations (scoped) |
| `app/(app)/management/locations/LocationsClient.tsx` | Create | ✅ Done | Client component for management locations view |
| `app/(app)/management/locations/page.tsx` | Modify | ✅ Done | Server Component: fetch all locations with ownership |
| `supabase/migrations/004_catalog.sql` | Create | ⬜ Pending | planets, products, product_variants tables + RLS |
| `scripts/seed-catalog.ts` | Create | ⬜ Pending | Seed 5 planets, ~30 levels, ~90 variants |
| `lib/db/catalog.ts` | Create | ⬜ Pending | listPlanets, listLevels, listVariants + write fns |
| `lib/db/catalog.test.ts` | Create | ⬜ Pending | Unit tests for catalog access |
| `app/api/planets/route.ts` | Create | ⬜ Pending | GET all + POST create planet |
| `app/api/planets/[id]/route.ts` | Create | ⬜ Pending | PATCH update + DELETE (deactivate) planet |
| `app/api/levels/route.ts` | Create | ⬜ Pending | GET by planetId + POST create level |
| `app/api/levels/[id]/route.ts` | Create | ⬜ Pending | PATCH + DELETE level |
| `app/api/course-variants/route.ts` | Create | ⬜ Pending | GET by levelId + POST create variant |
| `app/api/course-variants/[id]/route.ts` | Create | ⬜ Pending | PATCH + DELETE variant |
| `app/(app)/admin/planets/PlanetsClient.tsx` | Create | ⬜ Pending | Client component: accordion tree, add modals |
| `app/(app)/admin/planets/page.tsx` | Modify | ⬜ Pending | Server Component: fetch full catalog tree |
| `supabase/migrations/005_offerings.sql` | Create | ⬜ Pending | location_course_offerings table + RLS |
| `scripts/seed-offerings.ts` | Create | ⬜ Pending | Seed offerings for 6 locations × Chess variants |
| `lib/db/offerings.ts` | Create | ⬜ Pending | listOfferings, createOffering, updateOffering |
| `lib/db/offerings.test.ts` | Create | ⬜ Pending | Unit tests for offering scoping |
| `app/api/locations/[id]/offerings/route.ts` | Create | ⬜ Pending | GET offerings list + POST create |
| `app/api/locations/[id]/offerings/[offeringId]/route.ts` | Create | ⬜ Pending | PATCH update offering |
| `supabase/migrations/006_holidays.sql` | Create | ⬜ Pending | holidays table with ownership_id + location_id + RLS |
| `scripts/seed-holidays.ts` | Create | ⬜ Pending | Seed 9 demo holidays (global + ownership-scoped) |
| `lib/db/holidays.ts` | Create | ⬜ Pending | listHolidays, createHoliday, deleteHoliday |
| `lib/db/holidays.test.ts` | Create | ⬜ Pending | Unit tests for holiday scoping |
| `app/api/holidays/route.ts` | Create | ⬜ Pending | GET filtered list + POST create |
| `app/api/holidays/[id]/route.ts` | Create | ⬜ Pending | DELETE holiday |
| `app/(app)/admin/holidays/HolidaysClient.tsx` | Create | ⬜ Pending | Client: calendar/list, add modal, delete |
| `app/(app)/admin/holidays/page.tsx` | Modify | ⬜ Pending | Server Component: fetch all holidays |
| `app/(app)/franchisee-admin/holidays/HolidaysClient.tsx` | Create | ⬜ Pending | Client: scoped view, add/delete own holidays |
| `app/(app)/franchisee-admin/holidays/page.tsx` | Modify | ⬜ Pending | Server Component: fetch scoped holidays |
| `lib/types.ts` | Modify | ⬜ Pending | Fix LocationCourseOffering type (add price, setupFee) |

---

## Task 1: Migration

**Files:**
- Create: `supabase/migrations/003_locations.sql`

- [ ] **Step 1: Create the migration file**

  Create `supabase/migrations/003_locations.sql`:

  ```sql
  create table public.locations (
    id              uuid primary key default gen_random_uuid(),
    ownership_id    uuid not null references public.ownerships(id),
    name            varchar(255) not null,
    address_line1   varchar(255) not null,
    address_line2   varchar(255),
    city            varchar(100) not null,
    state_province  varchar(100) not null,
    country         varchar(100) not null default 'Canada',
    postal_code     varchar(20),
    is_active       boolean not null default true,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
  );

  alter table public.locations enable row level security;

  -- FA/FM: read all locations globally
  create policy "franchisor staff read all locations"
    on public.locations for select
    using (
      (auth.jwt() -> 'app_metadata' ->> 'role') in ('franchisor_admin', 'franchisor_mgmt')
    );

  -- Scoped roles: read only locations belonging to their ownership
  create policy "scoped users read own ownership locations"
    on public.locations for select
    using (
      ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
    );

  -- Public: read active locations (storefront use)
  create policy "public read active locations"
    on public.locations for select
    using (is_active = true);

  -- FA: insert any location
  create policy "franchisor admin insert location"
    on public.locations for insert
    with check (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
    );

  -- XA: insert locations under their own ownership
  create policy "franchisee admin insert own location"
    on public.locations for insert
    with check (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
      and ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
    );

  -- FA: update any location
  create policy "franchisor admin update location"
    on public.locations for update
    using (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
    );

  -- XA: update locations under their own ownership
  create policy "franchisee admin update own location"
    on public.locations for update
    using (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
      and ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
    );
  ```

- [ ] **Step 2: Apply the migration via Supabase MCP**

  Use `mcp__supabase__apply_migration` with:
  - `project_id`: `nxocuhlrldrbbltiqkqh`
  - `name`: `003_locations`
  - `query`: the full SQL from Step 1

- [ ] **Step 3: Verify migration applied**

  Use `mcp__supabase__execute_sql` with:
  ```sql
  select column_name, data_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'locations'
  order by ordinal_position;
  ```

  Expected: 11 columns including `id`, `ownership_id`, `name`, `address_line1`, `city`, `state_province`, `country`, `is_active`.

- [ ] **Step 4: Commit**

  ```bash
  git add supabase/migrations/003_locations.sql
  git commit -m "feat(locations): add locations table migration with RLS and ownership FK"
  ```

---

## Task 2: Seed Locations

**Files:**
- Create: `scripts/seed-locations.ts`

- [ ] **Step 1: Create `scripts/seed-locations.ts`**

  ```typescript
  import { createClient } from '@supabase/supabase-js'
  import { config } from 'dotenv'
  import { existsSync } from 'fs'
  import { resolve } from 'path'

  const envPaths = ['.env.local', '../.env.local'].map((p) => resolve(process.cwd(), p))
  const envPath = envPaths.find(existsSync)
  if (envPath) config({ path: envPath })
  else config({ path: '.env.local' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const SEED_LOCATIONS = [
    // The Learning Planet (slug: 'learning-planet')
    {
      ownershipSlug: 'learning-planet',
      name: 'Surrey Central',
      address_line1: '10153 King George Blvd',
      city: 'Surrey',
      state_province: 'BC',
      country: 'Canada',
      postal_code: 'V3T 2W1',
    },
    {
      ownershipSlug: 'learning-planet',
      name: 'Abbotsford',
      address_line1: '32700 South Fraser Way',
      city: 'Abbotsford',
      state_province: 'BC',
      country: 'Canada',
      postal_code: 'V2S 2A8',
    },
    {
      ownershipSlug: 'learning-planet',
      name: 'Langley',
      address_line1: '20151 Fraser Hwy',
      city: 'Langley',
      state_province: 'BC',
      country: 'Canada',
      postal_code: 'V3A 4E4',
    },
    // Maple Leaf Academy (slug: 'maple-leaf')
    {
      ownershipSlug: 'maple-leaf',
      name: 'Toronto Downtown',
      address_line1: '365 Bloor St E',
      city: 'Toronto',
      state_province: 'ON',
      country: 'Canada',
      postal_code: 'M4W 3L4',
    },
    {
      ownershipSlug: 'maple-leaf',
      name: 'Mississauga',
      address_line1: '100 City Centre Dr',
      city: 'Mississauga',
      state_province: 'ON',
      country: 'Canada',
      postal_code: 'L5B 2C9',
    },
    {
      ownershipSlug: 'maple-leaf',
      name: 'Brampton',
      address_line1: '25 Peel Centre Dr',
      city: 'Brampton',
      state_province: 'ON',
      country: 'Canada',
      postal_code: 'L6T 3R5',
    },
  ]

  async function main() {
    console.log('Seeding locations...')

    // Fetch ownership IDs by slug
    const { data: ownerships, error: ownershipErr } = await admin
      .from('ownerships')
      .select('id, slug')

    if (ownershipErr || !ownerships) {
      console.error('Failed to fetch ownerships:', ownershipErr)
      process.exit(1)
    }

    const ownershipIdBySlug: Record<string, string> = Object.fromEntries(
      ownerships.map((o) => [o.slug, o.id]),
    )

    for (const loc of SEED_LOCATIONS) {
      const ownershipId = ownershipIdBySlug[loc.ownershipSlug]
      if (!ownershipId) {
        console.error(`  ✗ no ownership found for slug "${loc.ownershipSlug}" — run seed-ownerships first`)
        process.exit(1)
      }

      // Check for existing location by name + ownership_id
      const { data: existing } = await admin
        .from('locations')
        .select('id')
        .eq('ownership_id', ownershipId)
        .eq('name', loc.name)
        .single()

      if (existing) {
        console.log(`  ✓ skip  ${loc.name} (already exists, id: ${existing.id})`)
        continue
      }

      const { data, error } = await admin.from('locations').insert({
        ownership_id: ownershipId,
        name: loc.name,
        address_line1: loc.address_line1,
        city: loc.city,
        state_province: loc.state_province,
        country: loc.country,
        postal_code: loc.postal_code,
        is_active: true,
      }).select().single()

      if (error) {
        console.error(`  ✗ ${loc.name}:`, error.message)
        process.exit(1)
      }

      console.log(`  ✓ create ${loc.name} (id: ${data.id})`)
    }

    console.log('Done.')
  }

  main()
  ```

- [ ] **Step 2: Run the seed script**

  ```bash
  npx tsx scripts/seed-locations.ts
  ```

  Expected output (6 lines, each starting with `✓ create` or `✓ skip`):
  ```
  Seeding locations...
    ✓ create Surrey Central (id: <uuid>)
    ✓ create Abbotsford (id: <uuid>)
    ✓ create Langley (id: <uuid>)
    ✓ create Toronto Downtown (id: <uuid>)
    ✓ create Mississauga (id: <uuid>)
    ✓ create Brampton (id: <uuid>)
  Done.
  ```

- [ ] **Step 3: Verify in Supabase**

  Use `mcp__supabase__execute_sql` with:
  ```sql
  select l.name, l.city, l.state_province, o.slug as ownership_slug
  from public.locations l
  join public.ownerships o on o.id = l.ownership_id
  order by o.slug, l.name;
  ```

  Expected: 6 rows — 3 for `learning-planet` (BC), 3 for `maple-leaf` (ON).

- [ ] **Step 4: Commit**

  ```bash
  git add scripts/seed-locations.ts
  git commit -m "feat(locations): add seed script for demo locations"
  ```

---

## Task 3: Data-Access Layer + Tests

**Files:**
- Create: `lib/db/locations.ts`
- Create: `lib/db/locations.test.ts`

- [ ] **Step 1: Write the failing tests**

  Create `lib/db/locations.test.ts`:

  ```typescript
  import { describe, it, expect, vi, beforeEach } from 'vitest'
  import {
    listLocations,
    getLocation,
    createLocation,
    updateLocation,
  } from './locations'
  import type { SessionUser } from '@/lib/auth/types'

  const FA: SessionUser = {
    id: 'u1',
    email: 'fa@test.com',
    role: 'franchisor_admin',
    fullName: 'FA User',
    ownershipId: 'own_tlp',
    mustChangePassword: false,
  }

  const XA: SessionUser = {
    id: 'u2',
    email: 'xa@test.com',
    role: 'franchisee_admin',
    fullName: 'XA User',
    ownershipId: 'own_mla',
    mustChangePassword: false,
  }

  function makeSupabase(rows: unknown[] = [], single?: unknown) {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: single ?? null, error: null }),
      then: undefined as unknown,
    }
    chain.select.mockReturnValue({ ...chain, data: rows, error: null })
    // make the chain thenable for await
    const resolved = { data: rows, error: null }
    const promise = Promise.resolve(resolved)
    Object.assign(chain, { then: promise.then.bind(promise) })
    return { from: vi.fn().mockReturnValue(chain), _chain: chain }
  }

  describe('listLocations', () => {
    it('adds no eq filter for franchisor_admin', async () => {
      const { from, _chain } = makeSupabase([])
      await listLocations(from as unknown as Parameters<typeof listLocations>[0], FA)
      expect(_chain.eq).not.toHaveBeenCalledWith('ownership_id', expect.anything())
    })

    it('scopes to ownership_id for franchisee_admin', async () => {
      const { from, _chain } = makeSupabase([])
      await listLocations(from as unknown as Parameters<typeof listLocations>[0], XA)
      expect(_chain.eq).toHaveBeenCalledWith('ownership_id', 'own_mla')
    })
  })

  describe('getLocation', () => {
    it('returns null for scoped role accessing other ownership location', async () => {
      const fakeLocation = { id: 'loc1', ownership_id: 'own_tlp' }
      const { from, _chain } = makeSupabase([], fakeLocation)
      const result = await getLocation(
        from as unknown as Parameters<typeof getLocation>[0],
        'loc1',
        XA,
      )
      expect(result).toBeNull()
    })

    it('returns location for franchisor_admin regardless of ownership', async () => {
      const fakeLocation = { id: 'loc1', ownership_id: 'own_tlp' }
      const { from } = makeSupabase([], fakeLocation)
      const result = await getLocation(
        from as unknown as Parameters<typeof getLocation>[0],
        'loc1',
        FA,
      )
      expect(result).toEqual(fakeLocation)
    })

    it('returns location for franchisee_admin when ownership matches', async () => {
      const fakeLocation = { id: 'loc2', ownership_id: 'own_mla' }
      const { from } = makeSupabase([], fakeLocation)
      const result = await getLocation(
        from as unknown as Parameters<typeof getLocation>[0],
        'loc2',
        XA,
      )
      expect(result).toEqual(fakeLocation)
    })
  })
  ```

- [ ] **Step 2: Run tests to verify they fail**

  ```bash
  npm test -- lib/db/locations.test.ts
  ```

  Expected: `Cannot find module './locations'`

- [ ] **Step 3: Create `lib/db/locations.ts`**

  ```typescript
  import type { SupabaseClient } from '@supabase/supabase-js'
  import type { SessionUser } from '@/lib/auth/types'

  export interface LocationRow {
    id: string
    ownership_id: string
    name: string
    address_line1: string
    address_line2: string | null
    city: string
    state_province: string
    country: string
    postal_code: string | null
    is_active: boolean
    created_at: string
    updated_at: string
  }

  const GLOBAL_ROLES = new Set(['franchisor_admin', 'franchisor_mgmt'])

  function isGlobalRole(session: SessionUser): boolean {
    return GLOBAL_ROLES.has(session.role)
  }

  export async function listLocations(
    supabase: SupabaseClient,
    session: SessionUser,
  ): Promise<LocationRow[]> {
    let query = supabase.from('locations').select('*').order('name')
    if (!isGlobalRole(session)) {
      query = query.eq('ownership_id', session.ownershipId ?? '')
    }
    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as LocationRow[]
  }

  export async function getLocation(
    supabase: SupabaseClient,
    id: string,
    session: SessionUser,
  ): Promise<LocationRow | null> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    const row = data as LocationRow
    if (!isGlobalRole(session) && row.ownership_id !== session.ownershipId) return null

    return row
  }

  export async function createLocation(
    supabase: SupabaseClient,
    input: Pick<LocationRow, 'ownership_id' | 'name' | 'address_line1' | 'city' | 'state_province' | 'country'> &
      Partial<Pick<LocationRow, 'address_line2' | 'postal_code'>>,
  ): Promise<LocationRow> {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        ownership_id: input.ownership_id,
        name: input.name,
        address_line1: input.address_line1,
        address_line2: input.address_line2 ?? null,
        city: input.city,
        state_province: input.state_province,
        country: input.country,
        postal_code: input.postal_code ?? null,
      })
      .select()
      .single()

    if (error) throw error
    return data as LocationRow
  }

  export async function updateLocation(
    supabase: SupabaseClient,
    id: string,
    patch: Partial<Pick<LocationRow, 'name' | 'address_line1' | 'address_line2' | 'city' | 'state_province' | 'country' | 'postal_code' | 'is_active'>>,
    session: SessionUser,
  ): Promise<LocationRow | null> {
    // Fail fast for scoped roles trying to update a location they don't own
    if (!isGlobalRole(session)) {
      const existing = await getLocation(supabase, id, session)
      if (!existing) return null
    }

    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    )

    const { data, error } = await supabase
      .from('locations')
      .update({ ...cleanPatch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as LocationRow
  }

  export async function listPublicLocations(
    supabase: SupabaseClient,
    ownershipId: string,
  ): Promise<LocationRow[]> {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('ownership_id', ownershipId)
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return (data ?? []) as LocationRow[]
  }
  ```

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  npm test -- lib/db/locations.test.ts
  ```

  Expected: all tests pass. If the mock chain setup causes issues, check that `makeSupabase` returns `.then` correctly for async/await — the chain needs to be awaitable. Adjust `makeSupabase` to return a real Promise for the top-level await if needed.

- [ ] **Step 5: Commit**

  ```bash
  git add lib/db/locations.ts lib/db/locations.test.ts
  git commit -m "feat(locations): add data-access layer with scoped queries and tests"
  ```

---

## Task 4: API Routes

**Files:**
- Create: `app/api/locations/route.ts`
- Create: `app/api/locations/[id]/route.ts`
- Create: `app/api/public/locations/route.ts`

- [ ] **Step 1: Create `app/api/locations/route.ts`**

  ```typescript
  import { NextResponse, type NextRequest } from 'next/server'
  import { createClient } from '@/lib/supabase/server'
  import { getSession } from '@/lib/auth/session'
  import { listLocations, createLocation } from '@/lib/db/locations'

  const CAN_CREATE = new Set(['franchisor_admin', 'franchisee_admin'])

  export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createClient()
    const locations = await listLocations(supabase, session)
    return NextResponse.json(locations)
  }

  export async function POST(request: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!CAN_CREATE.has(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    if (!body?.name || !body?.addressLine1 || !body?.city || !body?.stateProvince || !body?.country) {
      return NextResponse.json(
        { error: 'Missing required fields: name, addressLine1, city, stateProvince, country' },
        { status: 400 },
      )
    }

    // Franchisee admins can only create locations under their own ownership
    const ownershipId =
      session.role === 'franchisee_admin' ? session.ownershipId! : body.ownershipId

    if (!ownershipId) {
      return NextResponse.json({ error: 'ownershipId is required for franchisor_admin' }, { status: 400 })
    }

    const supabase = await createClient()
    const location = await createLocation(supabase, {
      ownership_id: ownershipId,
      name: body.name,
      address_line1: body.addressLine1,
      address_line2: body.addressLine2 ?? null,
      city: body.city,
      state_province: body.stateProvince,
      country: body.country,
      postal_code: body.postalCode ?? null,
    })

    return NextResponse.json(location, { status: 201 })
  }
  ```

- [ ] **Step 2: Create `app/api/locations/[id]/route.ts`**

  ```typescript
  import { NextResponse, type NextRequest } from 'next/server'
  import { createClient } from '@/lib/supabase/server'
  import { getSession } from '@/lib/auth/session'
  import { getLocation, updateLocation } from '@/lib/db/locations'

  const CAN_UPDATE = new Set(['franchisor_admin', 'franchisee_admin'])

  export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const supabase = await createClient()
    const location = await getLocation(supabase, id, session)
    if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(location)
  }

  export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!CAN_UPDATE.has(session.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const supabase = await createClient()
    const location = await updateLocation(
      supabase,
      id,
      {
        name: body.name,
        address_line1: body.addressLine1,
        address_line2: body.addressLine2,
        city: body.city,
        state_province: body.stateProvince,
        country: body.country,
        postal_code: body.postalCode,
        is_active: body.isActive,
      },
      session,
    )

    if (!location) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(location)
  }
  ```

- [ ] **Step 3: Create `app/api/public/locations/route.ts`**

  ```typescript
  import { NextResponse, type NextRequest } from 'next/server'
  import { createClient } from '@/lib/supabase/server'
  import { listPublicLocations } from '@/lib/db/locations'

  export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const ownershipId = searchParams.get('ownershipId')

    if (!ownershipId) {
      return NextResponse.json({ error: 'ownershipId query param required' }, { status: 400 })
    }

    const supabase = await createClient()
    const locations = await listPublicLocations(supabase, ownershipId)
    return NextResponse.json(locations)
  }
  ```

- [ ] **Step 4: Smoke-test the GET endpoint**

  Start the dev server (`npm run dev`) and open `http://localhost:3000/api/locations` while logged in as `franchisor.admin@demo.com`. Expected: JSON array of 3 TLP locations. Log in as `franchisee.admin@demo.com` and expect 3 MLA locations.

- [ ] **Step 5: Commit**

  ```bash
  git add app/api/locations/route.ts "app/api/locations/[id]/route.ts" app/api/public/locations/route.ts
  git commit -m "feat(locations): add CRUD API routes and public endpoint"
  ```

---

## Task 5: Admin Locations Page

**Files:**
- Create: `app/(app)/admin/locations/LocationsClient.tsx`
- Modify: `app/(app)/admin/locations/page.tsx`

The current page is `"use client"` and reads from mock. We'll split it: a Server Component `page.tsx` fetches real DB data, and a new `LocationsClient.tsx` gets the real `LocationRow[]` as props and handles all interactive state.

The page currently shows batch/enrollment/coach stats via mock data keyed by mock IDs. Since real location IDs are UUIDs that won't match mock batch keys, those stats will show `—` (placeholder). Batch stats will be live in Module 4.

- [ ] **Step 1: Read the current `app/(app)/admin/locations/page.tsx`**

  Read the full file before editing to understand all existing UI.

- [ ] **Step 2: Create `app/(app)/admin/locations/LocationsClient.tsx`**

  Move all the current client-side content into this new file. Accept `locations: LocationRow[]` and `ownershipId: string` as props. Replace all mock imports with the prop data. Batch stats show `—`.

  ```tsx
  'use client'

  import { useState } from 'react'
  import { Badge } from '@/components/ui/Badge'
  import { Button } from '@/components/ui/Button'
  import { Card } from '@/components/ui/Card'
  import { Input } from '@/components/ui/Input'
  import { Modal } from '@/components/ui/Modal'
  import { PageHeader } from '@/components/layout/PageHeader'
  import { TLP } from '@/lib/theme/tokens'
  import type { LocationRow } from '@/lib/db/locations'

  interface Props {
    locations: LocationRow[]
    ownershipName: string
    ownershipId: string
  }

  export function LocationsClient({ locations, ownershipName, ownershipId }: Props) {
    const [search, setSearch] = useState('')
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [showAddLocation, setShowAddLocation] = useState(false)
    const [addForm, setAddForm] = useState({
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: 'Canada',
    })
    const [saving, setSaving] = useState(false)
    const [localLocations, setLocalLocations] = useState<LocationRow[]>(locations)

    const filtered = localLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(search.toLowerCase()) ||
        loc.city.toLowerCase().includes(search.toLowerCase()),
    )

    async function handleAddLocation() {
      if (!addForm.name || !addForm.addressLine1 || !addForm.city || !addForm.stateProvince) return
      setSaving(true)
      try {
        const res = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ownershipId,
            name: addForm.name,
            addressLine1: addForm.addressLine1,
            addressLine2: addForm.addressLine2 || undefined,
            city: addForm.city,
            stateProvince: addForm.stateProvince,
            postalCode: addForm.postalCode || undefined,
            country: addForm.country,
          }),
        })
        if (res.ok) {
          const newLoc: LocationRow = await res.json()
          setLocalLocations((prev) => [...prev, newLoc])
          setShowAddLocation(false)
          setAddForm({ name: '', addressLine1: '', addressLine2: '', city: '', stateProvince: '', postalCode: '', country: 'Canada' })
        }
      } finally {
        setSaving(false)
      }
    }

    return (
      <div style={{ padding: 24 }}>
        <PageHeader
          title="Locations"
          subtitle={`${ownershipName} — ${localLocations.filter((l) => l.is_active).length} active location${localLocations.filter((l) => l.is_active).length !== 1 ? 's' : ''}`}
          actions={
            <Button variant="primary" icon="➕" onClick={() => setShowAddLocation(true)}>
              Add Location
            </Button>
          }
        />

        <div style={{ marginBottom: 20, maxWidth: 360 }}>
          <Input
            placeholder="Search locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((loc) => {
            const isExpanded = expandedId === loc.id

            return (
              <Card key={loc.id} style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : loc.id)}
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: TLP.navyLight,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      📍
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: TLP.navy }}>{loc.name}</div>
                      <div style={{ fontSize: 13, color: TLP.gray500 }}>
                        {loc.address_line1}, {loc.city}, {loc.state_province} {loc.postal_code ?? ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 20 }}>
                      {(['Batches', 'Students', 'Coaches'] as const).map((label) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: TLP.navy }}>—</div>
                          <div style={{ fontSize: 11, color: TLP.gray500, fontWeight: 600 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <Badge variant={loc.is_active ? 'success' : 'default'}>
                      {loc.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span style={{ color: TLP.gray400, fontSize: 18 }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      borderTop: `1px solid ${TLP.gray200}`,
                      padding: '16px 20px',
                      background: TLP.gray50,
                    }}
                  >
                    <div style={{ fontSize: 13, color: TLP.gray500, fontStyle: 'italic' }}>
                      Batch scheduling will be available in the next module.
                    </div>
                  </div>
                )}
              </Card>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: TLP.gray400, padding: 40 }}>
              No locations found.
            </div>
          )}
        </div>

        {showAddLocation && (
          <Modal
            title="Add Location"
            onClose={() => setShowAddLocation(false)}
            footer={
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setShowAddLocation(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleAddLocation} disabled={saving}>
                  {saving ? 'Saving…' : 'Create Location'}
                </Button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input
                label="Location Name"
                placeholder="e.g. Surrey Central"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Input
                label="Address Line 1"
                placeholder="Street address"
                value={addForm.addressLine1}
                onChange={(e) => setAddForm((f) => ({ ...f, addressLine1: e.target.value }))}
              />
              <Input
                label="Address Line 2 (optional)"
                placeholder="Suite, unit, etc."
                value={addForm.addressLine2}
                onChange={(e) => setAddForm((f) => ({ ...f, addressLine2: e.target.value }))}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <Input
                  label="City"
                  placeholder="City"
                  value={addForm.city}
                  onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))}
                />
                <Input
                  label="Province / State"
                  placeholder="BC"
                  value={addForm.stateProvince}
                  onChange={(e) => setAddForm((f) => ({ ...f, stateProvince: e.target.value }))}
                />
                <Input
                  label="Postal Code"
                  placeholder="V3T 2W1"
                  value={addForm.postalCode}
                  onChange={(e) => setAddForm((f) => ({ ...f, postalCode: e.target.value }))}
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    )
  }
  ```

- [ ] **Step 3: Rewrite `app/(app)/admin/locations/page.tsx` as a Server Component**

  Replace the entire file with:

  ```tsx
  import { redirect } from 'next/navigation'
  import { getSession } from '@/lib/auth/session'
  import { createClient } from '@/lib/supabase/server'
  import { listLocations } from '@/lib/db/locations'
  import { LocationsClient } from './LocationsClient'

  export default async function AdminLocationsPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const supabase = await createClient()
    const locations = await listLocations(supabase, session)

    // Fetch ownership name for subtitle
    const { data: ownership } = await supabase
      .from('ownerships')
      .select('full_name, id')
      .eq('ownership_type', 'corporate')
      .eq('is_active', true)
      .single()

    return (
      <LocationsClient
        locations={locations}
        ownershipName={ownership?.full_name ?? 'Corporate'}
        ownershipId={ownership?.id ?? session.ownershipId ?? ''}
      />
    )
  }
  ```

- [ ] **Step 4: Delete old mock imports from the file**

  The old `page.tsx` had these imports — confirm they are gone after the rewrite:
  - `import { LOCATIONS_BY_TENANT, LOCATION_BY_ID } from '@/lib/mock/locations'`
  - `import { BATCHES_BY_LOCATION, BATCH_BY_ID } from '@/lib/mock/batches'`
  - `import { ENROLLMENTS_BY_BATCH } from '@/lib/mock/enrollments'`

- [ ] **Step 5: Run TypeScript check**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors in the locations files.

- [ ] **Step 6: Smoke-test in browser**

  Start `npm run dev`. Log in as `franchisor.admin@demo.com`. Navigate to Admin → Locations. Expected: 3 TLP locations (Surrey Central, Abbotsford, Langley) loaded from DB. The "Add Location" modal opens and submitting creates a new location that appears in the list.

- [ ] **Step 7: Commit**

  ```bash
  git add "app/(app)/admin/locations/LocationsClient.tsx" "app/(app)/admin/locations/page.tsx"
  git commit -m "feat(locations): wire admin locations page to DB, add functional create modal"
  ```

---

## Task 6: Franchisee-Admin Locations Page

**Files:**
- Create: `app/(app)/franchisee-admin/locations/LocationsClient.tsx`
- Modify: `app/(app)/franchisee-admin/locations/page.tsx`

Same split pattern as Task 5. The franchisee-admin page shows only the locations belonging to the logged-in user's ownership.

- [ ] **Step 1: Read the current `app/(app)/franchisee-admin/locations/page.tsx`**

  Read the full file before editing.

- [ ] **Step 2: Create `app/(app)/franchisee-admin/locations/LocationsClient.tsx`**

  Identical structure to the admin `LocationsClient.tsx` (copy it). Accept the same props: `locations: LocationRow[]`, `ownershipName: string`, `ownershipId: string`. The `handleAddLocation` POST body should **not** include `ownershipId` (the API infers it from the session for `franchisee_admin`):

  ```tsx
  'use client'

  import { useState } from 'react'
  import { Badge } from '@/components/ui/Badge'
  import { Button } from '@/components/ui/Button'
  import { Card } from '@/components/ui/Card'
  import { Input } from '@/components/ui/Input'
  import { Modal } from '@/components/ui/Modal'
  import { PageHeader } from '@/components/layout/PageHeader'
  import { TLP } from '@/lib/theme/tokens'
  import type { LocationRow } from '@/lib/db/locations'

  interface Props {
    locations: LocationRow[]
    ownershipName: string
    ownershipId: string
  }

  export function LocationsClient({ locations, ownershipName }: Props) {
    const [search, setSearch] = useState('')
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [showAddLocation, setShowAddLocation] = useState(false)
    const [addForm, setAddForm] = useState({
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      country: 'Canada',
    })
    const [saving, setSaving] = useState(false)
    const [localLocations, setLocalLocations] = useState<LocationRow[]>(locations)

    const filtered = localLocations.filter(
      (loc) =>
        loc.name.toLowerCase().includes(search.toLowerCase()) ||
        loc.city.toLowerCase().includes(search.toLowerCase()),
    )

    async function handleAddLocation() {
      if (!addForm.name || !addForm.addressLine1 || !addForm.city || !addForm.stateProvince) return
      setSaving(true)
      try {
        const res = await fetch('/api/locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: addForm.name,
            addressLine1: addForm.addressLine1,
            addressLine2: addForm.addressLine2 || undefined,
            city: addForm.city,
            stateProvince: addForm.stateProvince,
            postalCode: addForm.postalCode || undefined,
            country: addForm.country,
          }),
        })
        if (res.ok) {
          const newLoc: LocationRow = await res.json()
          setLocalLocations((prev) => [...prev, newLoc])
          setShowAddLocation(false)
          setAddForm({ name: '', addressLine1: '', addressLine2: '', city: '', stateProvince: '', postalCode: '', country: 'Canada' })
        }
      } finally {
        setSaving(false)
      }
    }

    return (
      <div style={{ padding: 24 }}>
        <PageHeader
          title="Locations"
          subtitle={`${ownershipName} — ${localLocations.filter((l) => l.is_active).length} active location${localLocations.filter((l) => l.is_active).length !== 1 ? 's' : ''}`}
          actions={
            <Button variant="primary" icon="➕" onClick={() => setShowAddLocation(true)}>
              Add Location
            </Button>
          }
        />

        <div style={{ marginBottom: 20, maxWidth: 360 }}>
          <Input
            placeholder="Search locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map((loc) => {
            const isExpanded = expandedId === loc.id

            return (
              <Card key={loc.id} style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : loc.id)}
                  style={{
                    padding: '18px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    cursor: 'pointer',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: '#0a9b8a',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 20,
                        flexShrink: 0,
                      }}
                    >
                      📍
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: TLP.navy }}>{loc.name}</div>
                      <div style={{ fontSize: 13, color: TLP.gray500 }}>
                        {loc.address_line1}, {loc.city}, {loc.state_province} {loc.postal_code ?? ''}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', gap: 20 }}>
                      {(['Batches', 'Students', 'Coaches'] as const).map((label) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 18, fontWeight: 800, color: TLP.navy }}>—</div>
                          <div style={{ fontSize: 11, color: TLP.gray500, fontWeight: 600 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                    <Badge variant={loc.is_active ? 'success' : 'default'}>
                      {loc.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span style={{ color: TLP.gray400, fontSize: 18 }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      borderTop: `1px solid ${TLP.gray200}`,
                      padding: '16px 20px',
                      background: TLP.gray50,
                    }}
                  >
                    <div style={{ fontSize: 13, color: TLP.gray500, fontStyle: 'italic' }}>
                      Batch scheduling will be available in the next module.
                    </div>
                  </div>
                )}
              </Card>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', color: TLP.gray400, padding: 40 }}>
              No locations found.
            </div>
          )}
        </div>

        {showAddLocation && (
          <Modal
            title="Add Location"
            onClose={() => setShowAddLocation(false)}
            footer={
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => setShowAddLocation(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleAddLocation} disabled={saving}>
                  {saving ? 'Saving…' : 'Create Location'}
                </Button>
              </div>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input
                label="Location Name"
                placeholder="e.g. Toronto East"
                value={addForm.name}
                onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))}
              />
              <Input
                label="Address Line 1"
                placeholder="Street address"
                value={addForm.addressLine1}
                onChange={(e) => setAddForm((f) => ({ ...f, addressLine1: e.target.value }))}
              />
              <Input
                label="Address Line 2 (optional)"
                placeholder="Suite, unit, etc."
                value={addForm.addressLine2}
                onChange={(e) => setAddForm((f) => ({ ...f, addressLine2: e.target.value }))}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <Input
                  label="City"
                  placeholder="City"
                  value={addForm.city}
                  onChange={(e) => setAddForm((f) => ({ ...f, city: e.target.value }))}
                />
                <Input
                  label="Province / State"
                  placeholder="ON"
                  value={addForm.stateProvince}
                  onChange={(e) => setAddForm((f) => ({ ...f, stateProvince: e.target.value }))}
                />
                <Input
                  label="Postal Code"
                  placeholder="M4W 3L4"
                  value={addForm.postalCode}
                  onChange={(e) => setAddForm((f) => ({ ...f, postalCode: e.target.value }))}
                />
              </div>
            </div>
          </Modal>
        )}
      </div>
    )
  }
  ```

- [ ] **Step 3: Rewrite `app/(app)/franchisee-admin/locations/page.tsx`**

  ```tsx
  import { redirect } from 'next/navigation'
  import { getSession } from '@/lib/auth/session'
  import { createClient } from '@/lib/supabase/server'
  import { listLocations } from '@/lib/db/locations'
  import { LocationsClient } from './LocationsClient'

  export default async function FranchiseeLocationsPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const supabase = await createClient()
    const locations = await listLocations(supabase, session)

    const { data: ownership } = await supabase
      .from('ownerships')
      .select('full_name, id')
      .eq('id', session.ownershipId ?? '')
      .single()

    return (
      <LocationsClient
        locations={locations}
        ownershipName={ownership?.full_name ?? 'My Franchise'}
        ownershipId={ownership?.id ?? session.ownershipId ?? ''}
      />
    )
  }
  ```

- [ ] **Step 4: Smoke-test in browser**

  Log in as `franchisee.admin@demo.com`. Navigate to Franchisee Admin → Locations. Expected: 3 MLA locations (Toronto Downtown, Mississauga, Brampton) from DB only.

- [ ] **Step 5: Commit**

  ```bash
  git add "app/(app)/franchisee-admin/locations/LocationsClient.tsx" "app/(app)/franchisee-admin/locations/page.tsx"
  git commit -m "feat(locations): wire franchisee-admin locations page to DB"
  ```

---

## Task 7: Management Locations Page

**Files:**
- Create: `app/(app)/management/locations/LocationsClient.tsx`
- Modify: `app/(app)/management/locations/page.tsx`

The management page is read-only — FA/FM see all locations grouped by ownership. No create/edit actions. Replace `TENANTS` mock with a DB join.

- [ ] **Step 1: Read the current `app/(app)/management/locations/page.tsx`**

  Read the full file before editing.

- [ ] **Step 2: Create `app/(app)/management/locations/LocationsClient.tsx`**

  ```tsx
  'use client'

  import { useState } from 'react'
  import { Badge } from '@/components/ui/Badge'
  import { Card } from '@/components/ui/Card'
  import { Input } from '@/components/ui/Input'
  import { Select } from '@/components/ui/Select'
  import { PageHeader } from '@/components/layout/PageHeader'
  import { SectionHeader } from '@/components/ui/SectionHeader'
  import { TLP } from '@/lib/theme/tokens'
  import type { LocationRow } from '@/lib/db/locations'

  interface OwnershipGroup {
    id: string
    name: string
    locations: LocationRow[]
  }

  interface Props {
    groups: OwnershipGroup[]
    totalLocations: number
  }

  export function LocationsClient({ groups, totalLocations }: Props) {
    const [search, setSearch] = useState('')
    const [ownershipFilter, setOwnershipFilter] = useState('all')

    const ownershipOptions = [
      { value: 'all', label: 'All Ownerships' },
      ...groups.map((g) => ({ value: g.id, label: g.name })),
    ]

    const visibleGroups = groups
      .filter((g) => ownershipFilter === 'all' || g.id === ownershipFilter)
      .map((g) => ({
        ...g,
        locations: g.locations.filter((loc) => {
          const q = search.toLowerCase()
          return !q || loc.name.toLowerCase().includes(q) || loc.city.toLowerCase().includes(q)
        }),
      }))
      .filter((g) => g.locations.length > 0)

    const activeTotal = groups.flatMap((g) => g.locations).filter((l) => l.is_active).length

    return (
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <PageHeader
          title="All Locations"
          subtitle="Read-only overview of all locations across the network"
        />

        <div style={{ display: 'flex', gap: 14 }}>
          {[
            { label: 'Total Locations', value: totalLocations, color: TLP.navy },
            { label: 'Active Locations', value: activeTotal, color: TLP.green },
            { label: 'Ownerships', value: groups.length, color: TLP.teal },
          ].map((tile) => (
            <Card key={tile.label} style={{ padding: '16px 20px', flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: tile.color }}>{tile.value}</div>
              <div style={{ fontSize: 12, color: TLP.gray500, fontWeight: 600 }}>{tile.label}</div>
            </Card>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, maxWidth: 600 }}>
          <Input
            placeholder="Search locations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            value={ownershipFilter}
            onChange={(e) => setOwnershipFilter(e.target.value)}
            options={ownershipOptions}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {visibleGroups.map((group) => (
            <div key={group.id}>
              <SectionHeader title={group.name} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
                {group.locations.map((loc) => (
                  <Card key={loc.id} style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: TLP.navy }}>{loc.name}</div>
                        <div style={{ fontSize: 12, color: TLP.gray500 }}>
                          {loc.address_line1}, {loc.city}, {loc.state_province} {loc.postal_code ?? ''}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {(['Batches', 'Students', 'Coaches'] as const).map((label) => (
                          <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 800, color: TLP.navy }}>—</div>
                            <div style={{ fontSize: 10, color: TLP.gray500, fontWeight: 600 }}>{label}</div>
                          </div>
                        ))}
                        <Badge variant={loc.is_active ? 'success' : 'default'}>
                          {loc.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  ```

- [ ] **Step 3: Rewrite `app/(app)/management/locations/page.tsx`**

  ```tsx
  import { redirect } from 'next/navigation'
  import { getSession } from '@/lib/auth/session'
  import { createClient } from '@/lib/supabase/server'
  import { LocationsClient } from './LocationsClient'
  import type { LocationRow } from '@/lib/db/locations'

  export default async function ManagementLocationsPage() {
    const session = await getSession()
    if (!session) redirect('/login')

    const supabase = await createClient()

    // Fetch all ownerships + their locations in one join
    const { data: ownerships } = await supabase
      .from('ownerships')
      .select('id, full_name, locations(*)')
      .eq('is_active', true)
      .order('full_name')

    const groups = (ownerships ?? []).map((o) => ({
      id: o.id as string,
      name: o.full_name as string,
      locations: (o.locations as LocationRow[]) ?? [],
    }))

    const totalLocations = groups.reduce((sum, g) => sum + g.locations.length, 0)

    return <LocationsClient groups={groups} totalLocations={totalLocations} />
  }
  ```

- [ ] **Step 4: Smoke-test in browser**

  Log in as `franchisor.admin@demo.com`. Navigate to Management → Locations. Expected: 2 ownership groups — The Learning Planet (3 BC locations) and Maple Leaf Academy (3 ON locations). Ownership filter and search both work.

- [ ] **Step 5: Commit**

  ```bash
  git add "app/(app)/management/locations/LocationsClient.tsx" "app/(app)/management/locations/page.tsx"
  git commit -m "feat(locations): wire management locations page to DB with ownership grouping"
  ```

---

---

# Catalog Tasks (Tasks 8–12)

---

## Task 8: Catalog Migration

**Files:**
- Create: `supabase/migrations/004_catalog.sql`

- [ ] **Step 1: Create the migration file**

  Create `supabase/migrations/004_catalog.sql`:

  ```sql
  -- planets
  create table public.planets (
    id          uuid primary key default gen_random_uuid(),
    name        varchar(100) not null unique,
    description text,
    is_active   boolean not null default true,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
  );

  alter table public.planets enable row level security;

  create policy "authenticated read planets"
    on public.planets for select
    using (auth.role() = 'authenticated');

  create policy "public read active planets"
    on public.planets for select
    using (is_active = true);

  create policy "franchisor admin write planets"
    on public.planets for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin');

  -- products (UX: levels)
  create table public.products (
    id          uuid primary key default gen_random_uuid(),
    planet_id   uuid not null references public.planets(id),
    name        varchar(100) not null,
    sort_order  integer not null default 0,
    is_active   boolean not null default true,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    unique (planet_id, name)
  );

  alter table public.products enable row level security;

  create policy "authenticated read products"
    on public.products for select
    using (auth.role() = 'authenticated');

  create policy "public read active products"
    on public.products for select
    using (is_active = true);

  create policy "franchisor admin write products"
    on public.products for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin');

  -- product_variants (UX: course variants)
  create table public.product_variants (
    id                  uuid primary key default gen_random_uuid(),
    product_id          uuid not null references public.products(id),
    frequency_per_week  smallint not null check (frequency_per_week between 1 and 7),
    base_price          numeric(10,2) not null,
    setup_fee           numeric(10,2) not null default 0,
    is_active           boolean not null default true,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    unique (product_id, frequency_per_week)
  );

  alter table public.product_variants enable row level security;

  create policy "authenticated read product_variants"
    on public.product_variants for select
    using (auth.role() = 'authenticated');

  create policy "public read active product_variants"
    on public.product_variants for select
    using (is_active = true);

  create policy "franchisor admin write product_variants"
    on public.product_variants for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin');

  create index on public.products (planet_id);
  create index on public.product_variants (product_id);
  ```

- [ ] **Step 2: Apply the migration via Supabase MCP**

  Use `mcp__supabase__apply_migration` with project ID `nxocuhlrldrbbltiqkqh`.

- [ ] **Step 3: Verify migration applied**

  Use `mcp__supabase__list_tables` to confirm `planets`, `products`, `product_variants` appear.

- [ ] **Step 4: Commit**

  ```bash
  git add supabase/migrations/004_catalog.sql
  git commit -m "feat(catalog): add planets, products, product_variants migration with RLS"
  ```

---

## Task 9: Catalog Seed Script

**Files:**
- Create: `scripts/seed-catalog.ts`

- [ ] **Step 1: Create `scripts/seed-catalog.ts`**

  The script must be idempotent (skip by name uniqueness). Use `SUPABASE_SERVICE_ROLE_KEY` for admin access. Structure:

  1. Upsert each planet by name → collect `{ name → id }` map.
  2. For each planet, upsert levels with `sort_order` matching array index.
  3. For each level, upsert variants (1×, 2×, 3× weekly) with prices from the spec.

  Seed data:
  - **Chess**: PP, RR — variants at $159/$199/$239 + $50 setup fee.
  - **Math**: Grade 1–10 — same variant pricing.
  - **English**: Grade 1–10 — same variant pricing.
  - **Finance**: Beginner, Intermediate, Advanced — same variant pricing.
  - **Arts**: Beginner, Intermediate, Advanced — same variant pricing.

- [ ] **Step 2: Run the seed script**

  ```bash
  npx tsx scripts/seed-catalog.ts
  ```

  Confirm: "Seeded X planets, Y levels, Z variants" output.

- [ ] **Step 3: Verify in Supabase**

  Use `mcp__supabase__execute_sql` to confirm row counts match expected totals.

- [ ] **Step 4: Commit**

  ```bash
  git add scripts/seed-catalog.ts
  git commit -m "feat(catalog): seed planets, products, product_variants demo data"
  ```

---

## Task 10: Catalog Data-Access Layer

**Files:**
- Create: `lib/db/catalog.ts`
- Create: `lib/db/catalog.test.ts`

- [ ] **Step 1: Write failing tests in `lib/db/catalog.test.ts`**

  Test cases:
  - `listPlanets` returns all active planets sorted by name.
  - `listLevels(planetId)` returns only levels for that planet, sorted by `sort_order`.
  - `listVariants(levelId)` returns variants for that level, sorted by `frequency_per_week`.
  - `deactivatePlanet` sets `is_active = false` without deleting.
  - `createPlanet` with duplicate name throws a unique constraint error.

- [ ] **Step 2: Run tests to verify they fail**

  ```bash
  npx vitest run lib/db/catalog.test.ts
  ```

- [ ] **Step 3: Create `lib/db/catalog.ts`**

  Export typed functions:

  ```typescript
  export type PlanetRow = { id: string; name: string; description: string | null; is_active: boolean; created_at: string; updated_at: string }
  export type LevelRow  = { id: string; planet_id: string; name: string; sort_order: number; is_active: boolean; created_at: string; updated_at: string }
  export type VariantRow = { id: string; product_id: string; frequency_per_week: number; base_price: number; setup_fee: number; is_active: boolean; created_at: string; updated_at: string }

  export async function listPlanets(supabase): Promise<PlanetRow[]>
  export async function createPlanet(supabase, input: { name: string; description?: string }): Promise<PlanetRow>
  export async function updatePlanet(supabase, id: string, patch: Partial<Pick<PlanetRow, 'name' | 'description' | 'is_active'>>): Promise<PlanetRow | null>
  export async function deactivatePlanet(supabase, id: string): Promise<void>

  export async function listLevels(supabase, planetId: string): Promise<LevelRow[]>
  export async function createLevel(supabase, input: { planetId: string; name: string; sortOrder?: number }): Promise<LevelRow>
  export async function updateLevel(supabase, id: string, patch: Partial<Pick<LevelRow, 'name' | 'sort_order' | 'is_active'>>): Promise<LevelRow | null>
  export async function deactivateLevel(supabase, id: string): Promise<void>

  export async function listVariants(supabase, levelId: string): Promise<VariantRow[]>
  export async function createVariant(supabase, input: { levelId: string; frequencyPerWeek: number; basePrice: number; setupFee?: number }): Promise<VariantRow>
  export async function updateVariant(supabase, id: string, patch: Partial<Pick<VariantRow, 'frequency_per_week' | 'base_price' | 'setup_fee' | 'is_active'>>): Promise<VariantRow | null>
  export async function deactivateVariant(supabase, id: string): Promise<void>
  ```

- [ ] **Step 4: Run tests to verify they pass**

  ```bash
  npx vitest run lib/db/catalog.test.ts
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add lib/db/catalog.ts lib/db/catalog.test.ts
  git commit -m "feat(catalog): data-access layer for planets, products, product_variants"
  ```

---

## Task 11: Catalog API Routes

**Files:**
- Create: `app/api/planets/route.ts`
- Create: `app/api/planets/[id]/route.ts`
- Create: `app/api/levels/route.ts`
- Create: `app/api/levels/[id]/route.ts`
- Create: `app/api/course-variants/route.ts`
- Create: `app/api/course-variants/[id]/route.ts`

- [ ] **Step 1: Create `app/api/planets/route.ts`**

  - `GET`: no auth required (public catalog). Returns active planets sorted by name.
  - `POST`: FA only. Body: `{ name, description? }`. Returns `201 + PlanetRow`.

- [ ] **Step 2: Create `app/api/planets/[id]/route.ts`**

  - `PATCH`: FA only. Partial update from body. Returns `200 + PlanetRow` or `404`.
  - `DELETE`: FA only. Calls `deactivatePlanet` (sets `is_active = false`). Returns `204`.

- [ ] **Step 3: Create `app/api/levels/route.ts`**

  - `GET`: no auth required. `?planetId=` required — 400 if missing. Returns levels sorted by `sort_order`.
  - `POST`: FA only. Body: `{ planetId, name, sortOrder? }`. Returns `201 + LevelRow`.

- [ ] **Step 4: Create `app/api/levels/[id]/route.ts`**

  - `PATCH`: FA only. Returns `200 + LevelRow` or `404`.
  - `DELETE`: FA only. Deactivates. Returns `204`.

- [ ] **Step 5: Create `app/api/course-variants/route.ts`**

  - `GET`: no auth required. `?levelId=` required. Returns variants sorted by `frequency_per_week`.
  - `POST`: FA only. Body: `{ levelId, frequencyPerWeek, basePrice, setupFee? }`. Returns `201 + VariantRow`.

- [ ] **Step 6: Create `app/api/course-variants/[id]/route.ts`**

  - `PATCH`: FA only. Returns `200 + VariantRow` or `404`.
  - `DELETE`: FA only. Deactivates. Returns `204`.

- [ ] **Step 7: Smoke-test all GET endpoints**

  ```bash
  curl http://localhost:3000/api/planets
  curl "http://localhost:3000/api/levels?planetId=<chess-uuid>"
  curl "http://localhost:3000/api/course-variants?levelId=<pp-uuid>"
  ```

  Confirm JSON arrays return seeded data.

- [ ] **Step 8: Commit**

  ```bash
  git add app/api/planets app/api/levels app/api/course-variants
  git commit -m "feat(catalog): planets, levels, course-variants API routes"
  ```

---

## Task 12: Admin → Planets Page

**Files:**
- Create: `app/(app)/admin/planets/PlanetsClient.tsx`
- Modify: `app/(app)/admin/planets/page.tsx`

- [ ] **Step 1: Read the current `app/(app)/admin/planets/page.tsx`**

  Understand existing mock imports and component structure before modifying.

- [ ] **Step 2: Create `app/(app)/admin/planets/PlanetsClient.tsx`**

  Client component. Props: `planets: PlanetRow[]` (each with nested `levels: LevelRow[]`, each with nested `variants: VariantRow[]`).

  UI:
  - Planet row: name, description, active badge, "Add Level" button, expand toggle.
  - Level row (inside accordion): name, sort_order, "Add Variant" button, expand toggle.
  - Variant row: frequency label ("1× / week"), base_price, setup_fee, active badge.
  - "Add Planet" button at top → POST `/api/planets` → optimistic append.
  - "Add Level" → POST `/api/levels` → optimistic append under parent planet.
  - "Add Variant" → POST `/api/course-variants` → optimistic append under parent level.
  - Deactivate (PATCH `isActive: false`) on each row with confirmation.

- [ ] **Step 3: Rewrite `app/(app)/admin/planets/page.tsx` as Server Component**

  Fetch full catalog tree in one query:

  ```typescript
  const { data: planets } = await supabase
    .from('planets')
    .select('*, products(*, product_variants(*))')
    .order('name')
  ```

  Pass to `PlanetsClient`.

- [ ] **Step 4: Smoke-test in browser**

  Log in as `franchisor.admin@demo.com`. Navigate to Admin → Planets. Confirm tree renders with seeded data, "Add Planet" modal opens and submits.

- [ ] **Step 5: Commit**

  ```bash
  git add "app/(app)/admin/planets/PlanetsClient.tsx" "app/(app)/admin/planets/page.tsx"
  git commit -m "feat(catalog): wire admin planets page to DB with accordion tree UI"
  ```

---

---

# Offerings & Holidays Tasks (Tasks 13–18)

---

## Task 13: Offerings Migration

**Files:**
- Create: `supabase/migrations/005_offerings.sql`

- [ ] **Step 1: Create the migration file**

  ```sql
  create table public.location_course_offerings (
    id                  uuid primary key default gen_random_uuid(),
    location_id         uuid not null references public.locations(id),
    product_variant_id  uuid not null references public.product_variants(id),
    price               numeric(10,2) not null,
    setup_fee           numeric(10,2) not null default 0,
    is_active           boolean not null default true,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now(),
    unique (location_id, product_variant_id)
  );

  alter table public.location_course_offerings enable row level security;

  -- FA/FM: read all offerings
  create policy "franchisor read all offerings"
    on public.location_course_offerings for select
    using (
      (auth.jwt() -> 'app_metadata' ->> 'role') in ('franchisor_admin', 'franchisor_mgmt')
    );

  -- Scoped roles: read offerings for locations in their ownership
  create policy "scoped users read own offerings"
    on public.location_course_offerings for select
    using (
      location_id in (
        select id from public.locations
        where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
      )
    );

  -- Public: read active offerings (for storefront)
  create policy "public read active offerings"
    on public.location_course_offerings for select
    using (is_active = true);

  -- FA: insert/update any offering
  create policy "franchisor admin write offerings"
    on public.location_course_offerings for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin');

  -- XA: insert/update offerings for their own locations
  create policy "franchisee admin write own offerings"
    on public.location_course_offerings for all
    using (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
      and location_id in (
        select id from public.locations
        where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
      )
    )
    with check (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
      and location_id in (
        select id from public.locations
        where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
      )
    );

  create index on public.location_course_offerings (location_id);
  create index on public.location_course_offerings (product_variant_id);
  ```

- [ ] **Step 2: Apply the migration**

  Use `mcp__supabase__apply_migration` with project ID `nxocuhlrldrbbltiqkqh`.

- [ ] **Step 3: Fix `lib/types.ts` `LocationCourseOffering` type**

  Update the TypeScript type to include `price` and `setupFee` fields (gaps.md §4b fix).

- [ ] **Step 4: Commit**

  ```bash
  git add supabase/migrations/005_offerings.sql lib/types.ts
  git commit -m "feat(offerings): add location_course_offerings migration + fix TypeScript type"
  ```

---

## Task 14: Offerings Seed + Data-Access + API

**Files:**
- Create: `scripts/seed-offerings.ts`
- Create: `lib/db/offerings.ts`
- Create: `lib/db/offerings.test.ts`
- Create: `app/api/locations/[id]/offerings/route.ts`
- Create: `app/api/locations/[id]/offerings/[offeringId]/route.ts`

- [ ] **Step 1: Create `scripts/seed-offerings.ts`**

  For each of the 6 demo locations: look up real `location_id` by name + ownership slug. Look up `product_variant_id`s for Chess PP and RR (1×, 2×, 3× weekly). Upsert offerings with prices matching mock data. Mark all Chess offerings `is_active = true`; seed other planet offerings as `is_active = false`. Idempotent (skip by unique constraint).

- [ ] **Step 2: Run the seed script**

  ```bash
  npx tsx scripts/seed-offerings.ts
  ```

- [ ] **Step 3: Create `lib/db/offerings.ts`**

  ```typescript
  export type OfferingRow = {
    id: string; location_id: string; product_variant_id: string
    price: number; setup_fee: number; is_active: boolean
    created_at: string; updated_at: string
  }

  export async function listOfferings(supabase, locationId: string, session): Promise<OfferingRow[]>
  // Joins: variant { frequency_per_week, base_price, product { name, planet { name } } }
  export async function createOffering(supabase, input: { locationId: string; productVariantId: string; price: number; setupFee?: number }, session): Promise<OfferingRow>
  export async function updateOffering(supabase, id: string, patch: Partial<Pick<OfferingRow, 'price' | 'setup_fee' | 'is_active'>>, session): Promise<OfferingRow | null>
  ```

  Scoping: FA/FM see any location's offerings. XA/XM see only own-ownership locations. Returns `null` (→ 404) for out-of-scope.

- [ ] **Step 4: Write tests in `lib/db/offerings.test.ts`**

  Test scoping: XA from TLP cannot read Maple Leaf offerings; FA can read both.

- [ ] **Step 5: Create `app/api/locations/[id]/offerings/route.ts`**

  - `GET`: all authenticated roles (CX included — needed for enrollment). Calls `listOfferings`. Returns 404 if location is out of scope.
  - `POST`: FA and XA only. Body: `{ productVariantId, price, setupFee? }`. Returns `201 + OfferingRow`.

- [ ] **Step 6: Create `app/api/locations/[id]/offerings/[offeringId]/route.ts`**

  - `PATCH`: FA and XA only. Patchable: `price`, `setupFee`, `isActive`. Returns `200` or `404`.

- [ ] **Step 7: Commit**

  ```bash
  git add scripts/seed-offerings.ts lib/db/offerings.ts lib/db/offerings.test.ts "app/api/locations/[id]/offerings"
  git commit -m "feat(offerings): seed, data-access layer, and API for location_course_offerings"
  ```

---

## Task 15: Holidays Migration

**Files:**
- Create: `supabase/migrations/006_holidays.sql`

- [ ] **Step 1: Create the migration file**

  ```sql
  create table public.holidays (
    id           uuid primary key default gen_random_uuid(),
    date         date not null,
    name         varchar(255) not null,
    ownership_id uuid references public.ownerships(id),
    location_id  uuid references public.locations(id),
    created_at   timestamptz not null default now(),
    -- A holiday is scoped to ownership OR location, not both simultaneously
    constraint holidays_single_scope check (
      not (ownership_id is not null and location_id is not null)
    ),
    unique (date, ownership_id, location_id)
  );

  alter table public.holidays enable row level security;

  -- Global holidays: visible to all authenticated users
  create policy "authenticated read global holidays"
    on public.holidays for select
    using (
      auth.role() = 'authenticated'
      and ownership_id is null
      and location_id is null
    );

  -- Ownership-scoped holidays: visible to own ownership
  create policy "authenticated read own ownership holidays"
    on public.holidays for select
    using (
      auth.role() = 'authenticated'
      and ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
    );

  -- Location-scoped holidays: visible if location belongs to own ownership
  create policy "authenticated read own location holidays"
    on public.holidays for select
    using (
      auth.role() = 'authenticated'
      and location_id in (
        select id from public.locations
        where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
      )
    );

  -- FA/FM: read all holidays unconditionally
  create policy "franchisor read all holidays"
    on public.holidays for select
    using (
      (auth.jwt() -> 'app_metadata' ->> 'role') in ('franchisor_admin', 'franchisor_mgmt')
    );

  -- FA: insert and delete any holiday
  create policy "franchisor admin write holidays"
    on public.holidays for all
    using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')
    with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin');

  -- XA: insert/delete holidays scoped to own ownership or own locations
  create policy "franchisee admin write own holidays"
    on public.holidays for all
    using (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
      and (
        ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
        or location_id in (
          select id from public.locations
          where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
        )
      )
    )
    with check (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
      and (
        ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
        or location_id in (
          select id from public.locations
          where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
        )
      )
    );

  create index on public.holidays (date);
  create index on public.holidays (ownership_id);
  create index on public.holidays (location_id);
  ```

- [ ] **Step 2: Apply the migration**

  Use `mcp__supabase__apply_migration`.

- [ ] **Step 3: Commit**

  ```bash
  git add supabase/migrations/006_holidays.sql
  git commit -m "feat(holidays): add holidays table with ownership+location scoping and RLS"
  ```

---

## Task 16: Holidays Seed + Data-Access + API

**Files:**
- Create: `scripts/seed-holidays.ts`
- Create: `lib/db/holidays.ts`
- Create: `lib/db/holidays.test.ts`
- Create: `app/api/holidays/route.ts`
- Create: `app/api/holidays/[id]/route.ts`

- [ ] **Step 1: Create `scripts/seed-holidays.ts`**

  Seed the 9 demo holidays from the spec. Global ones use `ownership_id = null, location_id = null`. BC-specific ones use TLP's `ownership_id`. Idempotent via unique constraint `(date, ownership_id, location_id)`.

- [ ] **Step 2: Run seed**

  ```bash
  npx tsx scripts/seed-holidays.ts
  ```

- [ ] **Step 3: Create `lib/db/holidays.ts`**

  ```typescript
  export type HolidayRow = {
    id: string; date: string; name: string
    ownership_id: string | null; location_id: string | null; created_at: string
  }
  export type HolidayFilters = { ownershipId?: string; locationId?: string }

  export async function listHolidays(supabase, filters: HolidayFilters, session): Promise<HolidayRow[]>
  // Returns global + own-scope holidays. FA gets all. Filters narrow further.
  export async function createHoliday(supabase, input: { date: string; name: string; ownershipId?: string; locationId?: string }, session): Promise<HolidayRow>
  // XA: validates ownershipId = own, locationId = own location. Throws 403 otherwise.
  export async function deleteHoliday(supabase, id: string, session): Promise<void | null>
  // null = not found or out of scope
  ```

- [ ] **Step 4: Write tests in `lib/db/holidays.test.ts`**

  - FA sees global + TLP + Maple Leaf holidays.
  - XA from TLP sees global + TLP holidays only.
  - XA from Maple Leaf cannot delete a TLP holiday.
  - `createHoliday` by XA with another ownership's `ownershipId` returns null/throws.

- [ ] **Step 5: Create `app/api/holidays/route.ts`**

  - `GET ?ownershipId=&locationId=`: Authenticated. Returns caller-visible holidays, filtered by query params if provided.
  - `POST`: FA and XA only. Body: `{ date, name, ownershipId?, locationId? }`. Returns `201 + HolidayRow`.

- [ ] **Step 6: Create `app/api/holidays/[id]/route.ts`**

  - `DELETE`: FA and XA only (own-scope). Returns `204` or `404`.

- [ ] **Step 7: Commit**

  ```bash
  git add scripts/seed-holidays.ts lib/db/holidays.ts lib/db/holidays.test.ts app/api/holidays
  git commit -m "feat(holidays): seed, data-access layer, and API for holidays"
  ```

---

## Task 17: Admin → Holidays Page

**Files:**
- Create: `app/(app)/admin/holidays/HolidaysClient.tsx`
- Modify: `app/(app)/admin/holidays/page.tsx`

- [ ] **Step 1: Read the current `app/(app)/admin/holidays/page.tsx`**

- [ ] **Step 2: Create `app/(app)/admin/holidays/HolidaysClient.tsx`**

  Props: `holidays: HolidayRow[]`, `ownerships: OwnershipRow[]`, `locations: LocationRow[]`.

  UI:
  - List view: date, name, scope badge ("Global", ownership name, or location name).
  - "Add Holiday" button → modal: date picker, name field, optional scope selector (ownership dropdown or location dropdown — mutually exclusive).
  - Delete button per holiday (calls `DELETE /api/holidays/:id`).
  - Optimistic removal from local state on delete.

- [ ] **Step 3: Rewrite `app/(app)/admin/holidays/page.tsx` as Server Component**

  Fetch:
  - All holidays via `listHolidays(supabase, {}, session)`.
  - All ownerships (for scope selector in Add modal).
  - All locations (for scope selector in Add modal).

- [ ] **Step 4: Smoke-test in browser**

  Log in as `franchisor.admin@demo.com`. Navigate to Admin → Holidays. Confirm seeded holidays appear. Add a holiday and confirm it appears.

- [ ] **Step 5: Commit**

  ```bash
  git add "app/(app)/admin/holidays/HolidaysClient.tsx" "app/(app)/admin/holidays/page.tsx"
  git commit -m "feat(holidays): wire admin holidays page to DB"
  ```

---

## Task 18: Franchisee Admin → Holidays Page

**Files:**
- Create: `app/(app)/franchisee-admin/holidays/HolidaysClient.tsx`
- Modify: `app/(app)/franchisee-admin/holidays/page.tsx`

- [ ] **Step 1: Read the current `app/(app)/franchisee-admin/holidays/page.tsx`**

- [ ] **Step 2: Create `app/(app)/franchisee-admin/holidays/HolidaysClient.tsx`**

  Props: `holidays: HolidayRow[]`, `locations: LocationRow[]` (own locations only).

  UI:
  - Grouped view: "Corporate Holidays" (global, read-only) and "Your Holidays" (own scope, editable).
  - "Add Holiday" → modal: date, name, scope (own ownership or specific own location).
  - Delete only on own-scope holidays (not global ones).

- [ ] **Step 3: Rewrite `app/(app)/franchisee-admin/holidays/page.tsx` as Server Component**

  Fetch:
  - Holidays via `listHolidays(supabase, { ownershipId: session.ownershipId }, session)`.
  - Own locations via `listLocations(supabase, session)`.

- [ ] **Step 4: Smoke-test in browser**

  Log in as `franchisee.admin@demo.com`. Navigate to Franchisee Admin → Holidays. Confirm global holidays appear read-only. Add an ownership-scoped holiday.

- [ ] **Step 5: Commit**

  ```bash
  git add "app/(app)/franchisee-admin/holidays/HolidaysClient.tsx" "app/(app)/franchisee-admin/holidays/page.tsx"
  git commit -m "feat(holidays): wire franchisee-admin holidays page to DB"
  ```

---

## Self-Review

**Locations (Tasks 1–7) — complete:**
- [x] locations table with FK to ownerships — Task 1
- [x] RLS: FA/FM see all; XA/XM/scoped see own — Task 1
- [x] Seed 6 demo locations matching mock data — Task 2
- [x] Data-access layer with scoped `listLocations`, `getLocation`, `createLocation`, `updateLocation`, `listPublicLocations` — Task 3
- [x] GET/POST `/api/locations` — Task 4
- [x] GET/PATCH `/api/locations/[id]` — Task 4
- [x] GET `/api/public/locations?ownershipId=` — Task 4
- [x] Admin locations page reads from DB — Task 5
- [x] Franchisee-admin locations page reads from DB — Task 6
- [x] Management locations page reads from DB with ownership grouping — Task 7
- [x] "Add Location" modal functional in admin + franchisee-admin pages — Tasks 5, 6

**Catalog (Tasks 8–12) — pending:**
- [x] `planets`, `products`, `product_variants` migration with RLS — Task 8
- [x] Seed 5 planets, ~30 levels, ~90 variants — Task 9
- [x] `lib/db/catalog.ts` with listPlanets/Levels/Variants + write fns — Task 10
- [x] `lib/db/catalog.test.ts` — Task 10
- [x] GET/POST `/api/planets`, PATCH/DELETE `/api/planets/[id]` — Task 11
- [x] GET/POST `/api/levels`, PATCH/DELETE `/api/levels/[id]` — Task 11
- [x] GET/POST `/api/course-variants`, PATCH/DELETE `/api/course-variants/[id]` — Task 11
- [x] Admin → Planets page wired to DB with accordion tree UI — Task 12

**Offerings (Task 13–14) — pending:**
- [x] `location_course_offerings` migration with RLS — Task 13
- [x] Fix `lib/types.ts` `LocationCourseOffering` type (add price, setupFee) — Task 13
- [x] Seed offerings for 6 demo locations — Task 14
- [x] `lib/db/offerings.ts` + `offerings.test.ts` — Task 14
- [x] GET/POST `/api/locations/[id]/offerings` — Task 14
- [x] PATCH `/api/locations/[id]/offerings/[offeringId]` — Task 14

**Holidays (Tasks 15–18) — pending:**
- [x] `holidays` migration with `ownership_id` + `location_id` + RLS (fixes gaps.md §4a) — Task 15
- [x] Seed 9 demo holidays — Task 16
- [x] `lib/db/holidays.ts` + `holidays.test.ts` — Task 16
- [x] GET/POST `/api/holidays`, DELETE `/api/holidays/[id]` — Task 16
- [x] Admin → Holidays page wired to DB — Task 17
- [x] Franchisee Admin → Holidays page wired to DB — Task 18

**Batch stats:** Intentionally show `—` placeholder. Stats will be live once Module 5 (Batches) migrates batch data to DB.

**Type consistency:** camelCase body fields → snake_case DB fields mapping must be maintained in all new route handlers (same pattern as locations).
