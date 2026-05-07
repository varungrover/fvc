# Module 7 — Customer & Member Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Customer & Member management module — database schema, RLS policies, trigger-based auto-creation, application-layer PII masking utility, data access layer, admin-provisioning API route, and all UI pages for Customer Portal, Franchisee Admin, and Franchisor Admin.

**Spec:** `docs/superpowers/specs/2026-05-07-customer-member-design.md`

**Supabase project ID:** `nxocuhlrldrbbltiqkqh`

---

## File Map

| Task | File | Action | Status | Purpose |
|---|---|---|---|---|
| 1 | `supabase/migrations/009_customers_members.sql` | Create | ✅ Done | `customers` + `members` tables, RLS policies, `updated_at` triggers |
| 2 | `supabase/migrations/010_fix_customer_ownership_nullability.sql` | Create | ✅ Done | Make `customers.ownership_id` nullable (global registrations) |
| 3 | `supabase/migrations/011_customer_auto_create.sql` | Create | ✅ Done | Trigger `handle_new_customer_profile` auto-creates `customers` row on profile insert; backfills existing customers |
| 4 | `lib/db/customers.ts` | Create | ✅ Done | `listCustomers`, `getCustomerDetails`, `updateCustomer` — with role-scoped queries |
| 5 | `lib/db/members.ts` | Create | ✅ Done | `listMembers`, `getMemberDetails`, `upsertMember`, `deleteMember` |
| 6 | `lib/utils/pii.ts` | Create | ✅ Done | `maskEmail`, `maskPhone`, `maskDate`, `applyCustomerPIIMasking`, `applyMemberPIIMasking`, `is2FAVerified` |
| 7 | `app/api/customers/route.ts` | Create | ✅ Done | `POST /api/customers` — admin-provisioned account creation via Supabase Admin API |
| 8 | `app/(app)/customer/members/page.tsx` | Modify | ✅ Done | Server Component: resolves `customer_id`, fetches `listMembers`, passes to client |
| 9 | `app/(app)/customer/members/MembersClient.tsx` | Create | ✅ Done | Client: card grid, Add/Edit member modals, direct Supabase upsert |
| 10 | `app/(app)/franchisee-admin/customers/page.tsx` | Modify | ✅ Done | Server Component: validates XA role, calls `listCustomers` (scoped) |
| 11 | `app/(app)/franchisee-admin/customers/CustomersClient.tsx` | Create | ✅ Done | Client: searchable table, expandable rows, Add Customer modal → `POST /api/customers` |
| 12 | `app/(app)/admin/customers/page.tsx` | Modify | ✅ Done | Server Component: validates FA/FM role, calls `listCustomers` (global) |
| 13 | `app/(app)/admin/customers/CustomersClient.tsx` | Create | ✅ Done | Client: identical to franchisee version; global (unscoped) view |

---

## Task 1: Database Migration — Core Tables

**Files:**
- Create: `supabase/migrations/009_customers_members.sql`

- [x] **Step 1: Create the migration file**

  Create `supabase/migrations/009_customers_members.sql`:

  ```sql
  create table public.customers (
    id                  uuid primary key default gen_random_uuid(),
    profile_id          uuid not null references public.profiles(id) on delete cascade unique,
    ownership_id        uuid not null references public.ownerships(id) on delete cascade,
    phone               varchar(30),
    emergency_contact   varchar(255),
    gender              varchar(20),
    cfc_id              varchar(100),
    terms_accepted      boolean not null default false,
    loyalty_points      integer not null default 0,
    stripe_customer_id  varchar(255),
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
  );

  create table public.members (
    id               uuid primary key default gen_random_uuid(),
    customer_id      uuid not null references public.customers(id) on delete cascade,
    full_name        varchar(100) not null,
    dob              date not null,
    gender           varchar(20),
    grade            varchar(50),
    t_shirt_size     varchar(20),
    preferred_color  varchar(50),
    is_active        boolean not null default true,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
  );

  alter table public.customers enable row level security;
  alter table public.members enable row level security;

  -- Customers RLS
  create policy "customers_self_access" on public.customers
    for all using (auth.uid() = profile_id);

  create policy "franchisor_admin_all_customers" on public.customers
    for all using (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
    );

  create policy "franchisee_admin_own_customers" on public.customers
    for all using (
      ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
    );

  -- Members RLS
  create policy "customers_manage_own_members" on public.members
    for all using (
      exists (
        select 1 from public.customers c
        where c.id = members.customer_id
        and c.profile_id = auth.uid()
      )
    );

  create policy "franchisor_admin_all_members" on public.members
    for all using (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
    );

  create policy "franchisee_admin_own_members" on public.members
    for all using (
      exists (
        select 1 from public.customers c
        where c.id = members.customer_id
        and c.ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
      )
    );

  create policy "coaches_read_members" on public.members
    for select using (
      (auth.jwt() -> 'app_metadata' ->> 'role') = 'coach'
    );

  -- updated_at triggers
  create trigger on_customer_updated
    before update on public.customers
    for each row execute function public.handle_updated_at();

  create trigger on_member_updated
    before update on public.members
    for each row execute function public.handle_updated_at();
  ```

- [x] **Step 2: Apply the migration via Supabase MCP**

---

## Task 2: Fix `ownership_id` Nullability

**Background:** The initial migration set `ownership_id NOT NULL`, but the existing test customer ("Raj Sharma") had `ownership_id = null` on their profile. Customers registered without an ownership attachment (e.g. global sign-ups) need a nullable `ownership_id`.

**Files:**
- Create: `supabase/migrations/010_fix_customer_ownership_nullability.sql`

- [x] **Step 1: Create and apply the fix migration**

  ```sql
  alter table public.customers alter column ownership_id drop not null;
  ```

---

## Task 3: Auto-Create Trigger + Backfill

**Files:**
- Create: `supabase/migrations/011_customer_auto_create.sql`

- [x] **Step 1: Create the trigger function**

  ```sql
  create or replace function public.handle_new_customer_profile()
  returns trigger
  language plpgsql
  security definer set search_path = public
  as $$
  declare
    v_role_name varchar;
  begin
    select name into v_role_name from public.roles where id = new.role_id;

    if v_role_name = 'customer' then
      insert into public.customers (profile_id, ownership_id)
      values (new.id, new.ownership_id)
      on conflict (profile_id) do nothing;
    end if;

    return new;
  end;
  $$;

  drop trigger if exists on_customer_profile_created on public.profiles;
  create trigger on_customer_profile_created
    after insert on public.profiles
    for each row execute function public.handle_new_customer_profile();
  ```

- [x] **Step 2: Backfill existing customer profiles**

  ```sql
  insert into public.customers (profile_id, ownership_id)
  select p.id, p.ownership_id
  from public.profiles p
  join public.roles r on p.role_id = r.id
  where r.name = 'customer'
  on conflict (profile_id) do nothing;
  ```

---

## Task 4: Data Access Layer — Customers

**Files:**
- Create: `lib/db/customers.ts`

- [x] **Step 1: Implement `listCustomers(supabase, session)`**

  - Joins `profiles!inner(full_name, email)` and `members(count)`.
  - Applies `WHERE ownership_id = session.ownershipId` for non-global roles.
  - Maps result: `full_name` and `email` promoted from nested `profiles` object.

- [x] **Step 2: Implement `getCustomerDetails(supabase, id, session)`**

  - Fetches single customer with profile join.
  - Application-layer security check: non-global roles can only access own ownership OR own profile.
  - Returns `null` for not-found or out-of-scope (avoids leaking existence).

- [x] **Step 3: Implement `updateCustomer(supabase, id, updates)`**

  - Partial update; `profile_id` and `ownership_id` are not patchable via this function.

---

## Task 5: Data Access Layer — Members

**Files:**
- Create: `lib/db/members.ts`

- [x] **Step 1: Implement `listMembers(supabase, customerId, session)`**

  - Queries `WHERE customer_id = customerId` ordered by `full_name`.
  - RLS on `members` table handles scoping; no additional filter needed at app layer.

- [x] **Step 2: Implement `getMemberDetails(supabase, id, session)`**

  - Fetches single member by id.
  - Returns `null` if not found (RLS will block out-of-scope rows automatically).

- [x] **Step 3: Implement `upsertMember(supabase, member)`**

  - Uses Supabase `.upsert()` with `.select().single()`.
  - Accepts optional `id` — if provided, updates; if absent, inserts.

- [x] **Step 4: Implement `deleteMember(supabase, id)`**

  - Hard delete for now; can be changed to `is_active = false` in a future migration if needed.

---

## Task 6: PII Masking Utility

**Files:**
- Create: `lib/utils/pii.ts`

- [x] **Step 1: Implement `is2FAVerified(session)`**

  - Checks `session?.aal === 'aal2'` (Supabase native MFA assurance level).
  - Returns boolean.

- [x] **Step 2: Implement field-level mask functions**

  - `maskEmail(email)` → `"ab•••@domain.com"`
  - `maskPhone(phone)` → `"+1-•••-•••-XXXX"` (preserves last 4 digits)
  - `maskDate(dateString)` → `"••••-••-••"`

- [x] **Step 3: Implement `applyCustomerPIIMasking(customer, session)`**

  - FA/FM: returns customer unmasked.
  - Self + `aal2`: returns customer unmasked.
  - All others: masks `email`, `phone`, `emergency_contact`.

- [x] **Step 4: Implement `applyMemberPIIMasking(member, session, customerProfileId)`**

  - FA/FM: returns member unmasked.
  - Self + `aal2`: returns member unmasked.
  - All others: masks `dob`, `gender`.

---

## Task 7: API Route — Create Customer

**Files:**
- Create: `app/api/customers/route.ts`

- [x] **Step 1: Validate session and role**

  - `createClient()` → `getSession()`.
  - Fetch `profiles` row to get `roles.name` and `ownership_id`.
  - Return `401` if no session; `403` if role is not FA or XA.

- [x] **Step 2: Create Auth user via Admin API**

  - `createAdminClient()` → `auth.admin.createUser({ email, email_confirm: true, user_metadata: { full_name, role: 'customer' } })`.
  - The `on_customer_profile_created` trigger fires and creates the `customers` row automatically.

- [x] **Step 3: Update profile and customer with additional fields**

  - `UPDATE profiles SET ownership_id = ownershipId WHERE id = authData.user.id`.
  - `UPDATE customers SET phone, gender, cfc_id, ownership_id WHERE profile_id = authData.user.id`.

- [x] **Step 4: Return `200 { success: true, userId }`**

---

## Task 8: Customer Portal — Server Component

**Files:**
- Modify: `app/(app)/customer/members/page.tsx`

- [x] **Step 1: Convert to `async` Server Component**

  - Remove `"use client"` and all mock imports.
  - Call `createClient()` → `auth.getUser()`.
  - Redirect to `/login` if no user.

- [x] **Step 2: Resolve `customer_id`**

  - Query `customers` table with `.eq('profile_id', user.id).single()`.
  - If no row found (shouldn't happen post-trigger), render informational error.

- [x] **Step 3: Fetch members and render client component**

  - Call `listMembers(supabase, customerData.id, sessionUser)`.
  - Render `<MembersClient initialMembers={members} customerId={customerData.id} />`.

---

## Task 9: Customer Portal — Client Component

**Files:**
- Create: `app/(app)/customer/members/MembersClient.tsx`

- [x] **Step 1: Render member card grid**

  - Cards show: Avatar, full name, grade, T-shirt size, gender, preferred color.
  - DOB always displayed as `"••/••/••••"` (PII — masked in UI regardless of session).
  - "Add Member" dashed card in the grid.

- [x] **Step 2: Add Member modal**

  - Fields: Full Name (required), DOB (required), Grade, T-Shirt Size (select: XS/S/M/L/XL/XXL), Gender, Preferred Color.
  - On submit: `supabase.from('members').upsert(payload).select().single()`.
  - Optimistic state update; `router.refresh()` on success.

- [x] **Step 3: Edit Member modal**

  - Same form fields.
  - Includes 2FA notice banner: _"To edit personal information securely, 2FA verification is required in production."_
  - Upsert with `id` field present triggers update path.

- [x] **Step 4: Error handling**

  - Show `alert()` on Supabase error (temporary; replace with inline error UI in a future polish pass).

---

## Task 10: Franchisee Admin — Server Component

**Files:**
- Modify: `app/(app)/franchisee-admin/customers/page.tsx`

- [x] **Step 1: Convert to `async` Server Component**

  - Remove `"use client"` and all mock imports.
  - Fetch session and profile with role/ownership.
  - Redirect to `/login` if not `franchisee_admin`.

- [x] **Step 2: Build typed `SessionUser` and fetch customers**

  - Build `SessionUser` with all required fields (`id`, `email`, `fullName`, `role as Role`, `ownershipId`, `mustChangePassword`).
  - Call `listCustomers(supabase, sessionUser)` — returns ownership-scoped list with member counts.

- [x] **Step 3: Render `<CustomersClient initialCustomers={customers} />`**

---

## Task 11: Franchisee Admin — Client Component

**Files:**
- Create: `app/(app)/franchisee-admin/customers/CustomersClient.tsx`

- [x] **Step 1: Render searchable customer table**

  - Columns: Customer (avatar + name + phone), Email (masked), Members, Enrollments (placeholder `0`), Loyalty Points, Last Invoice (placeholder `—`).
  - Search filters by name, email, or phone (case-insensitive).

- [x] **Step 2: Expandable rows**

  - Click row → expand to show: CFC ID, Gender, Emergency Contact, Terms Accepted, Joined date.
  - Toggle collapse on second click.

- [x] **Step 3: Add Customer modal**

  - Fields: Full Name (required), Email (required), Date of Birth, Gender (select), Phone, CFC ID.
  - On submit: `POST /api/customers` with JSON body.
  - On success: close modal, call `router.refresh()`.
  - On error: show alert with API error message.

---

## Task 12: Franchisor Admin — Server Component

**Files:**
- Modify: `app/(app)/admin/customers/page.tsx`

- [x] **Step 1: Convert to `async` Server Component**

  - Same structure as franchisee admin but validates `franchisor_admin` or `franchisor_mgmt` role.

- [x] **Step 2: Fetch all customers (global)**

  - `listCustomers` with a global-role `SessionUser` returns all rows (no `ownership_id` filter).

- [x] **Step 3: Render `<CustomersClient initialCustomers={customers} />`**

---

## Task 13: Franchisor Admin — Client Component

**Files:**
- Create: `app/(app)/admin/customers/CustomersClient.tsx`

- [x] **Step 1: Copy from `franchisee-admin/customers/CustomersClient.tsx`**

  - Identical for initial implementation; kept separate for independent future evolution (e.g. FA may later see cross-ownership customer merge tools).

---

## Open Items (Deferred)

- [ ] **Self-registration flow** — Public `/register` page for customer sign-up. Planned for Module 1 polish.
- [ ] **Native 2FA challenge UI** — TOTP enrolment + challenge modal. `pii.ts` is ready; the MFA flow UI is not. Requires Supabase MFA enrolment to be enabled in the project dashboard.
- [ ] **`PATCH /api/members/:id`** — Server-side route with 2FA middleware for PII updates. Currently members are upserted via the browser Supabase client.
- [ ] **`GET /api/customers`** — Proper paginated REST endpoint. Currently fetched server-side in page components; an API endpoint is needed for future mobile or third-party integrations.
- [ ] **Loyalty points computation** — Currently stored as a raw integer. Need a trigger or Cloud Function in Module 8 to increment `loyalty_points` on invoice payment (`$1 = 1 pt`).
- [ ] **Stripe `stripe_customer_id`** — Set by Stripe webhook in Module 8 (Enrollment & Billing).
- [ ] **Member achievements** — `member_achievements` table flagged in `gaps.md`; deferred to the LMS module.
