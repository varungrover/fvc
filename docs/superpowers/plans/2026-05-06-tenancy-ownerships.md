# Module 2 — Tenancy & Ownerships Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock tenant data with a real `ownerships` table — CRUD API, RLS, FK linkage to profiles, and seeded demo ownerships.

**Architecture:** `ownerships` table owns branding + contact fields. RLS enforces FA/FM global read vs. XA/XM scoped read at the DB layer. A thin data-access layer (`lib/db/ownerships.ts`) holds scoping logic; API routes are thin wrappers. App layout and storefront read from DB instead of mock.

**Tech Stack:** Next.js 16.2.2 App Router · Supabase Postgres · `@supabase/ssr` · Vitest 3.x · TypeScript 5

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `supabase/migrations/002_ownerships.sql` | Create | ownerships table, RLS, FK on profiles |
| `lib/db/ownerships.ts` | Create | Scoped data-access functions |
| `lib/db/ownerships.test.ts` | Create | Unit tests for scoping logic |
| `app/api/ownerships/route.ts` | Create | GET list + POST create |
| `app/api/ownerships/[id]/route.ts` | Create | GET single + PATCH update |
| `app/api/public/ownerships/route.ts` | Create | Public GET by slug (storefront use) |
| `scripts/seed-ownerships.ts` | Create | Seed TLP + MLA, update demo user ownership_id |
| `app/(app)/layout.tsx` | Modify | Replace TENANT_BY_ID mock with DB query |
| `app/t/[tenant]/page.tsx` | Modify | Replace TENANT_BY_SLUG mock with public API call |

---

## Task 1: Migration

**Files:**
- Create: `supabase/migrations/002_ownerships.sql`

- [ ] **Step 1: Create the migration file**

  Create `supabase/migrations/002_ownerships.sql`:

  ```sql
  create table public.ownerships (
    id             uuid primary key default gen_random_uuid(),
    full_name      varchar(255) not null,
    email          varchar(255) not null unique,
    ownership_type varchar(20)  not null check (ownership_type in ('corporate', 'franchisee')),
    slug           varchar(100) not null unique,
    logo_url       varchar(500),
    brand_primary  varchar(20)  not null default '#0a9b8a',
    brand_accent   varchar(20)  not null default '#e67e22',
    tagline        text,
    is_active      boolean      not null default true,
    created_at     timestamptz  not null default now(),
    updated_at     timestamptz  not null default now()
  );

  -- RLS
  alter table public.ownerships enable row level security;

  -- FA/FM: read all ownerships
  create policy "franchisor staff read all ownerships"
    on public.ownerships for select
    using (
      (auth.jwt() -> 'app_metadata' ->> 'role') in ('franchisor_admin', 'franchisor_mgmt')
    );

  -- XA/XM/CO/CX: read own ownership only
  create policy "scoped users read own ownership"
    on public.ownerships for select
    using (
      id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
    );

  -- Public: read active ownerships (branding for storefront — no email exposed)
  create policy "public read active ownerships"
    on public.ownerships for select
    using (is_active = true);

  -- FA: insert
  create policy "franchisor admin insert ownership"
    on public.ownerships for insert
    with check (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
    );

  -- FA: update
  create policy "franchisor admin update ownership"
    on public.ownerships for update
    using (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
    );

  -- Add FK from profiles.ownership_id to ownerships.id
  alter table public.profiles
    add constraint profiles_ownership_id_fkey
    foreign key (ownership_id) references public.ownerships(id);
  ```

- [ ] **Step 2: Apply the migration via Supabase MCP**

  Use `mcp__supabase__apply_migration` with:
  - `project_id`: `nxocuhlrldrbbltiqkqh`
  - `name`: `002_ownerships`
  - `query`: the full SQL from Step 1

- [ ] **Step 3: Verify migration applied**

  Use `mcp__supabase__execute_sql` with:
  ```sql
  select column_name, data_type
  from information_schema.columns
  where table_schema = 'public' and table_name = 'ownerships'
  order by ordinal_position;
  ```

  Expected: 12 columns including `id`, `slug`, `brand_primary`, `brand_accent`.

- [ ] **Step 4: Commit**

  ```bash
  git add supabase/migrations/002_ownerships.sql
  git commit -m "feat(ownerships): add ownerships table migration with RLS and profiles FK"
  ```

---

## Task 2: Seed Ownerships + Update Demo Users

**Files:**
- Create: `scripts/seed-ownerships.ts`

- [ ] **Step 1: Create `scripts/seed-ownerships.ts`**

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

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === '<NEEDS_TO_BE_SET>') {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const SEED_OWNERSHIPS = [
    {
      full_name: 'The Learning Planet',
      email: 'ops@learningplanet.com',
      ownership_type: 'corporate' as const,
      slug: 'learning-planet',
      brand_primary: '#805ad5',
      brand_accent: '#f5a623',
      tagline: 'Where curious kids become confident learners.',
    },
    {
      full_name: 'Maple Leaf Academy',
      email: 'hello@mapleleafacademy.ca',
      ownership_type: 'franchisee' as const,
      slug: 'maple-leaf',
      brand_primary: '#0a9b8a',
      brand_accent: '#e67e22',
      tagline: "Canadian academies for tomorrow's leaders.",
    },
  ]

  // Demo user → which ownership slug they belong to
  const USER_OWNERSHIP_MAP: Record<string, string> = {
    'franchisor.admin@demo.com': 'learning-planet',
    'franchisor.mgmt@demo.com':  'learning-planet',
    'coach@demo.com':             'learning-planet',
    'franchisee.admin@demo.com': 'maple-leaf',
    'franchisee.mgmt@demo.com':  'maple-leaf',
    // parent@demo.com has no ownership_id
  }

  async function seed() {
    console.log('Seeding ownerships…\n')

    // 1. Upsert ownerships by slug
    const ownershipBySlug: Record<string, string> = {}

    for (const o of SEED_OWNERSHIPS) {
      const { data: existing } = await admin
        .from('ownerships')
        .select('id')
        .eq('slug', o.slug)
        .single()

      if (existing) {
        console.log(`  ✓ skip  ${o.full_name} (already exists, id: ${existing.id})`)
        ownershipBySlug[o.slug] = existing.id
        continue
      }

      const { data, error } = await admin
        .from('ownerships')
        .insert(o)
        .select('id')
        .single()

      if (error || !data) {
        console.error(`  ✗ fail  ${o.full_name}: ${error?.message}`)
        process.exit(1)
      }

      console.log(`  ✓ create ${o.full_name} (id: ${data.id})`)
      ownershipBySlug[o.slug] = data.id
    }

    // 2. Update demo users: app_metadata + profiles.ownership_id
    console.log('\nUpdating demo user ownership_id…\n')

    const { data: users } = await admin.auth.admin.listUsers()

    for (const [email, slug] of Object.entries(USER_OWNERSHIP_MAP)) {
      const ownershipId = ownershipBySlug[slug]
      if (!ownershipId) {
        console.error(`  ✗ no ownership found for slug "${slug}"`)
        continue
      }

      const user = users?.users.find((u) => u.email === email)
      if (!user) {
        console.log(`  - skip  ${email} (user not found)`)
        continue
      }

      // Update app_metadata
      const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.app_metadata, ownership_id: ownershipId },
      })
      if (metaError) {
        console.error(`  ✗ meta  ${email}: ${metaError.message}`)
        continue
      }

      // Update profiles table
      const { error: profileError } = await admin
        .from('profiles')
        .update({ ownership_id: ownershipId })
        .eq('id', user.id)
      if (profileError) {
        console.error(`  ✗ profile ${email}: ${profileError.message}`)
        continue
      }

      console.log(`  ✓ ${email} → ${slug} (${ownershipId})`)
    }

    console.log('\nDone.')
  }

  seed().catch((err) => {
    console.error(err)
    process.exit(1)
  })
  ```

- [ ] **Step 2: Add seed script to `package.json`**

  Add to `"scripts"`:
  ```json
  "seed:ownerships": "tsx scripts/seed-ownerships.ts"
  ```

- [ ] **Step 3: Run the seed**

  ```bash
  npm run seed:ownerships
  ```

  Expected output:
  ```
  Seeding ownerships…

    ✓ create The Learning Planet (id: <uuid>)
    ✓ create Maple Leaf Academy (id: <uuid>)

  Updating demo user ownership_id…

    ✓ franchisor.admin@demo.com → learning-planet (<uuid>)
    ✓ franchisor.mgmt@demo.com → learning-planet (<uuid>)
    ✓ coach@demo.com → learning-planet (<uuid>)
    ✓ franchisee.admin@demo.com → maple-leaf (<uuid>)
    ✓ franchisee.mgmt@demo.com → maple-leaf (<uuid>)

  Done.
  ```

- [ ] **Step 4: Verify profiles updated**

  Use `mcp__supabase__execute_sql`:
  ```sql
  select p.email, p.ownership_id, o.slug
  from public.profiles p
  left join public.ownerships o on o.id = p.ownership_id
  order by p.email;
  ```

  Expected: 5 users linked to an ownership, `parent@demo.com` has `ownership_id = null`.

- [ ] **Step 5: Commit**

  ```bash
  git add scripts/seed-ownerships.ts package.json
  git commit -m "feat(ownerships): add seed script for demo ownerships and user linkage"
  ```

---

## Task 3: Data Access Layer + Tests

**Files:**
- Create: `lib/db/ownerships.ts`
- Create: `lib/db/ownerships.test.ts`

- [ ] **Step 1: Write failing tests in `lib/db/ownerships.test.ts`**

  ```typescript
  import { describe, it, expect, vi, beforeEach } from 'vitest'
  import { listOwnerships, getOwnership } from './ownerships'
  import type { SessionUser } from '@/lib/auth/types'

  const FA_SESSION: SessionUser = {
    id: 'user-1',
    email: 'fa@demo.com',
    role: 'franchisor_admin',
    ownershipId: 'own-tlp',
    fullName: 'FA User',
    mustChangePassword: false,
  }

  const XA_SESSION: SessionUser = {
    id: 'user-2',
    email: 'xa@demo.com',
    role: 'franchisee_admin',
    ownershipId: 'own-mla',
    fullName: 'XA User',
    mustChangePassword: false,
  }

  function makeMockSupabase(rows: unknown[]) {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: rows[0] ?? null, error: null }),
      then: undefined as unknown,
    }
    // make the chain thenable so await works
    chain.then = (resolve: (v: { data: unknown[]; error: null }) => void) =>
      resolve({ data: rows, error: null })

    return {
      from: vi.fn().mockReturnValue(chain),
      _chain: chain,
    }
  }

  describe('listOwnerships', () => {
    it('franchisor_admin: queries without ownership filter', async () => {
      const supabase = makeMockSupabase([{ id: 'own-tlp' }, { id: 'own-mla' }])
      const result = await listOwnerships(supabase as never, FA_SESSION)
      expect(supabase.from).toHaveBeenCalledWith('ownerships')
      // eq() should NOT have been called (no scoping filter for FA)
      expect(supabase._chain.eq).not.toHaveBeenCalled()
      expect(result).toHaveLength(2)
    })

    it('franchisee_admin: queries with own ownership_id filter', async () => {
      const supabase = makeMockSupabase([{ id: 'own-mla' }])
      const result = await listOwnerships(supabase as never, XA_SESSION)
      expect(supabase._chain.eq).toHaveBeenCalledWith('id', 'own-mla')
      expect(result).toHaveLength(1)
    })
  })

  describe('getOwnership', () => {
    it('franchisor_admin: can fetch any ownership by id', async () => {
      const supabase = makeMockSupabase([{ id: 'own-mla', full_name: 'MLA' }])
      const result = await getOwnership(supabase as never, 'own-mla', FA_SESSION)
      expect(result).not.toBeNull()
      expect(result?.id).toBe('own-mla')
    })

    it('franchisee_admin: returns null for ownership they do not belong to', async () => {
      const supabase = makeMockSupabase([{ id: 'own-tlp', full_name: 'TLP' }])
      const result = await getOwnership(supabase as never, 'own-tlp', XA_SESSION)
      expect(result).toBeNull()
    })

    it('franchisee_admin: can fetch their own ownership', async () => {
      const supabase = makeMockSupabase([{ id: 'own-mla', full_name: 'MLA' }])
      const result = await getOwnership(supabase as never, 'own-mla', XA_SESSION)
      expect(result?.id).toBe('own-mla')
    })
  })
  ```

- [ ] **Step 2: Run tests — verify they fail**

  ```bash
  npm test -- lib/db/ownerships.test.ts
  ```

  Expected: `FAIL` — `./ownerships` module not found.

- [ ] **Step 3: Create `lib/db/ownerships.ts`**

  ```typescript
  import type { SupabaseClient } from '@supabase/supabase-js'
  import type { SessionUser } from '@/lib/auth/types'

  export interface OwnershipRow {
    id: string
    full_name: string
    email: string
    ownership_type: 'corporate' | 'franchisee'
    slug: string
    logo_url: string | null
    brand_primary: string
    brand_accent: string
    tagline: string | null
    is_active: boolean
    created_at: string
    updated_at: string
  }

  const FRANCHISOR_ROLES = new Set(['franchisor_admin', 'franchisor_mgmt'])

  function isGlobalRole(session: SessionUser): boolean {
    return FRANCHISOR_ROLES.has(session.role)
  }

  export async function listOwnerships(
    supabase: SupabaseClient,
    session: SessionUser,
  ): Promise<OwnershipRow[]> {
    let query = supabase.from('ownerships').select('*')
    if (!isGlobalRole(session)) {
      query = query.eq('id', session.ownershipId ?? '')
    }
    const { data, error } = await query
    if (error) throw error
    return (data ?? []) as OwnershipRow[]
  }

  export async function getOwnership(
    supabase: SupabaseClient,
    id: string,
    session: SessionUser,
  ): Promise<OwnershipRow | null> {
    // Scoped roles can only read their own ownership
    if (!isGlobalRole(session) && session.ownershipId !== id) return null

    const { data, error } = await supabase
      .from('ownerships')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data as OwnershipRow
  }

  export async function createOwnership(
    supabase: SupabaseClient,
    input: Pick<OwnershipRow, 'full_name' | 'email' | 'ownership_type' | 'slug' | 'brand_primary' | 'brand_accent'> &
      Partial<Pick<OwnershipRow, 'logo_url' | 'tagline'>>,
  ): Promise<OwnershipRow> {
    const { data, error } = await supabase
      .from('ownerships')
      .insert(input)
      .select()
      .single()
    if (error) throw error
    return data as OwnershipRow
  }

  export async function updateOwnership(
    supabase: SupabaseClient,
    id: string,
    patch: Partial<Omit<OwnershipRow, 'id' | 'created_at'>>,
  ): Promise<OwnershipRow> {
    const { data, error } = await supabase
      .from('ownerships')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data as OwnershipRow
  }
  ```

- [ ] **Step 4: Run tests — verify they pass**

  ```bash
  npm test -- lib/db/ownerships.test.ts
  ```

  Expected: 5 tests pass.

- [ ] **Step 5: Commit**

  ```bash
  git add lib/db/
  git commit -m "feat(ownerships): add data access layer with scoping logic and tests"
  ```

---

## Task 4: API Routes

**Files:**
- Create: `app/api/ownerships/route.ts`
- Create: `app/api/ownerships/[id]/route.ts`
- Create: `app/api/public/ownerships/route.ts`

- [ ] **Step 1: Create `app/api/ownerships/route.ts`**

  ```typescript
  import { NextResponse, type NextRequest } from 'next/server'
  import { createClient } from '@/lib/supabase/server'
  import { createAdminClient } from '@/lib/supabase/admin'
  import { getSession } from '@/lib/auth/session'
  import { listOwnerships, createOwnership } from '@/lib/db/ownerships'

  export async function GET() {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createClient()
    const ownerships = await listOwnerships(supabase, session)
    return NextResponse.json(ownerships)
  }

  export async function POST(request: NextRequest) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'franchisor_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    if (!body?.fullName || !body?.email || !body?.ownershipType || !body?.slug) {
      return NextResponse.json({ error: 'Missing required fields: fullName, email, ownershipType, slug' }, { status: 400 })
    }

    const supabase = await createClient()
    const ownership = await createOwnership(supabase, {
      full_name: body.fullName,
      email: body.email,
      ownership_type: body.ownershipType,
      slug: body.slug,
      brand_primary: body.brandPrimary ?? '#0a9b8a',
      brand_accent: body.brandAccent ?? '#e67e22',
      logo_url: body.logoUrl ?? null,
      tagline: body.tagline ?? null,
    })

    // Invite management account
    if (body.mgmtEmail) {
      const admin = createAdminClient()
      await admin.auth.admin.inviteUserByEmail(body.mgmtEmail, {
        data: {
          role: 'franchisee_mgmt',
          ownership_id: ownership.id,
          must_change_password: true,
        },
      })
    }

    return NextResponse.json(ownership, { status: 201 })
  }
  ```

- [ ] **Step 2: Create `app/api/ownerships/[id]/route.ts`**

  ```typescript
  import { NextResponse, type NextRequest } from 'next/server'
  import { createClient } from '@/lib/supabase/server'
  import { getSession } from '@/lib/auth/session'
  import { getOwnership, updateOwnership } from '@/lib/db/ownerships'

  export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const supabase = await createClient()
    const ownership = await getOwnership(supabase, id, session)
    if (!ownership) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(ownership)
  }

  export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ) {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (session.role !== 'franchisor_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    const supabase = await createClient()
    const ownership = await updateOwnership(supabase, id, {
      full_name: body.fullName,
      email: body.email,
      slug: body.slug,
      brand_primary: body.brandPrimary,
      brand_accent: body.brandAccent,
      logo_url: body.logoUrl,
      tagline: body.tagline,
      is_active: body.isActive,
    })

    return NextResponse.json(ownership)
  }
  ```

- [ ] **Step 3: Create `app/api/public/ownerships/route.ts`**

  Used by the storefront page — no auth required, returns branding fields only (no email).

  ```typescript
  import { NextResponse, type NextRequest } from 'next/server'
  import { createClient } from '@/lib/supabase/server'

  export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get('slug')
    if (!slug) return NextResponse.json({ error: 'slug is required' }, { status: 400 })

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('ownerships')
      .select('id, full_name, ownership_type, slug, logo_url, brand_primary, brand_accent, tagline')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  }
  ```

- [ ] **Step 4: Add `/api/public/ownerships` to public paths in proxy**

  Open `proxy.ts` and update `PUBLIC_PREFIXES` in `lib/auth/routing.ts`:

  ```typescript
  // lib/auth/routing.ts — add to PUBLIC_PREFIXES array
  const PUBLIC_PREFIXES = ['/t/', '/api/auth/login', '/api/public/']
  ```

- [ ] **Step 5: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 6: Commit**

  ```bash
  git add app/api/ownerships/ app/api/public/ lib/auth/routing.ts
  git commit -m "feat(ownerships): add CRUD API routes and public storefront endpoint"
  ```

---

## Task 5: Update App Layout

**Files:**
- Modify: `app/(app)/layout.tsx`

Replace `TENANT_BY_ID` mock lookup with a real DB query.

- [ ] **Step 1: Update `app/(app)/layout.tsx`**

  Replace the existing file content:

  ```typescript
  import { redirect } from 'next/navigation'
  import { type ReactNode } from 'react'
  import { getSession } from '@/lib/auth/session'
  import { createClient } from '@/lib/supabase/server'
  import { getOwnership } from '@/lib/db/ownerships'
  import { AppShell } from '@/components/layout/AppShell'
  import { navForRole, roleLabelFor } from '@/lib/auth/nav'

  export default async function AppLayout({ children }: { children: ReactNode }) {
    const session = await getSession()
    if (!session) redirect('/login')

    let tenantName: string | undefined
    if (session.ownershipId) {
      const supabase = await createClient()
      const ownership = await getOwnership(supabase, session.ownershipId, session)
      tenantName = ownership?.full_name
    }

    return (
      <AppShell
        navItems={navForRole(session.role)}
        topBar={{
          productName: 'Mentora',
          tenantName,
          roleLabel: roleLabelFor(session.role),
          userName: session.fullName,
        }}
      >
        {children}
      </AppShell>
    )
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add "app/(app)/layout.tsx"
  git commit -m "feat(ownerships): replace mock tenant lookup with DB query in app layout"
  ```

---

## Task 6: Update Public Storefront

**Files:**
- Modify: `app/t/[tenant]/page.tsx`

Replace `TENANT_BY_SLUG` mock with a call to the public API.

- [ ] **Step 1: Read current `app/t/[tenant]/page.tsx`**

  ```bash
  cat app/t/\[tenant\]/page.tsx
  ```

- [ ] **Step 2: Replace mock lookup with API call**

  Find the section that reads `TENANT_BY_SLUG[params.tenant]` and replace with:

  ```typescript
  // At the top of the Server Component function, before the JSX:
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/public/ownerships?slug=${params.tenant}`,
    { next: { revalidate: 60 } },
  )
  if (!res.ok) notFound()
  const tenant = await res.json()
  ```

  Replace all uses of the mock `tenant` object with the API response fields:
  - `tenant.fullName` → `tenant.full_name`
  - `tenant.brandPrimary` → `tenant.brand_primary`
  - `tenant.brandAccent` → `tenant.brand_accent`
  - `tenant.ownershipType` → `tenant.ownership_type`

- [ ] **Step 3: Add `NEXT_PUBLIC_SITE_URL` to `.env.local` and `.env.example`**

  `.env.local`:
  ```
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```

  `.env.example`:
  ```
  NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
  ```

- [ ] **Step 4: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 5: Commit**

  ```bash
  git add "app/t/[tenant]/page.tsx" .env.example
  git commit -m "feat(ownerships): replace storefront mock with public API call"
  ```

---

## Task 7: End-to-End Smoke Test

Manual verification — run the dev server and test all flows.

- [ ] **Step 1: Start the dev server**

  ```bash
  npm run dev
  ```

- [ ] **Step 2: Test app layout shows real tenant name**

  Log in as `franchisor.admin@demo.com`. Check the TopBar shows "The Learning Planet" (from DB, not mock).

  Log in as `franchisee.admin@demo.com`. Check the TopBar shows "Maple Leaf Academy".

  Log in as `parent@demo.com`. Check TopBar shows no tenant name (null ownership).

- [ ] **Step 3: Test `GET /api/ownerships`**

  While logged in as `franchisor.admin@demo.com`:
  ```javascript
  fetch('/api/ownerships').then(r => r.json()).then(console.log)
  ```
  Expected: array of 2 ownerships.

  While logged in as `franchisee.admin@demo.com`:
  ```javascript
  fetch('/api/ownerships').then(r => r.json()).then(console.log)
  ```
  Expected: array of 1 ownership (MLA only).

- [ ] **Step 4: Test `GET /api/ownerships/:id`**

  While logged in as `franchisee.admin@demo.com`, try fetching the TLP ownership ID:
  ```javascript
  fetch('/api/ownerships/<tlp-uuid>').then(r => r.status)
  ```
  Expected: `404`.

- [ ] **Step 5: Test public storefront**

  Navigate to `http://localhost:3000/t/learning-planet`. Expected: page loads with TLP branding (purple).
  Navigate to `http://localhost:3000/t/maple-leaf`. Expected: page loads with MLA branding (teal).
  Navigate to `http://localhost:3000/t/unknown-slug`. Expected: 404 page.

- [ ] **Step 6: Test `GET /api/public/ownerships?slug=learning-planet`**

  Without authentication:
  ```bash
  curl http://localhost:3000/api/public/ownerships?slug=learning-planet
  ```
  Expected: JSON with `full_name`, `brand_primary`, `brand_accent` — no `email` field.

- [ ] **Step 7: Final commit**

  ```bash
  git add -A
  git commit -m "feat(ownerships): Module 2 complete — ownerships table, CRUD API, seeded demo data"
  ```

---

## Self-Review Notes

- **Spec coverage:** ownerships table ✓ · RLS policies ✓ · FK on profiles ✓ · GET list (scoped) ✓ · GET single (scoped) ✓ · POST create + mgmt invite ✓ · PATCH update ✓ · public endpoint ✓ · seed script ✓ · app layout DB query ✓ · storefront DB query ✓
- **Scoping rule:** franchisor roles (FA, FM) get all rows; all other roles get their own `ownership_id` only. Applied in `listOwnerships` + `getOwnership` in the data access layer.
- **Type consistency:** `OwnershipRow` (snake_case DB fields) defined in `lib/db/ownerships.ts`. API routes receive camelCase JSON bodies and map to snake_case before passing to DB functions.
- **Mock retirement:** `TENANT_BY_ID` and `TENANT_BY_SLUG` no longer used in layout or storefront after this module. `lib/mock/tenants.ts` can be deleted once Module 3 (Locations) no longer references it.
- **`parent@demo.com` edge case:** has `ownershipId = null`; layout guards with `if (session.ownershipId)` before querying — no DB call.
