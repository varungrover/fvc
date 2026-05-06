# Module 3 — Locations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock location data with a real `locations` table — migration, RLS, CRUD API, seed, and updated admin/franchisee-admin/management pages that read from DB.

**Architecture:** `locations` has a FK to `ownerships` (built in Module 2). RLS mirrors the ownership pattern: FA/FM see all locations globally; scoped roles (XA/XM/coach/customer) see only locations belonging to their `ownership_id` from JWT `app_metadata`. Pages convert from `"use client"` + mock imports to Server Component data-fetching + Client Component rendering. Batch/enrollment stats remain placeholder (`—`) until Module 4 (Batches), since mock batch IDs don't match real UUID location IDs.

**Tech Stack:** Next.js 16.2.2 App Router · Supabase Postgres · `@supabase/ssr` · Vitest 3.x · TypeScript 5

**Supabase project ID:** `nxocuhlrldrbbltiqkqh`

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `supabase/migrations/003_locations.sql` | Create | locations table, RLS, FK to ownerships |
| `scripts/seed-locations.ts` | Create | Seed 6 demo locations; looks up ownership IDs by slug |
| `lib/db/locations.ts` | Create | Scoped data-access functions (same pattern as ownerships.ts) |
| `lib/db/locations.test.ts` | Create | Unit tests for scoping / filtering logic |
| `app/api/locations/route.ts` | Create | GET scoped list + POST create |
| `app/api/locations/[id]/route.ts` | Create | GET single + PATCH update |
| `app/api/public/locations/route.ts` | Create | GET active locations by ownership slug (storefront) |
| `app/(app)/admin/locations/LocationsClient.tsx` | Create | Client component: search, expand, add-location modal for admin |
| `app/(app)/admin/locations/page.tsx` | Modify | Server Component: fetch DB locations, pass to LocationsClient |
| `app/(app)/franchisee-admin/locations/LocationsClient.tsx` | Create | Client component for franchisee-admin locations UI |
| `app/(app)/franchisee-admin/locations/page.tsx` | Modify | Server Component: fetch DB locations for franchisee scope |
| `app/(app)/management/locations/LocationsClient.tsx` | Create | Client component for management read-only locations view |
| `app/(app)/management/locations/page.tsx` | Modify | Server Component: fetch all DB locations with ownership info |

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

## Self-Review

**Spec coverage check:**
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

**Batch stats:** Intentionally show `—` placeholder. Mock batch IDs (e.g. `loc_tlp_surrey`) are not UUID-compatible with real seeded location IDs. Stats will be live once Module 4 (Batches) migrates batch data to DB.

**Type consistency check:**
- `LocationRow` interface defined once in `lib/db/locations.ts`, imported in both API routes and Client components — consistent.
- `updateLocation` patch keys (`address_line1`, `state_province`, etc.) match `LocationRow` field names — consistent.
- API route maps camelCase body fields (`addressLine1`) to snake_case DB fields (`address_line1`) — consistent across POST and PATCH.

**Placeholder scan:** No TBDs, no "implement later", all code blocks are complete.
