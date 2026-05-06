# Module 1 — Auth & Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace mock auth with real Supabase Auth — sessions, JWT role claims, middleware route protection, and seeded demo accounts.

**Architecture:** Supabase Auth handles identity and sessions. `role` + `ownership_id` + `must_change_password` are stored in `app_metadata` so the Next.js middleware can enforce routing from the JWT alone (no DB query in the hot path). `@supabase/ssr` manages cookie refresh. Server Components call `getSession()` which adds a single profiles query for `full_name`.

**Tech Stack:** Next.js 16.2.2 App Router · `@supabase/ssr` 0.10 · `@supabase/supabase-js` 2.x · Vitest 3.x · TypeScript 5

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `.env.local` | Modify | Add `SUPABASE_SERVICE_ROLE_KEY` |
| `.env.example` | Modify | Document new env var |
| `supabase/migrations/001_profiles.sql` | Create | profiles table + DB trigger |
| `vitest.config.ts` | Create | Vitest config with `@/*` path alias |
| `lib/supabase/server.ts` | Create | SSR Supabase client (Server Components, Actions, Route Handlers) |
| `lib/supabase/client.ts` | Create | Browser Supabase client (Client Components) |
| `lib/supabase/admin.ts` | Create | Service-role client (admin ops only, never in browser) |
| `lib/auth/routing.ts` | Create | Pure functions: role→prefix, role→landing, `isPublicPath` — used by middleware |
| `lib/auth/nav.ts` | Create | Nav item arrays per role + `navForRole()`, `roleLabelFor()` — used by layout |
| `lib/auth/session.ts` | Create | `getSession()` helper for Server Components |
| `lib/auth/types.ts` | Create | `SessionUser` interface |
| `middleware.ts` | Create | Root middleware: session refresh + role-based routing |
| `app/actions/auth.ts` | Create | `loginAction`, `logoutAction`, `changePasswordAction` (Server Actions) |
| `app/change-password/page.tsx` | Create | Force-password-change page (shown when `must_change_password = true`) |
| `app/api/auth/me/route.ts` | Create | GET current user profile |
| `app/api/auth/logout/route.ts` | Create | POST sign out |
| `app/api/auth/change-password/route.ts` | Create | POST change password |
| `app/api/auth/2fa/verify/route.ts` | Create | POST stub — 501 |
| `app/login/page.tsx` | Modify | Use `loginAction` Server Action instead of `resolveDemoLogin` |
| `app/(app)/layout.tsx` | Modify | Server Component; reads session instead of deriving role from pathname |
| `scripts/seed-auth.ts` | Create | Idempotent seed: creates 6 demo Supabase users |

---

## Task 1: Environment + Database Migration

**Files:**
- Modify: `.env.local`
- Modify: `.env.example`
- Create: `supabase/migrations/001_profiles.sql`

- [ ] **Step 1: Add service role key to `.env.local`**

  Get the service role key from the Supabase dashboard → Project Settings → API → `service_role` key (secret). Add to `.env.local`:

  ```
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-secret>
  ```

- [ ] **Step 2: Document in `.env.example`**

  Open `.env.example` and add after the existing vars:

  ```
  SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
  ```

- [ ] **Step 3: Create the migration file**

  Create `supabase/migrations/001_profiles.sql`:

  ```sql
  -- profiles extends auth.users with app-specific identity fields
  create table if not exists public.profiles (
    id               uuid primary key references auth.users(id) on delete cascade,
    role             text not null,
    ownership_id     text,
    full_name        text not null default '',
    must_change_password boolean not null default false,
    created_at       timestamptz not null default now()
  );

  -- Row-level security: users can read their own profile; service role bypasses
  alter table public.profiles enable row level security;

  create policy "Users can read own profile"
    on public.profiles for select
    using (auth.uid() = id);

  -- Auto-create profile row when a new auth.users row is inserted.
  -- Reads role, ownership_id, full_name, must_change_password from app_metadata.
  create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer set search_path = public
  as $$
  begin
    insert into public.profiles (id, role, ownership_id, full_name, must_change_password)
    values (
      new.id,
      new.raw_app_meta_data->>'role',
      new.raw_app_meta_data->>'ownership_id',
      coalesce(new.raw_app_meta_data->>'full_name', new.raw_user_meta_data->>'full_name', ''),
      coalesce((new.raw_app_meta_data->>'must_change_password')::boolean, false)
    )
    on conflict (id) do nothing;
    return new;
  end;
  $$;

  drop trigger if exists on_auth_user_created on auth.users;
  create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
  ```

- [ ] **Step 4: Apply the migration via Supabase MCP**

  Use the `mcp__supabase__apply_migration` tool with:
  - `name`: `"001_profiles"`
  - `query`: the full SQL from Step 3

- [ ] **Step 5: Verify migration applied**

  Use `mcp__supabase__list_tables` and confirm `profiles` appears in the results.

- [ ] **Step 6: Commit**

  ```bash
  git add supabase/migrations/001_profiles.sql .env.example
  git commit -m "feat(auth): add profiles table migration and DB trigger"
  ```

---

## Task 2: Vitest Setup

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json` (add dev deps + test script)

- [ ] **Step 1: Install Vitest**

  ```bash
  npm install -D vitest @vitejs/plugin-react vite-tsconfig-paths
  ```

  Expected: packages added to `devDependencies`.

- [ ] **Step 2: Create `vitest.config.ts`**

  ```typescript
  import { defineConfig } from 'vitest/config'
  import tsconfigPaths from 'vite-tsconfig-paths'

  export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
      environment: 'node',
      include: ['**/*.test.ts', '**/*.test.tsx'],
      exclude: ['node_modules', '.next'],
    },
  })
  ```

- [ ] **Step 3: Add test script to `package.json`**

  Open `package.json` and add to `"scripts"`:

  ```json
  "test": "vitest run",
  "test:watch": "vitest"
  ```

- [ ] **Step 4: Verify Vitest runs**

  ```bash
  npm test
  ```

  Expected: `No test files found` (0 test suites, 0 tests) — no error.

- [ ] **Step 5: Commit**

  ```bash
  git add vitest.config.ts package.json package-lock.json
  git commit -m "chore: add Vitest test runner"
  ```

---

## Task 3: Supabase Client Setup

**Files:**
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/admin.ts`

- [ ] **Step 1: Read the Next.js App Router auth guide**

  ```bash
  cat node_modules/next/dist/docs/01-app/02-guides/authentication.md | head -60
  ```

  Note any breaking changes vs. Next.js 14/15 patterns before proceeding.

- [ ] **Step 2: Create `lib/supabase/server.ts`**

  ```typescript
  import { createServerClient } from '@supabase/ssr'
  import { cookies } from 'next/headers'

  export async function createClient() {
    const cookieStore = await cookies()

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              )
            } catch {
              // Called from Server Component — middleware handles refresh
            }
          },
        },
      },
    )
  }
  ```

- [ ] **Step 3: Create `lib/supabase/client.ts`**

  ```typescript
  import { createBrowserClient } from '@supabase/ssr'

  export function createClient() {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
  ```

- [ ] **Step 4: Create `lib/supabase/admin.ts`**

  ```typescript
  import { createClient } from '@supabase/supabase-js'

  export function createAdminClient() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
    }
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
  }
  ```

- [ ] **Step 5: Commit**

  ```bash
  git add lib/supabase/
  git commit -m "feat(auth): add Supabase SSR, browser, and admin clients"
  ```

---

## Task 4: Auth Routing + Nav (Pure Functions + Tests)

**Files:**
- Create: `lib/auth/types.ts`
- Create: `lib/auth/routing.ts`
- Create: `lib/auth/routing.test.ts`
- Create: `lib/auth/nav.ts`

- [ ] **Step 1: Create `lib/auth/types.ts`**

  ```typescript
  import type { Role } from '@/lib/types'

  export interface SessionUser {
    id: string
    email: string
    role: Role
    ownershipId: string | null
    fullName: string
    mustChangePassword: boolean
  }
  ```

- [ ] **Step 2: Write failing tests in `lib/auth/routing.test.ts`**

  ```typescript
  import { describe, it, expect } from 'vitest'
  import {
    getAllowedPrefixForRole,
    getLandingForRole,
    isPublicPath,
    getRoleFromPath,
  } from './routing'

  describe('getAllowedPrefixForRole', () => {
    it('maps franchisor_admin to /admin', () => {
      expect(getAllowedPrefixForRole('franchisor_admin')).toBe('/admin')
    })
    it('maps franchisor_management to /management', () => {
      expect(getAllowedPrefixForRole('franchisor_management')).toBe('/management')
    })
    it('maps franchisee_admin to /franchisee-admin', () => {
      expect(getAllowedPrefixForRole('franchisee_admin')).toBe('/franchisee-admin')
    })
    it('maps franchisee_management to /management', () => {
      expect(getAllowedPrefixForRole('franchisee_management')).toBe('/management')
    })
    it('maps coach to /coach', () => {
      expect(getAllowedPrefixForRole('coach')).toBe('/coach')
    })
    it('maps customer to /customer', () => {
      expect(getAllowedPrefixForRole('customer')).toBe('/customer')
    })
  })

  describe('getLandingForRole', () => {
    it('returns /admin/dashboard for franchisor_admin', () => {
      expect(getLandingForRole('franchisor_admin')).toBe('/admin/dashboard')
    })
    it('returns /management/dashboard for franchisor_management', () => {
      expect(getLandingForRole('franchisor_management')).toBe('/management/dashboard')
    })
    it('returns /franchisee-admin/dashboard for franchisee_admin', () => {
      expect(getLandingForRole('franchisee_admin')).toBe('/franchisee-admin/dashboard')
    })
    it('returns /management/dashboard for franchisee_management', () => {
      expect(getLandingForRole('franchisee_management')).toBe('/management/dashboard')
    })
    it('returns /coach/dashboard for coach', () => {
      expect(getLandingForRole('coach')).toBe('/coach/dashboard')
    })
    it('returns /customer/dashboard for customer', () => {
      expect(getLandingForRole('customer')).toBe('/customer/dashboard')
    })
  })

  describe('isPublicPath', () => {
    it('allows /', () => expect(isPublicPath('/')).toBe(true))
    it('allows /login', () => expect(isPublicPath('/login')).toBe(true))
    it('allows /t/learning-planet', () => expect(isPublicPath('/t/learning-planet')).toBe(true))
    it('allows /api/auth/login', () => expect(isPublicPath('/api/auth/login')).toBe(true))
    it('blocks /admin/dashboard', () => expect(isPublicPath('/admin/dashboard')).toBe(false))
    it('blocks /customer/dashboard', () => expect(isPublicPath('/customer/dashboard')).toBe(false))
    it('blocks /api/auth/me', () => expect(isPublicPath('/api/auth/me')).toBe(false))
  })

  describe('getRoleFromPath', () => {
    it('returns franchisor_admin for /admin/anything', () => {
      expect(getRoleFromPath('/admin/dashboard')).toBe('franchisor_admin')
    })
    it('returns coach for /coach/students', () => {
      expect(getRoleFromPath('/coach/students')).toBe('coach')
    })
    it('returns null for unknown prefix', () => {
      expect(getRoleFromPath('/unknown')).toBeNull()
    })
  })
  ```

- [ ] **Step 3: Run tests — verify they fail**

  ```bash
  npm test -- lib/auth/routing.test.ts
  ```

  Expected: `FAIL` — `routing` module not found.

- [ ] **Step 4: Create `lib/auth/routing.ts`**

  ```typescript
  import type { Role } from '@/lib/types'

  const ROLE_PREFIX: Record<Role, string> = {
    franchisor_admin:      '/admin',
    franchisor_management: '/management',
    franchisee_admin:      '/franchisee-admin',
    franchisee_management: '/management',
    coach:                 '/coach',
    customer:              '/customer',
  }

  const ROLE_LANDING: Record<Role, string> = {
    franchisor_admin:      '/admin/dashboard',
    franchisor_management: '/management/dashboard',
    franchisee_admin:      '/franchisee-admin/dashboard',
    franchisee_management: '/management/dashboard',
    coach:                 '/coach/dashboard',
    customer:              '/customer/dashboard',
  }

  const PUBLIC_PATHS = ['/', '/login']
  const PUBLIC_PREFIXES = ['/t/', '/api/auth/login']

  export function getAllowedPrefixForRole(role: Role): string {
    return ROLE_PREFIX[role]
  }

  export function getLandingForRole(role: Role): string {
    return ROLE_LANDING[role]
  }

  export function isPublicPath(pathname: string): boolean {
    if (PUBLIC_PATHS.includes(pathname)) return true
    return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  }

  export function getRoleFromPath(pathname: string): Role | null {
    for (const [role, prefix] of Object.entries(ROLE_PREFIX) as [Role, string][]) {
      if (pathname.startsWith(prefix)) return role
    }
    return null
  }
  ```

- [ ] **Step 5: Run tests — verify they pass**

  ```bash
  npm test -- lib/auth/routing.test.ts
  ```

  Expected: all 16 tests pass.

- [ ] **Step 6: Create `lib/auth/nav.ts`**

  Move the nav arrays out of `app/(app)/layout.tsx` into this file (they will be deleted from layout in Task 10):

  ```typescript
  import type { Role } from '@/lib/types'
  import type { NavItem } from '@/components/layout/Sidebar'

  const CUSTOMER_NAV: NavItem[] = [
    { kind: 'link', id: 'dashboard', label: 'Dashboard', href: '/customer/dashboard', icon: '🏠' },
    { kind: 'link', id: 'members', label: 'My Members', href: '/customer/members', icon: '👨‍👧' },
    { kind: 'link', id: 'enroll', label: 'Enroll', href: '/customer/enroll', icon: '📋' },
    { kind: 'link', id: 'lms', label: 'Learning Portal', href: '/customer/lms', icon: '📚' },
    { kind: 'link', id: 'events', label: 'Events & Camps', href: '/customer/events', icon: '🎉' },
    { kind: 'divider', id: 'd1' },
    { kind: 'link', id: 'payments', label: 'Payments', href: '/customer/payments', icon: '💳' },
    { kind: 'link', id: 'notifications', label: 'Notifications', href: '/customer/notifications', icon: '🔔' },
    { kind: 'link', id: 'settings', label: 'Settings', href: '/customer/settings', icon: '⚙️' },
  ]

  const COACH_NAV: NavItem[] = [
    { kind: 'link', id: 'dashboard', label: 'Dashboard', href: '/coach/dashboard', icon: '🏠' },
    { kind: 'link', id: 'sessions', label: 'Sessions', href: '/coach/sessions', icon: '📅' },
    { kind: 'link', id: 'students', label: 'Students', href: '/coach/students', icon: '👥' },
    { kind: 'link', id: 'achievements', label: 'Achievements', href: '/coach/achievements', icon: '🏆' },
    { kind: 'link', id: 'lms', label: 'LMS Authoring', href: '/coach/lms', icon: '✏️' },
    { kind: 'divider', id: 'd1' },
    { kind: 'link', id: 'availability', label: 'Availability', href: '/coach/availability', icon: '🗓️' },
  ]

  const ADMIN_NAV: NavItem[] = [
    { kind: 'link', id: 'dashboard', label: 'Dashboard', href: '/admin/dashboard', icon: '🏠' },
    { kind: 'link', id: 'locations', label: 'Locations', href: '/admin/locations', icon: '📍' },
    { kind: 'link', id: 'coaches', label: 'Coaches', href: '/admin/coaches', icon: '👤' },
    { kind: 'link', id: 'customers', label: 'Customers', href: '/admin/customers', icon: '👥' },
    { kind: 'link', id: 'roster', label: 'Roster', href: '/admin/roster', icon: '📋' },
    { kind: 'divider', id: 'd1' },
    { kind: 'link', id: 'events', label: 'Events & Camps', href: '/admin/events', icon: '🎉' },
    { kind: 'link', id: 'payments', label: 'Payments', href: '/admin/payments', icon: '💳' },
    { kind: 'link', id: 'discounts', label: 'Discounts', href: '/admin/discounts', icon: '🏷️' },
    { kind: 'link', id: 'holidays', label: 'Holidays', href: '/admin/holidays', icon: '🗓️' },
    { kind: 'link', id: 'tickets', label: 'Tickets', href: '/admin/tickets', icon: '🎫' },
    { kind: 'link', id: 'planets', label: 'Planets', href: '/admin/planets', icon: '🪐' },
  ]

  const FRANCHISEE_ADMIN_NAV: NavItem[] = [
    { kind: 'link', id: 'dashboard', label: 'Dashboard', href: '/franchisee-admin/dashboard', icon: '🏠' },
    { kind: 'link', id: 'locations', label: 'Locations', href: '/franchisee-admin/locations', icon: '📍' },
    { kind: 'link', id: 'coaches', label: 'Coaches', href: '/franchisee-admin/coaches', icon: '👤' },
    { kind: 'link', id: 'customers', label: 'Customers', href: '/franchisee-admin/customers', icon: '👥' },
    { kind: 'link', id: 'roster', label: 'Roster', href: '/franchisee-admin/roster', icon: '📋' },
    { kind: 'divider', id: 'd1' },
    { kind: 'link', id: 'holidays', label: 'Holidays', href: '/franchisee-admin/holidays', icon: '🗓️' },
    { kind: 'link', id: 'price-requests', label: 'Price Requests', href: '/franchisee-admin/price-requests', icon: '💸' },
    { kind: 'link', id: 'tickets', label: 'Tickets', href: '/franchisee-admin/tickets', icon: '🎫' },
  ]

  const MANAGEMENT_NAV: NavItem[] = [
    { kind: 'link', id: 'dashboard', label: 'Dashboard', href: '/management/dashboard', icon: '🏠' },
    { kind: 'link', id: 'revenue', label: 'Revenue', href: '/management/revenue', icon: '📈' },
    { kind: 'link', id: 'pricing', label: 'Pricing', href: '/management/pricing', icon: '💸' },
    { kind: 'link', id: 'locations', label: 'Locations', href: '/management/locations', icon: '📍' },
    { kind: 'link', id: 'reports', label: 'Reports', href: '/management/reports', icon: '📊' },
  ]

  export function navForRole(role: Role): NavItem[] {
    switch (role) {
      case 'customer':              return CUSTOMER_NAV
      case 'coach':                 return COACH_NAV
      case 'franchisor_admin':      return ADMIN_NAV
      case 'franchisee_admin':      return FRANCHISEE_ADMIN_NAV
      case 'franchisor_management':
      case 'franchisee_management': return MANAGEMENT_NAV
    }
  }

  export function roleLabelFor(role: Role): string {
    switch (role) {
      case 'customer':              return 'Customer'
      case 'coach':                 return 'Coach'
      case 'franchisor_admin':      return 'Franchisor Admin'
      case 'franchisee_admin':      return 'Franchisee Admin'
      case 'franchisor_management': return 'Management'
      case 'franchisee_management': return 'Management'
    }
  }
  ```

- [ ] **Step 7: Commit**

  ```bash
  git add lib/auth/
  git commit -m "feat(auth): add routing pure functions, nav helpers, SessionUser type, and tests"
  ```

---

## Task 5: Session Helper

**Files:**
- Create: `lib/auth/session.ts`

- [ ] **Step 1: Create `lib/auth/session.ts`**

  ```typescript
  import { createClient } from '@/lib/supabase/server'
  import type { Role } from '@/lib/types'
  import type { SessionUser } from '@/lib/auth/types'

  export async function getSession(): Promise<SessionUser | null> {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null

    const meta = user.app_metadata as {
      role?: string
      ownership_id?: string
      must_change_password?: boolean
    }

    if (!meta.role) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, must_change_password')
      .eq('id', user.id)
      .single()

    return {
      id: user.id,
      email: user.email ?? '',
      role: meta.role as Role,
      ownershipId: meta.ownership_id ?? null,
      fullName: profile?.full_name ?? '',
      mustChangePassword: profile?.must_change_password ?? meta.must_change_password ?? false,
    }
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add lib/auth/session.ts
  git commit -m "feat(auth): add getSession helper for Server Components"
  ```

---

## Task 6: Middleware

**Files:**
- Create: `middleware.ts` (root of project, next to `package.json`)

- [ ] **Step 1: Read the Next.js middleware docs**

  ```bash
  cat node_modules/next/dist/docs/01-app/03-api-reference/file-conventions/middleware.md 2>/dev/null | head -80 || cat node_modules/next/dist/docs/01-app/02-guides/authentication.md | grep -A 40 "middleware"
  ```

  Note any breaking changes in middleware API for this Next.js version.

- [ ] **Step 2: Create `middleware.ts`**

  ```typescript
  import { createServerClient } from '@supabase/ssr'
  import { NextResponse, type NextRequest } from 'next/server'
  import { isPublicPath, getAllowedPrefixForRole, getLandingForRole } from '@/lib/auth/routing'
  import type { Role } from '@/lib/types'

  export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Skip Next.js internals and static files
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js)$/)
    ) {
      return NextResponse.next()
    }

    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options),
            )
          },
        },
      },
    )

    // IMPORTANT: use getUser() not getSession() — getUser() validates the JWT server-side
    const { data: { user } } = await supabase.auth.getUser()

    // Public paths — always allow through (after session refresh)
    if (isPublicPath(pathname)) {
      // If logged-in user hits /login, redirect to their landing
      if (pathname === '/login' && user) {
        const role = user.app_metadata?.role as Role | undefined
        if (role) {
          return NextResponse.redirect(new URL(getLandingForRole(role), request.url))
        }
      }
      return supabaseResponse
    }

    // Protected path — no session: redirect to /login
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', pathname)
      return NextResponse.redirect(loginUrl)
    }

    const role = user.app_metadata?.role as Role | undefined
    const mustChangePassword = user.app_metadata?.must_change_password as boolean | undefined

    // Force password change before any other protected route
    if (mustChangePassword && pathname !== '/change-password') {
      return NextResponse.redirect(new URL('/change-password', request.url))
    }

    // Wrong role prefix — redirect to correct landing
    if (role) {
      const allowed = getAllowedPrefixForRole(role)
      if (!pathname.startsWith(allowed) && pathname !== '/change-password') {
        return NextResponse.redirect(new URL(getLandingForRole(role), request.url))
      }
    }

    return supabaseResponse
  }

  export const config = {
    matcher: [
      '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
  }
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add middleware.ts
  git commit -m "feat(auth): add Next.js middleware for session refresh and role-based routing"
  ```

---

## Task 7: Server Actions

**Files:**
- Create: `app/actions/auth.ts`

- [ ] **Step 1: Create `app/actions/auth.ts`**

  ```typescript
  'use server'

  import { redirect } from 'next/navigation'
  import { createClient } from '@/lib/supabase/server'
  import { createAdminClient } from '@/lib/supabase/admin'
  import { getLandingForRole } from '@/lib/auth/routing'
  import type { Role } from '@/lib/types'

  export async function loginAction(
    formData: FormData,
  ): Promise<{ error: string } | never> {
    const email = (formData.get('email') as string | null)?.trim() ?? ''
    const password = (formData.get('password') as string | null) ?? ''
    const next = formData.get('next') as string | null

    if (!email || !password) {
      return { error: 'Email and password are required.' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      return { error: error?.message ?? 'Login failed.' }
    }

    const role = data.user.app_metadata?.role as Role | undefined
    if (!role) {
      return { error: 'Account has no role assigned. Contact your administrator.' }
    }

    redirect(next && next.startsWith('/') ? next : getLandingForRole(role))
  }

  export async function logoutAction(): Promise<never> {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  export async function changePasswordAction(
    formData: FormData,
  ): Promise<{ error: string } | never> {
    const password = (formData.get('password') as string | null) ?? ''
    const confirm = (formData.get('confirm') as string | null) ?? ''

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters.' }
    }
    if (password !== confirm) {
      return { error: 'Passwords do not match.' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Not authenticated.' }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { error: error.message }

    // Clear must_change_password in app_metadata via admin client
    const admin = createAdminClient()
    await admin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        must_change_password: false,
      },
    })

    // Also update profiles table
    await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id)

    const role = user.app_metadata?.role as Role | undefined
    redirect(role ? getLandingForRole(role) : '/login')
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add app/actions/auth.ts
  git commit -m "feat(auth): add loginAction, logoutAction, changePasswordAction Server Actions"
  ```

---

## Task 8: Change-Password Page

**Files:**
- Create: `app/change-password/page.tsx`

- [ ] **Step 1: Create `app/change-password/page.tsx`**

  ```typescript
  'use client'

  import { useState, type FormEvent } from 'react'
  import { changePasswordAction } from '@/app/actions/auth'
  import { Button } from '@/components/ui/Button'
  import { Input } from '@/components/ui/Input'
  import { TLP } from '@/lib/theme/tokens'

  export default function ChangePasswordPage() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault()
      setError(null)
      setLoading(true)

      const formData = new FormData()
      formData.set('password', password)
      formData.set('confirm', confirm)

      const result = await changePasswordAction(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
      // On success the action redirects
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${TLP.navy} 0%, ${TLP.navyLight} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 400,
            background: TLP.white,
            borderRadius: 18,
            padding: '44px 40px',
            boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
          }}
        >
          <h1
            style={{
              margin: '0 0 6px',
              fontSize: 24,
              fontWeight: 800,
              color: TLP.navy,
              letterSpacing: '-0.4px',
            }}
          >
            Set your password
          </h1>
          <p style={{ margin: '0 0 24px', color: TLP.gray500, fontSize: 14 }}>
            You must set a password before continuing.
          </p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="New password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {error && (
              <div
                style={{
                  background: TLP.redLight,
                  color: TLP.red,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              style={{ marginTop: 6, justifyContent: 'center' }}
            >
              {loading ? 'Saving…' : 'Set password'}
            </Button>
          </form>
        </div>
      </div>
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
  git add app/change-password/
  git commit -m "feat(auth): add change-password page for magic-link onboarding flow"
  ```

---

## Task 9: API Routes

**Files:**
- Create: `app/api/auth/me/route.ts`
- Create: `app/api/auth/logout/route.ts`
- Create: `app/api/auth/change-password/route.ts`
- Create: `app/api/auth/2fa/verify/route.ts`

- [ ] **Step 1: Create `app/api/auth/me/route.ts`**

  ```typescript
  import { NextResponse } from 'next/server'
  import { getSession } from '@/lib/auth/session'

  export async function GET() {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.json(session)
  }
  ```

- [ ] **Step 2: Create `app/api/auth/logout/route.ts`**

  ```typescript
  import { NextResponse } from 'next/server'
  import { createClient } from '@/lib/supabase/server'

  export async function POST() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    return NextResponse.json({ ok: true })
  }
  ```

- [ ] **Step 3: Create `app/api/auth/change-password/route.ts`**

  ```typescript
  import { NextResponse, type NextRequest } from 'next/server'
  import { changePasswordAction } from '@/app/actions/auth'

  export async function POST(request: NextRequest) {
    const body = await request.json().catch(() => ({}))
    const formData = new FormData()
    formData.set('password', body.password ?? '')
    formData.set('confirm', body.confirm ?? '')

    try {
      const result = await changePasswordAction(formData)
      // changePasswordAction redirects on success — if we're here, there was an error
      return NextResponse.json(result, { status: 400 })
    } catch (e: unknown) {
      // Next.js redirect throws — treat as success
      if (e instanceof Error && e.message === 'NEXT_REDIRECT') {
        return NextResponse.json({ ok: true })
      }
      throw e
    }
  }
  ```

- [ ] **Step 4: Create `app/api/auth/2fa/verify/route.ts`**

  ```typescript
  import { NextResponse } from 'next/server'

  export async function POST() {
    return NextResponse.json(
      { error: '2FA not yet implemented', code: 'COMING_SOON' },
      { status: 501 },
    )
  }
  ```

- [ ] **Step 5: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 6: Commit**

  ```bash
  git add app/api/auth/
  git commit -m "feat(auth): add /api/auth/me, logout, change-password, and 2fa stub routes"
  ```

---

## Task 10: Update Login Page

**Files:**
- Modify: `app/login/page.tsx`

The login page stays a Client Component (interactive demo-account panel requires it). Replace `resolveDemoLogin` with `loginAction`. The demo-account panel behavior is unchanged — clicking a card fills the email/password fields.

- [ ] **Step 1: Update `app/login/page.tsx`**

  Replace the file content with:

  ```typescript
  'use client'

  import Link from 'next/link'
  import { useSearchParams } from 'next/navigation'
  import { Suspense, useState, type FormEvent } from 'react'
  import { Button } from '@/components/ui/Button'
  import { Input } from '@/components/ui/Input'
  import { TLP } from '@/lib/theme/tokens'
  import { loginAction } from '@/app/actions/auth'
  import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '@/lib/mock/auth'

  function LoginForm() {
    const params = useSearchParams()
    const next = params.get('next')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
      e.preventDefault()
      setError(null)
      setLoading(true)

      const formData = new FormData()
      formData.set('email', email)
      formData.set('password', password)
      if (next) formData.set('next', next)

      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
        setLoading(false)
      }
      // On success, loginAction calls redirect() — component unmounts
    }

    return (
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          display: 'grid',
          gridTemplateColumns: '1fr 1.1fr',
          gap: 0,
          background: TLP.white,
          borderRadius: 18,
          boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
          overflow: 'hidden',
        }}
      >
        {/* Left — login form */}
        <div style={{ padding: '44px 40px' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              textDecoration: 'none',
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 7,
                background: TLP.teal,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
              }}
            >
              🌍
            </div>
            <span
              style={{
                fontWeight: 800,
                fontSize: 17,
                color: TLP.navy,
                letterSpacing: '-0.3px',
              }}
            >
              Mentora
            </span>
          </Link>

          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 800,
              color: TLP.navy,
              letterSpacing: '-0.4px',
            }}
          >
            Welcome back
          </h1>
          <p style={{ margin: '6px 0 24px', color: TLP.gray500, fontSize: 14 }}>
            Sign in to your Mentora account.
          </p>

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              hint={`Demo accounts use "${DEMO_PASSWORD}"`}
            />
            {error ? (
              <div
                style={{
                  background: TLP.redLight,
                  color: TLP.red,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            ) : null}
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              style={{ marginTop: 6, justifyContent: 'center' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>

        {/* Right — demo accounts */}
        <div
          style={{
            background: TLP.gray50,
            borderLeft: `1px solid ${TLP.gray100}`,
            padding: '40px 36px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 4,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 13,
                fontWeight: 700,
                color: TLP.navy,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Demo accounts
            </h2>
            <span style={{ fontSize: 11, fontWeight: 600, color: TLP.gray500 }}>
              click to fill
            </span>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: TLP.gray500 }}>
            Password is{' '}
            <code
              style={{
                background: TLP.gray100,
                padding: '1px 5px',
                borderRadius: 4,
                color: TLP.navy,
              }}
            >
              {DEMO_PASSWORD}
            </code>{' '}
            for all accounts.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DEMO_ACCOUNTS.map((acc) => {
              const isPicked = email.toLowerCase() === acc.email.toLowerCase()
              return (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    setEmail(acc.email)
                    setPassword(DEMO_PASSWORD)
                    setError(null)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 10,
                    background: isPicked ? TLP.tealLight : TLP.white,
                    border: `1.5px solid ${isPicked ? TLP.teal : TLP.gray200}`,
                    borderRadius: 10,
                    padding: '10px 12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: 6,
                      borderRadius: 3,
                      alignSelf: 'stretch',
                      background: isPicked ? TLP.teal : TLP.gray300,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 8,
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: TLP.navy,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {acc.label}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                          color: TLP.gray600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {acc.email}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: '3px 0 0',
                        fontSize: 12,
                        color: TLP.gray600,
                        lineHeight: 1.45,
                      }}
                    >
                      {acc.description}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  export default function LoginPage() {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${TLP.navy} 0%, ${TLP.navyLight} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    )
  }
  ```

  Key changes from original:
  - Removed `useRouter` — `loginAction` handles redirect server-side
  - Removed `resolveDemoLogin` import — login now hits Supabase
  - Added `loading` state and disabled button during submission
  - `DEMO_PASSWORD` stays as the hint (updated to `demo1234!` after seeding in Task 12)
  - Demo-account panel click behaviour unchanged

- [ ] **Step 2: Update `DEMO_PASSWORD` in `lib/mock/auth.ts`**

  The seed script will use `demo1234!`. Update the constant:

  Open `lib/mock/auth.ts` and change:

  ```typescript
  export const DEMO_PASSWORD = "demo";
  ```

  to:

  ```typescript
  export const DEMO_PASSWORD = "demo1234!";
  ```

- [ ] **Step 3: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add app/login/page.tsx lib/mock/auth.ts
  git commit -m "feat(auth): update login page to use Supabase loginAction"
  ```

---

## Task 11: Update App Layout

**Files:**
- Modify: `app/(app)/layout.tsx`

Convert from Client Component (role derived from pathname) to Server Component (role from session).

- [ ] **Step 1: Replace `app/(app)/layout.tsx`**

  ```typescript
  import { redirect } from 'next/navigation'
  import { type ReactNode } from 'react'
  import { getSession } from '@/lib/auth/session'
  import { AppShell } from '@/components/layout/AppShell'
  import { navForRole, roleLabelFor } from '@/lib/auth/nav'
  import { TENANT_BY_ID } from '@/lib/mock/tenants'

  export default async function AppLayout({ children }: { children: ReactNode }) {
    const session = await getSession()
    if (!session) redirect('/login')

    const tenantName = session.ownershipId
      ? (TENANT_BY_ID[session.ownershipId]?.fullName ?? undefined)
      : undefined

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

  Note: `TENANT_BY_ID` still uses mock tenant data for display name lookup. Module 2 (Tenancy & Ownerships) will replace this with a Supabase query once the `ownerships` table exists.

- [ ] **Step 2: Verify TypeScript compiles**

  ```bash
  npx tsc --noEmit
  ```

  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add "app/(app)/layout.tsx"
  git commit -m "feat(auth): convert app layout to Server Component using real session"
  ```

---

## Task 12: Seed Script + Run

**Files:**
- Create: `scripts/seed-auth.ts`

Creates 6 demo Supabase Auth users. Safe to re-run — skips existing emails.

- [ ] **Step 1: Install tsx for running TypeScript scripts**

  ```bash
  npm install -D tsx
  ```

- [ ] **Step 2: Create `scripts/seed-auth.ts`**

  ```typescript
  import { createClient } from '@supabase/supabase-js'
  import { config } from 'dotenv'

  config({ path: '.env.local' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const DEMO_PASSWORD = 'demo1234!'

  const SEED_USERS = [
    {
      email: 'parent@demo.com',
      full_name: 'Raj Sharma',
      role: 'cx',
      ownership_id: null,
    },
    {
      email: 'coach@demo.com',
      full_name: 'Priya Patel',
      role: 'co',
      ownership_id: 'ten_tlp',
    },
    {
      email: 'franchisor.admin@demo.com',
      full_name: 'Mira Sandhu',
      role: 'fa',
      ownership_id: 'ten_tlp',
    },
    {
      email: 'franchisee.admin@demo.com',
      full_name: 'Jordan Bell',
      role: 'xa',
      ownership_id: 'ten_mla',
    },
    {
      email: 'franchisor.mgmt@demo.com',
      full_name: 'Anika Iyer',
      role: 'fm',
      ownership_id: 'ten_tlp',
    },
    {
      email: 'franchisee.mgmt@demo.com',
      full_name: 'David Chen',
      role: 'xm',
      ownership_id: 'ten_mla',
    },
  ] as const

  async function seed() {
    console.log('Seeding demo auth users…\n')

    for (const user of SEED_USERS) {
      // Check if user already exists
      const { data: existing } = await admin.auth.admin.listUsers()
      const alreadyExists = existing?.users.some((u) => u.email === user.email)

      if (alreadyExists) {
        console.log(`  ✓ skip  ${user.email} (already exists)`)
        continue
      }

      const { data, error } = await admin.auth.admin.createUser({
        email: user.email,
        password: DEMO_PASSWORD,
        email_confirm: true,
        app_metadata: {
          role: user.role,
          ownership_id: user.ownership_id,
          full_name: user.full_name,
          must_change_password: false,
        },
      })

      if (error) {
        console.error(`  ✗ fail  ${user.email}: ${error.message}`)
      } else {
        console.log(`  ✓ create ${user.email} (id: ${data.user.id})`)
      }
    }

    console.log('\nDone.')
  }

  seed().catch((err) => {
    console.error(err)
    process.exit(1)
  })
  ```

- [ ] **Step 3: Add seed script to `package.json`**

  Add to `"scripts"`:

  ```json
  "seed:auth": "tsx scripts/seed-auth.ts"
  ```

- [ ] **Step 4: Run the seed**

  ```bash
  npm run seed:auth
  ```

  Expected output:
  ```
  Seeding demo auth users…

    ✓ create parent@demo.com (id: ...)
    ✓ create coach@demo.com (id: ...)
    ✓ create franchisor.admin@demo.com (id: ...)
    ✓ create franchisee.admin@demo.com (id: ...)
    ✓ create franchisor.mgmt@demo.com (id: ...)
    ✓ create franchisee.mgmt@demo.com (id: ...)

  Done.
  ```

- [ ] **Step 5: Verify profiles rows were created**

  Use `mcp__supabase__execute_sql` with:
  ```sql
  select id, role, ownership_id, full_name from public.profiles order by created_at;
  ```

  Expected: 6 rows matching the seed users.

- [ ] **Step 6: Commit**

  ```bash
  git add scripts/seed-auth.ts package.json package-lock.json
  git commit -m "feat(auth): add idempotent seed script for demo Supabase users"
  ```

---

## Task 13: End-to-End Smoke Test

Manual verification — run the dev server and test all 6 login flows.

- [ ] **Step 1: Start the dev server**

  ```bash
  npm run dev
  ```

- [ ] **Step 2: Test unauthenticated redirect**

  Navigate to `http://localhost:3000/admin/dashboard`. Expected: redirect to `/login?next=/admin/dashboard`.

- [ ] **Step 3: Test login for each demo account**

  For each account below, on `/login`:
  1. Click the demo account card (fills email + password)
  2. Click "Sign in"
  3. Verify redirect to the expected landing

  | Email | Expected landing |
  |---|---|
  | `parent@demo.com` | `/customer/dashboard` |
  | `coach@demo.com` | `/coach/dashboard` |
  | `franchisor.admin@demo.com` | `/admin/dashboard` |
  | `franchisee.admin@demo.com` | `/franchisee-admin/dashboard` |
  | `franchisor.mgmt@demo.com` | `/management/dashboard` |
  | `franchisee.mgmt@demo.com` | `/management/dashboard` |

- [ ] **Step 4: Test wrong-role redirect**

  While logged in as `parent@demo.com`, navigate to `/admin/dashboard`. Expected: redirect to `/customer/dashboard`.

- [ ] **Step 5: Test logout**

  Add a logout button invocation (in the browser console or via the topbar if wired up):

  ```javascript
  fetch('/api/auth/logout', { method: 'POST' })
  ```

  Then navigate to `/admin/dashboard`. Expected: redirect to `/login`.

- [ ] **Step 6: Test `GET /api/auth/me`**

  While logged in, fetch:
  ```javascript
  fetch('/api/auth/me').then(r => r.json()).then(console.log)
  ```

  Expected: JSON with `id`, `email`, `role`, `ownershipId`, `fullName`, `mustChangePassword`.

- [ ] **Step 7: Test `POST /api/auth/2fa/verify`**

  ```javascript
  fetch('/api/auth/2fa/verify', { method: 'POST' }).then(r => [r.status, r.json()])
  ```

  Expected: HTTP 501, `{ "error": "2FA not yet implemented", "code": "COMING_SOON" }`.

- [ ] **Step 8: Final commit**

  ```bash
  git add -A
  git commit -m "feat(auth): Module 1 complete — Supabase Auth, middleware, sessions, seeded demo accounts"
  ```

---

## Self-Review Notes

- **Spec coverage:** profiles table ✓ · DB trigger ✓ · server/client/admin clients ✓ · `getSession` ✓ · middleware ✓ · loginAction/logoutAction/changePasswordAction ✓ · API routes (me, logout, change-password, 2fa stub) ✓ · login page updated ✓ · app layout updated ✓ · seed script ✓ · 2FA stub returns 501 ✓ · magic link flow (must_change_password + /change-password page) ✓
- **Mock auth retirement:** `resolveDemoLogin` no longer called. `DEMO_ACCOUNTS` and `DEMO_PASSWORD` kept for UI display metadata only.
- **Type consistency:** `SessionUser` defined in `lib/auth/types.ts`, used in `session.ts`, returned by `getSession()`, consumed by layout and API routes.
- **`must_change_password` flow:** stored in `app_metadata` (JWT-readable by middleware) + profiles table (readable by `getSession`). Cleared in both places by `changePasswordAction`.
- **Ownership ID format:** `ten_tlp` / `ten_mla` — matches existing `lib/mock/tenants.ts` IDs for continuity. Module 2 will create the `ownerships` table with these same IDs.
