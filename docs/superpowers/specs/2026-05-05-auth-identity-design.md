# Module 1 — Auth & Identity: Design Spec

_Date: 2026-05-05_
_Status: Approved — ready for implementation planning_

---

## Overview

Replace the mock auth layer (`lib/mock/auth.ts`) with real Supabase Auth. Wire up Next.js middleware for session validation and role-based route protection. Establish the Supabase client infrastructure that all subsequent modules will build on.

**Stack:** Next.js 16.2.2 App Router · `@supabase/ssr` 0.10 · `@supabase/supabase-js` 2.x · Supabase project already connected (`.env.local` has URL + anon key).

---

## Chosen Approach: Option A — Supabase Auth + `app_metadata` custom claims

`role` and `ownership_id` are stored in Supabase's `app_metadata` at account creation. These travel inside the JWT, making them available in the middleware without a DB query on every request. `@supabase/ssr` handles cookie refresh automatically.

### Why Option A

- Middleware stays lightweight: role check is a JWT claim read, not a DB round-trip.
- `app_metadata` is admin-only writable — safe for role storage.
- `@supabase/ssr` is already installed and designed for exactly this pattern.
- Roles are set at account creation and don't change frequently, so stale-claim risk is minimal.

---

## Alternative Approaches (not implemented, documented for reference)

### Option B — Supabase Auth + profiles table query per request

No custom claims. Middleware queries the `profiles` table on every request to resolve role.

- **Pro:** Simpler initial setup, no `app_metadata` management.
- **Con:** Extra DB round-trip on every page load. Does not scale. No advantage over Option A given Supabase's admin API is already available.
- **When to reconsider:** If roles need to change frequently in real-time and stale JWTs become a problem.

### Option C — Supabase Auth + full Row Level Security from day one

Full RLS policies on every table, roles enforced at the DB layer using `auth.uid()` and `auth.jwt()`.

- **Pro:** Most correct long-term security posture.
- **Con:** Significantly out of scope for Module 1. Each domain module should define its own RLS policies as it is built.
- **When to implement:** Incrementally, per module, starting from Module 2 (Tenancy & Ownerships).

---

## Database

### `profiles` table

Extends `auth.users` with app-specific identity fields.

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, references `auth.users(id)` ON DELETE CASCADE | |
| `role` | text | NOT NULL | One of: `fa`, `fm`, `xa`, `xm`, `co`, `cx` |
| `ownership_id` | text | nullable | Present for all users; franchisor staff get the corporate ownership id |
| `full_name` | text | NOT NULL | |
| `must_change_password` | boolean | NOT NULL, default false | Set true on magic-link invites |
| `created_at` | timestamptz | NOT NULL, default now() | |

### DB trigger

On `auth.users` INSERT → auto-creates the corresponding `profiles` row, reading `full_name`, `role`, `ownership_id` from `raw_app_meta_data`. This ensures profiles exist for magic-link users before they complete onboarding.

### `app_metadata` format

```json
{ "role": "franchisor_admin", "ownership_id": "own_tlp" }
```

`ownership_id` is omitted (or null) for franchisor corporate staff (FA, FM). It is always present for XA, XM, CO, and CX.

### Role string mapping

| Code | `lib/types.ts` value | Description |
|---|---|---|
| `fa` | `franchisor_admin` | Franchisor Admin — has `ownership_id` of corporate ownership; route handlers use role (not ownership_id) to grant cross-ownership access |
| `fm` | `franchisor_management` | Franchisor Management — same as above |
| `xa` | `franchisee_admin` | Franchisee Admin |
| `xm` | `franchisee_management` | Franchisee Management |
| `co` | `coach` | Coach |
| `cx` | `customer` | Customer |

---

## File Structure

```
lib/supabase/
  server.ts          SSR client — reads cookies; used in Server Components, Server Actions, Route Handlers
  client.ts          Browser client — used in Client Components
  admin.ts           Service-role client — admin ops (set app_metadata, send invites); never exposed to browser

lib/auth/
  session.ts         getSession() — typed helper for Server Components; returns { user, role, ownershipId, mustChangePassword }

middleware.ts        Root-level middleware; validates session, enforces role → path routing

app/actions/
  auth.ts            loginAction, logoutAction, changePasswordAction (Server Actions)

app/api/auth/
  me/route.ts        GET  — returns current user profile from session + profiles join
  logout/route.ts    POST — signs out, clears cookie
  change-password/route.ts   POST — calls supabase.auth.updateUser({ password })
  2fa/verify/route.ts        POST — stub; returns HTTP 501 { error: "2FA not yet implemented", code: "COMING_SOON" }

app/login/page.tsx          Updated — form calls loginAction Server Action (replaces client-side mock)
app/(app)/layout.tsx        Updated — reads role from session, not pathname
```

---

## Middleware Route Protection

### Public paths (no session required)

- `/` — home
- `/login` — login page
- `/t/*` — public tenant storefronts
- `/api/auth/login` — login endpoint

### Role → path mapping

| Role (`app_metadata`) | Allowed prefix | Landing (default redirect) |
|---|---|---|
| `fa` (franchisor_admin) | `/admin` | `/admin/dashboard` |
| `fm` (franchisor_management) | `/management` | `/management/dashboard` |
| `xa` (franchisee_admin) | `/franchisee-admin` | `/franchisee-admin/dashboard` |
| `xm` (franchisee_management) | `/management` | `/management/dashboard` |
| `co` (coach) | `/coach` | `/coach/dashboard` |
| `cx` (customer) | `/customer` | `/customer/dashboard` |

### Middleware logic

1. Refresh session via `@supabase/ssr` (updates cookie if needed).
2. If no session and path is protected → redirect to `/login?next=<path>`.
3. If session exists and `must_change_password` is true → redirect to `/change-password` (unless already there).
4. If session exists but role's allowed prefix doesn't match current path → redirect to role's landing.
5. Otherwise → allow through.

---

## Key Flows

### Login

1. User submits email + password on `/login`.
2. `loginAction` (Server Action) calls `supabase.auth.signInWithPassword()`.
3. `@supabase/ssr` writes session cookie.
4. Server reads `app_metadata.role` → redirects to role landing (or `?next` param if set).
5. Middleware validates every subsequent request from the cookie.

### Magic link invite (replaces temp-password flow)

1. Admin creates coach or ownership account → server calls `supabase.admin.inviteUserByEmail()` with `app_metadata` pre-populated (`role`, `ownership_id`).
2. Supabase sends the magic link email (uses Supabase's default email provider; transport is swappable later via Supabase dashboard).
3. User clicks link → authenticated, `must_change_password = true` on their profile.
4. Middleware detects `must_change_password` → redirects to `/change-password` before any other route.
5. After password set → `must_change_password` flipped to false → normal routing resumes.

### Logout

1. `logoutAction` calls `supabase.auth.signOut()`.
2. Cookie cleared → redirect to `/login`.

### Change password

`changePasswordAction` calls `supabase.auth.updateUser({ password })`. The user must already be authenticated (session required). No re-verification of current password — Supabase enforces session validity.

### `GET /api/auth/me`

Returns:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "franchisor_admin",
  "ownership_id": "own_tlp",
  "full_name": "Mira Sandhu",
  "must_change_password": false
}
```

### `POST /api/auth/2fa/verify` (stub)

Returns HTTP 501:
```json
{ "error": "2FA not yet implemented", "code": "COMING_SOON" }
```

---

## Demo Account Seeding

6 real Supabase Auth users are created matching the existing `DEMO_ACCOUNTS` in `lib/mock/auth.ts`. Password for all: `demo1234!`.

| Email | Role code | `ownership_id` |
|---|---|---|
| `parent@demo.com` | `cx` | null |
| `coach@demo.com` | `co` | `own_tlp` |
| `franchisor.admin@demo.com` | `fa` | `own_tlp` |
| `franchisee.admin@demo.com` | `xa` | `own_mla` |
| `franchisor.mgmt@demo.com` | `fm` | `own_tlp` |
| `franchisee.mgmt@demo.com` | `xm` | `own_mla` |

`lib/mock/auth.ts` retains the display metadata (labels, descriptions, full names) used by the login page demo-account panel. `resolveDemoLogin()` is retired — login is real Supabase auth.

The seed is a one-time script (`scripts/seed-auth.ts`) run via `npx tsx scripts/seed-auth.ts`. It uses the service-role key and is safe to re-run (idempotent — skips existing emails).

---

## What This Module Does NOT Cover

- RLS policies on any table (deferred to each domain module).
- 2FA implementation (stub only; `code: "COMING_SOON"`).
- Email provider configuration (Supabase default email is sufficient for prototype; swappable via dashboard).
- Social login / OAuth.
- Replacing non-auth mock data (`lib/mock/coaches.ts`, `lib/mock/locations.ts`, etc.) — those are replaced in Modules 2–19.
