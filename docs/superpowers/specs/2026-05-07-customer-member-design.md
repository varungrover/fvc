# Module 7 — Customer & Member: Design Spec

_Date: 2026-05-07_
_Status: Complete — Pending native 2FA unmasking integration_

---

## Overview

Customer & Member management is the account layer that sits between Auth (Module 1) and Enrollment (Module 8). A **Customer** is the billing contact — the adult who pays. A **Member** is a learner profile under a customer account — typically a child, but can be the customer themselves.

Key design constraints:
1. **PII isolation** — DOB, phone, gender, and emergency contact are sensitive. Masked by default; accessible in full only to global admins or a 2FA-verified customer viewing their own data.
2. **Multi-tenant scoping** — customers are attached to an `ownership_id`; franchisee admins only see customers in their own ownership.
3. **Trigger-based record creation** — when a `profiles` row is created with `role = 'customer'`, a trigger automatically creates the corresponding `customers` row.

**Stack:** Next.js 16.2.2 App Router · Supabase Postgres · `@supabase/ssr` · TypeScript 5 · Supabase Admin API (for admin-provisioned accounts)

---

## Chosen Approach: Separate `customers` and `members` tables, trigger-backed, with application-layer PII masking

`customers` extends `profiles` via a 1:1 FK. `members` is a child table of `customers` (1:N). All PII masking happens in `lib/utils/pii.ts` at the application layer — RLS handles row-level access, the application handles field-level masking.

### Why this approach

- **Separation of concerns**: Auth identity lives in `profiles`; billing/loyalty data lives in `customers`; learner data lives in `members`. Each can evolve independently.
- **Trigger for automatic creation**: Removing the need for the registration flow to make two separate API calls eliminates a class of race conditions where a customer profile exists but the `customers` row doesn't.
- **Application-layer masking over DB column masking**: Supabase doesn't natively support column-level masking via RLS. Masking in `pii.ts` is simpler, testable, and doesn't require DB views or generated columns.

### Alternative Approaches Considered

**Option B — Store all customer fields on `profiles` directly**
- Pro: One fewer join.
- Con: `profiles` would accumulate billing-specific fields (`loyalty_points`, `stripe_customer_id`, `cfc_id`) that are meaningless for coaches or admin users. Violates single-responsibility.
- Not chosen.

**Option C — Use Postgres column masking via security definer views**
- Pro: PII masking enforced at DB layer, never leaking to application even in misconfigured cases.
- Con: Significant complexity — requires parallel view schemas, Supabase doesn't support row-level security on views transparently, and the pattern adds cognitive overhead for all future queries.
- Deferred: Will re-evaluate if regulatory compliance (PIPEDA/GDPR) requires it. For prototype, application-layer masking is sufficient.

**Option D — 2FA via custom JWT claim (`x-2fa-verified`)**
- Pro: Purely stateless — no session store needed.
- Con: Requires a Supabase Edge Function to sign custom JWT claims, adding infrastructure complexity. Supabase natively supports MFA with `aal2` assurance level claims embedded in the standard JWT.
- Not chosen: Native Supabase `aal2` is used instead (future integration with `auth.mfa_factors` table).

---

## Database

### `customers` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `profile_id` | uuid | NOT NULL, UNIQUE, FK → `profiles(id) ON DELETE CASCADE` | 1:1 with profiles |
| `ownership_id` | uuid | nullable, FK → `ownerships(id) ON DELETE CASCADE` | null for globally-registered customers |
| `phone` | varchar(30) | nullable | PII — masked by default |
| `emergency_contact` | varchar(255) | nullable | PII — masked by default |
| `gender` | varchar(20) | nullable | PII — masked by default |
| `cfc_id` | varchar(100) | nullable | Chess Federation of Canada ID |
| `terms_accepted` | boolean | NOT NULL, default false | Required before first enrollment |
| `loyalty_points` | integer | NOT NULL, default 0 | 1 pt per $1 CAD spent |
| `stripe_customer_id` | varchar(255) | nullable | Set by Stripe webhook in Module 8 |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | Auto-updated via trigger |

**Note:** `email` and `full_name` live on `profiles`, joined at query time. Do not duplicate them on `customers`.

### `members` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `customer_id` | uuid | NOT NULL, FK → `customers(id) ON DELETE CASCADE` | |
| `full_name` | varchar(100) | NOT NULL | PII — visible to admins and the owning customer |
| `dob` | date | NOT NULL | PII — masked to `••••-••-••` by default |
| `gender` | varchar(20) | nullable | PII — masked by default |
| `grade` | varchar(50) | nullable | e.g. "Grade 5", "Adult" |
| `t_shirt_size` | varchar(20) | nullable | Display field; no business logic |
| `preferred_color` | varchar(50) | nullable | Display field; no business logic |
| `is_active` | boolean | NOT NULL, default true | Soft-delete for members |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | Auto-updated via trigger |

### Database Triggers

**`handle_new_customer_profile()`** — fires `AFTER INSERT` on `public.profiles`:
- If the new row's role is `'customer'`, automatically inserts a corresponding `customers` row.
- Uses `ON CONFLICT (profile_id) DO NOTHING` to be idempotent.
- Defined as `SECURITY DEFINER` so it can insert even if the inserting user doesn't have direct `INSERT` on `customers`.

**`handle_updated_at()`** — fires `BEFORE UPDATE` on `customers` and `members`:
- Sets `updated_at = now()` automatically.

### RLS Policies — `customers`

| Policy | Operation | Roles | Condition |
|---|---|---|---|
| `customers_self_access` | ALL | customer (self) | `auth.uid() = profile_id` |
| `franchisor_admin_all_customers` | ALL | FA, FM | `jwt app_metadata role IN ('franchisor_admin', 'franchisor_mgmt')` |
| `franchisee_admin_own_customers` | ALL | XA | `ownership_id = jwt app_metadata ownership_id::uuid` |

### RLS Policies — `members`

| Policy | Operation | Roles | Condition |
|---|---|---|---|
| `customers_manage_own_members` | ALL | customer (self) | `EXISTS (SELECT 1 FROM customers c WHERE c.id = members.customer_id AND c.profile_id = auth.uid())` |
| `franchisor_admin_all_members` | ALL | FA, FM | `jwt app_metadata role = 'franchisor_admin'` |
| `franchisee_admin_own_members` | ALL | XA | `EXISTS (SELECT 1 FROM customers c WHERE c.id = members.customer_id AND c.ownership_id = jwt ownership_id::uuid)` |
| `coaches_read_members` | SELECT | CO | `jwt app_metadata role = 'coach'` — further restricted to enrolled members in application layer |

---

## PII Masking

Masking is applied in `lib/utils/pii.ts` at the application layer. No field is removed from the response — it is replaced with a masked placeholder:

| Field | Masked Value | Visible When |
|---|---|---|
| `dob` | `"••••-••-••"` | Self + 2FA verified (`aal2`), or FA/FM |
| `phone` | `"+1-•••-•••-XXXX"` | Self + 2FA verified, or FA/FM |
| `emergency_contact` | `"+1-•••-•••-XXXX"` | Self + 2FA verified, or FA/FM |
| `gender` | `"•••"` | Self + 2FA verified, or FA/FM |
| `email` | `"ab•••@domain.com"` | Self + 2FA verified, or FA/FM |

**2FA check:** Uses Supabase's native `aal` claim. An `aal2` value in the session indicates the user has completed MFA and PII is unmasked. When `aal1` (password only), masking is applied.

---

## API Design

### `POST /api/customers`

Admin-provisioned customer creation. Requires FA or XA session.

**Flow:**
1. Validate session role (FA or XA).
2. For XA, infer `ownershipId` from JWT (prevents privilege escalation).
3. Create Auth user via Supabase Admin API (`admin.auth.createUser`) with `email_confirm: true`.
4. The `on_customer_profile_created` trigger automatically creates the `customers` row.
5. Update `profiles.ownership_id` and `customers` record (phone, gender, cfc_id, etc.) via admin client.

**Request body:**
```json
{
  "fullName": "string (required)",
  "email": "string (required)",
  "phone": "string (optional)",
  "dob": "date string (optional)",
  "gender": "string (optional)",
  "cfcId": "string (optional)"
}
```

**Response:** `200 { success: true, userId: "uuid" }`

**Auth:** Session required. FA or XA only. 401 if no session; 403 if wrong role.

### `GET /api/customers` _(future — currently fetched server-side)_

Scoped list. FA/FM: all customers. XA: own-ownership customers only. Pagination deferred (customer count is small at launch).

### `PATCH /api/customers/:id` _(future — Module 8)_

Updates non-PII fields (loyalty points, stripe_customer_id). PII updates gated behind 2FA middleware.

### `GET /api/members?customerId=` _(future — currently fetched server-side)_

Returns all active members for a customer. Applies PII masking based on session `aal` level.

### `POST /api/members` _(handled client-side via Supabase JS SDK directly — see note)_

Member creation goes directly via the Supabase browser client in `MembersClient.tsx`. RLS ensures customers can only insert members linked to their own `customer_id`. No separate route needed for the initial implementation.

### `PATCH /api/members/:id` _(future — 2FA-gated)_

PII updates (DOB, gender, etc.) will require a server-side route with 2FA middleware before applying changes.

---

## Data Access Layer

### `lib/db/customers.ts`

```typescript
listCustomers(supabase, session)              // CustomerRow[] — scoped by role; joins profiles for name/email
getCustomerDetails(supabase, id, session)     // CustomerRow | null (null = 404/403)
updateCustomer(supabase, id, updates)         // void
```

`listCustomers` joins `profiles!inner(full_name, email)` and `members(count)` in a single query. Scoping: FA/FM → no filter; XA → `WHERE ownership_id = session.ownershipId`.

### `lib/db/members.ts`

```typescript
listMembers(supabase, customerId, session)    // MemberRow[]
getMemberDetails(supabase, id, session)       // MemberRow | null
upsertMember(supabase, member)                // MemberRow
deleteMember(supabase, id)                    // void (soft-delete sets is_active = false)
```

### `lib/utils/pii.ts`

```typescript
is2FAVerified(session)                        // boolean — checks aal2 claim
maskEmail(email)                              // string
maskPhone(phone)                              // string
maskDate(dateString)                          // string
applyCustomerPIIMasking(customer, session)    // CustomerRow with masked fields
applyMemberPIIMasking(member, session, customerProfileId) // MemberRow with masked fields
```

---

## Page Architecture

### Conversion Pattern

All pages in this module follow the Server Component + Client Component split:
1. `page.tsx` — `async` Server Component. Fetches session, builds `SessionUser`, calls DAL, passes data as props.
2. `*Client.tsx` — `"use client"` sibling. Owns all `useState`, modals, and mutations.

### Customer Portal — `/customer/members`

**Who:** Customers only (CX role). Redirects to `/login` if unauthenticated.

**Server Component (`page.tsx`):**
- Fetches `auth.getUser()` → gets `user.id`.
- Queries `customers` table to resolve `customer_id` for this user.
- Calls `listMembers(supabase, customerId, session)`.
- Passes `initialMembers` and `customerId` to `MembersClient`.

**Client Component (`MembersClient.tsx`):**
- Renders a card grid of member profiles.
- DOB is always masked with `"••/••/••••"` in the UI display (PII protection by default).
- Add Member modal: full name, DOB, grade, T-shirt size, gender, preferred color.
- Edit Member modal: same form; shows 2FA prompt notice.
- Mutations go directly via `supabase.from('members').upsert(...)` using the browser client.
- `router.refresh()` after save to re-fetch from Server Component.

### Franchisee Admin — `/franchisee-admin/customers`

**Who:** Franchisee Admins (XA) only.

**Server Component (`page.tsx`):**
- Validates session role is `franchisee_admin`, else redirect.
- Calls `listCustomers(supabase, sessionUser)` — returns scoped customers with member counts.
- Passes `initialCustomers` to `CustomersClient`.

**Client Component (`CustomersClient.tsx`):**
- Table with columns: Customer (avatar + name + phone), Email (masked), Members, Enrollments (placeholder `0`), Loyalty Points, Last Invoice (placeholder `—`).
- Search filters by name, email, or phone.
- Click row to expand: shows CFC ID, gender, emergency contact, terms accepted, join date.
- Add Customer → calls `POST /api/customers` which provisions a real Auth user + profile + customers row.
- `router.refresh()` after successful creation.

### Franchisor Admin — `/admin/customers`

**Who:** Franchisor Admins (FA) and Franchisor Management (FM).

Identical structure to the franchisee admin page. Key differences:
- No `ownership_id` filter — sees all customers across all ownerships.
- `listCustomers` receives a global-role session, so RLS allows returning all rows.

---

## Role Access Summary

| Action | FA | FM | XA | XM | CO | CX |
|---|---|---|---|---|---|---|
| List customers (scoped) | ✅ all | ✅ all | ✅ own | ❌ | ❌ | ❌ |
| View customer details | ✅ | ✅ | ✅ own | ❌ | ❌ | ✅ self |
| Create customer (provision) | ✅ | ❌ | ✅ own | ❌ | ❌ | (self-register) |
| View members list | ✅ | ✅ | ✅ own | ❌ | ✅ (enrolled) | ✅ self |
| Add/edit member | ✅ | ❌ | ✅ own | ❌ | ❌ | ✅ self |
| View unmasked PII | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ self + 2FA |

---

## Key Flows

### Admin provisions a new customer

1. XA or FA clicks "Add Customer" in the customers table.
2. Modal collects: full name, email, phone, DOB (optional), gender (optional), CFC ID (optional).
3. Client POSTs to `/api/customers`.
4. Route handler validates role + infers `ownershipId` for XA from JWT.
5. Supabase Admin API creates the Auth user (`email_confirm: true` — no password; customer receives a magic link or sets password on first login).
6. `on_customer_profile_created` trigger fires → creates `profiles` row with `role = customer` + creates `customers` row.
7. Route handler updates `profiles.ownership_id` and `customers` (phone, gender, cfc_id) via admin client.
8. `200 { success: true }` → client calls `router.refresh()` to reload the table.

### Customer adds a member

1. Customer navigates to `/customer/members`.
2. Clicks "Add Member" card or button.
3. Modal: full name (required), DOB (required), grade, T-shirt size, gender, preferred color.
4. On submit, `MembersClient` calls `supabase.from('members').upsert(...)` directly.
5. RLS validates `customer_id` links to the calling user's `customers` row.
6. On success, local state updated + `router.refresh()`.

### Customer edits a member (future — 2FA gate)

1. Customer clicks "Edit Profile" on a member card.
2. Edit modal opens with current (possibly masked) values.
3. If modifying PII fields (DOB, gender), middleware checks session `aal`.
4. If `aal1` (no 2FA), UI prompts for MFA challenge before saving.
5. After `aal2` confirmed, `PATCH /api/members/:id` is called with updated PII.

---

## Demo Data

Existing test user "Raj Sharma" (`raj@demo.com`) has `role = customer`. The `on_customer_profile_created` trigger backfill migration (`customer_auto_create_v2`) ensures a `customers` row exists for this profile.

No members seeded — the customer is expected to add members manually via the UI, mimicking the real onboarding experience.

---

## What This Module Does NOT Cover

- **Self-registration flow** — customer sign-up via public `/register` page. Deferred to Module 1 polish.
- **Native 2FA UI** — Supabase MFA enrolment (TOTP setup, challenge flow). Deferred. The `pii.ts` masking utility is ready and checks `aal2`; the frontend MFA challenge modal is not yet built.
- **Stripe customer ID assignment** — set by Stripe webhook in Module 8 (Enrollment & Billing).
- **Loyalty points redemption** — display only at launch; no redemption logic needed for prototype.
- **Member achievement tracking** (`member_achievements` table) — flagged in `gaps.md`; deferred to LMS module.
- **`PATCH /api/members/:id`** — full API route with 2FA middleware. Members are currently upserted via the browser Supabase client. A dedicated route with PII gate is needed before production.
