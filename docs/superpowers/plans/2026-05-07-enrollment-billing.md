# Module 8 — Enrollment & Billing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the full enrollment lifecycle — database schema, Stripe integration, multi-batch enrollment API, first-month proration, monthly invoicing with multi-planet discounts, setup fee tracking per member per planet, payment method management, and all UI pages.

**Spec:** `docs/superpowers/specs/2026-05-07-enrollment-billing-design.md`

**Supabase project ID:** `nxocuhlrldrbbltiqkqh`

---

## File Map

| Task | File | Action | Status | Purpose |
|---|---|---|---|---|
| 1 | `supabase/migrations/010_enrollment_billing.sql` | Create | ⬜ Pending | enrollments, enrollment_batches, member_planet_setup_fees, invoices, invoice_line_items, payment_methods, discount_tiers tables + RLS |
| 2 | `lib/types.ts` | Modify | ⬜ Pending | Fix Enrollment type (remove batchId, add productVariantId/locationId/offeringPrice); fix Invoice (add ownershipId, dueDate, notes); add EnrollmentBatch, MemberPlanetSetupFee, DiscountTier types |
| 3 | `lib/db/enrollments.ts` | Create | ⬜ Pending | listEnrollments, getEnrollment, createEnrollment, updateEnrollmentStatus, listEnrollmentBatches |
| 4 | `lib/db/invoices.ts` | Create | ⬜ Pending | listInvoices, getInvoice, createInvoice, updateInvoiceStatus, generateMonthlyInvoices |
| 5 | `lib/db/paymentMethods.ts` | Create | ⬜ Pending | listPaymentMethods, addPaymentMethod, setDefaultPaymentMethod, removePaymentMethod |
| 6 | `lib/db/discounts.ts` | Create | ⬜ Pending | listDiscountTiers, getDiscountTierForCount, upsertDiscountTier |
| 7 | `lib/billing/invoice.ts` | Create | ⬜ Pending | Business logic: computeFirstMonthAmount, computeMultiPlanetDiscount, buildInvoiceLineItems |
| 8 | `lib/stripe/client.ts` | Create | ⬜ Pending | Stripe SDK singleton (server-side); createStripeCustomer, attachPaymentMethod |
| 9 | `app/api/enrollments/route.ts` | Create | ⬜ Pending | GET (scoped list) + POST (create enrollment + batches + first invoice) |
| 10 | `app/api/enrollments/[id]/route.ts` | Create | ⬜ Pending | GET single + PATCH (cancel/suspend) |
| 11 | `app/api/enrollments/[id]/batches/route.ts` | Create | ⬜ Pending | GET enrollment_batches |
| 12 | `app/api/invoices/route.ts` | Create | ⬜ Pending | GET (scoped list, filterable by customerId/ownershipId/status) |
| 13 | `app/api/invoices/[id]/route.ts` | Create | ⬜ Pending | GET single invoice with line items |
| 14 | `app/api/invoices/[id]/retry/route.ts` | Create | ⬜ Pending | POST — FA/XA retry failed invoice via Stripe |
| 15 | `app/api/payment-methods/route.ts` | Create | ⬜ Pending | GET (by customerId) + POST (attach Stripe PM token) |
| 16 | `app/api/payment-methods/[id]/route.ts` | Create | ⬜ Pending | PATCH (set default) + DELETE (detach from Stripe + remove) |
| 17 | `app/api/discounts/route.ts` | Create | ⬜ Pending | GET all tiers + POST new tier (FA only) |
| 18 | `app/api/discounts/[id]/route.ts` | Create | ⬜ Pending | PATCH update tier + DELETE (FA only) |
| 19 | `app/api/webhooks/stripe/route.ts` | Create | ⬜ Pending | Handle payment_intent.succeeded + payment_intent.payment_failed; verify Stripe signature |
| 20 | `app/(app)/customer/enroll/EnrollClient.tsx` | Create | ⬜ Pending | Client: 6-step enrollment wizard state machine |
| 21 | `app/(app)/customer/enroll/steps/StepVariant.tsx` | Create | ⬜ Pending | Step 2: planet/level/variant selection with real prices |
| 22 | `app/(app)/customer/enroll/steps/StepMember.tsx` | Create | ⬜ Pending | Step 3: select member from customer's list |
| 23 | `app/(app)/customer/enroll/steps/StepBatches.tsx` | Create | ⬜ Pending | Step 4: select N batch slots (N = frequencyPerWeek); capacity check |
| 24 | `app/(app)/customer/enroll/steps/StepPayment.tsx` | Create | ⬜ Pending | Step 5: invoice preview + Stripe Payment Element |
| 25 | `app/(app)/customer/enroll/steps/StepConfirm.tsx` | Create | ⬜ Pending | Step 6: enrollment summary + next billing date |
| 26 | `app/(app)/customer/enroll/page.tsx` | Modify | ⬜ Pending | Server Component: fetch initial data; render EnrollClient |
| 27 | `app/(app)/customer/payments/page.tsx` | Modify | ⬜ Pending | Server Component + refactor client: real invoices + payment methods tabs |
| 28 | `app/(app)/admin/payments/page.tsx` | Modify | ⬜ Pending | Server Component + refactor client: failed invoices + retry; all invoices filter |
| 29 | `app/(app)/admin/discounts/page.tsx` | Create | ⬜ Pending | FA-only: discount tier management table + edit modal |
| 30 | `scripts/seed-enrollment.ts` | Create | ⬜ Pending | Seed 2 discount tiers + 1 test enrollment + 1 paid invoice |

---

## Task 1: Database Migration

**Files:** Create `supabase/migrations/010_enrollment_billing.sql`

- [ ] **Step 1: Create `enrollments` table**

  ```sql
  create table public.enrollments (
    id                   uuid primary key default gen_random_uuid(),
    member_id            uuid not null references public.members(id) on delete cascade,
    customer_id          uuid not null references public.customers(id) on delete cascade,
    product_variant_id   uuid not null references public.product_variants(id),
    location_id          uuid not null references public.locations(id),
    ownership_id         uuid not null references public.ownerships(id),
    offering_price       numeric(10,2) not null,
    status               varchar(20) not null default 'active'
                           check (status in ('active','cancelled','suspended')),
    enrolled_at          timestamptz not null default now(),
    cancelled_at         timestamptz,
    cancellation_reason  text
  );
  alter table public.enrollments enable row level security;
  ```

- [ ] **Step 2: Create `enrollment_batches` table**

  ```sql
  create table public.enrollment_batches (
    id            uuid primary key default gen_random_uuid(),
    enrollment_id uuid not null references public.enrollments(id) on delete cascade,
    batch_id      uuid not null references public.batches(id),
    created_at    timestamptz not null default now(),
    unique (enrollment_id, batch_id)
  );
  alter table public.enrollment_batches enable row level security;
  ```

- [ ] **Step 3: Create `member_planet_setup_fees` table**

  ```sql
  create table public.member_planet_setup_fees (
    id              uuid primary key default gen_random_uuid(),
    member_id       uuid not null references public.members(id) on delete cascade,
    planet_id       uuid not null references public.planets(id),
    amount_charged  numeric(10,2) not null,
    paid_at         timestamptz not null default now(),
    unique (member_id, planet_id)
  );
  alter table public.member_planet_setup_fees enable row level security;
  ```

- [ ] **Step 4: Create `payment_methods` table**

  ```sql
  create table public.payment_methods (
    id            uuid primary key default gen_random_uuid(),
    customer_id   uuid not null references public.customers(id) on delete cascade,
    stripe_pm_id  varchar(255) not null unique,
    last4         varchar(4) not null,
    card_brand    varchar(30) not null,
    exp_month     smallint not null,
    exp_year      smallint not null,
    is_default    boolean not null default false,
    created_at    timestamptz not null default now()
  );
  alter table public.payment_methods enable row level security;
  ```

- [ ] **Step 5: Create `invoices` table**

  ```sql
  create table public.invoices (
    id                   uuid primary key default gen_random_uuid(),
    customer_id          uuid not null references public.customers(id) on delete cascade,
    ownership_id         uuid not null references public.ownerships(id),
    payment_method_id    uuid references public.payment_methods(id),
    amount               numeric(10,2) not null,
    discount             numeric(10,2) not null default 0,
    tax                  numeric(10,2) not null default 0,
    total                numeric(10,2) not null,
    status               varchar(20) not null default 'pending'
                           check (status in ('pending','paid','failed','refunded','waived')),
    due_date             date not null,
    billing_period_start date not null,
    billing_period_end   date not null,
    stripe_pi_id         varchar(255),
    notes                text,
    issued_at            timestamptz not null default now(),
    paid_at              timestamptz
  );
  alter table public.invoices enable row level security;
  ```

- [ ] **Step 6: Create `invoice_line_items` table**

  ```sql
  create table public.invoice_line_items (
    id              uuid primary key default gen_random_uuid(),
    invoice_id      uuid not null references public.invoices(id) on delete cascade,
    enrollment_id   uuid references public.enrollments(id),
    description     text not null,
    amount          numeric(10,2) not null,
    discount_amount numeric(10,2) not null default 0,
    reference_type  varchar(30) not null
                      check (reference_type in ('enrollment','setup_fee','trial','adjustment')),
    reference_id    uuid
  );
  alter table public.invoice_line_items enable row level security;
  ```

- [ ] **Step 7: Create `discount_tiers` table**

  ```sql
  create table public.discount_tiers (
    id            uuid primary key default gen_random_uuid(),
    planets_count smallint not null unique,
    discount_pct  numeric(5,2) not null,
    is_active     boolean not null default true,
    created_at    timestamptz not null default now()
  );
  alter table public.discount_tiers enable row level security;
  ```

- [ ] **Step 8: Apply RLS policies for all tables**

  For `enrollments`:
  ```sql
  create policy "customer_own_enrollments" on public.enrollments for select
    using (exists (select 1 from public.customers c where c.id = customer_id and c.profile_id = auth.uid()));

  create policy "franchisor_all_enrollments" on public.enrollments for all
    using ((auth.jwt()->'app_metadata'->>'role') in ('franchisor_admin','franchisor_mgmt'));

  create policy "franchisee_own_enrollments" on public.enrollments for all
    using (ownership_id = ((auth.jwt()->'app_metadata'->>'ownership_id')::uuid));

  create policy "coach_read_enrollments" on public.enrollments for select
    using ((auth.jwt()->'app_metadata'->>'role') = 'coach');
  ```

  Apply analogous policies (scoped by `customer_id` → customer profile, or `ownership_id`) to `invoices`, `payment_methods`, `enrollment_batches`, `member_planet_setup_fees`.

  For `discount_tiers`: authenticated read-all; FA-only write.

- [ ] **Step 9: Loyalty points trigger on invoice paid**

  ```sql
  create or replace function public.handle_invoice_paid()
  returns trigger language plpgsql security definer as $$
  begin
    if new.status = 'paid' and old.status != 'paid' then
      update public.customers
      set loyalty_points = loyalty_points + floor(new.total)::int
      where id = new.customer_id;
    end if;
    return new;
  end;
  $$;

  create trigger on_invoice_paid
    after update on public.invoices
    for each row execute function public.handle_invoice_paid();
  ```

- [ ] **Step 10: Apply migration via Supabase MCP**

---

## Task 2: TypeScript Type Fixes

**Files:** Modify `lib/types.ts`

- [ ] **Step 1: Fix `Enrollment` interface** — remove `batchId`, add `productVariantId`, `locationId`, `offeringPrice`, `ownershipId`, `cancelledAt?`, `cancellationReason?`
- [ ] **Step 2: Add `EnrollmentBatch` interface** — `{ id, enrollmentId, batchId }`
- [ ] **Step 3: Fix `Invoice` interface** — add `ownershipId`, `dueDate`, `billingPeriodStart`, `billingPeriodEnd`, `notes?`
- [ ] **Step 4: Fix `InvoiceLineItem`** — add `discountAmount`; remove `"event" | "camp"` from `referenceType` union
- [ ] **Step 5: Add `MemberPlanetSetupFee` interface** — `{ id, memberId, planetId, amountCharged, paidAt }`
- [ ] **Step 6: Add `DiscountTier` interface** — `{ id, planetsCount, discountPct, isActive }`

---

## Task 3: DAL — Enrollments

**Files:** Create `lib/db/enrollments.ts`

- [ ] **Step 1: `listEnrollments(supabase, filters, session)`** — filters: `customerId | memberId | batchId`. Joins `product_variants`, `products`, `planets`, `locations`. Scoped by role.
- [ ] **Step 2: `getEnrollment(supabase, id, session)`** — single row with joins. Returns `null` for not-found/out-of-scope.
- [ ] **Step 3: `createEnrollment(supabase, input)`** — inserts `enrollments` row + N `enrollment_batches` rows in a transaction.
- [ ] **Step 4: `updateEnrollmentStatus(supabase, id, update)`** — sets `status`, `cancelled_at`, `cancellation_reason`.
- [ ] **Step 5: `listEnrollmentBatches(supabase, enrollmentId)`** — returns batches with day/time details.

---

## Task 4: DAL — Invoices

**Files:** Create `lib/db/invoices.ts`

- [ ] **Step 1: `listInvoices(supabase, filters, session)`** — filters: `customerId | ownershipId | status`. Includes line items in response.
- [ ] **Step 2: `getInvoice(supabase, id, session)`** — full invoice with line items.
- [ ] **Step 3: `createInvoice(supabase, input)`** — inserts invoice + line items atomically.
- [ ] **Step 4: `updateInvoiceStatus(supabase, id, update)`** — updates `status`, `stripe_pi_id`, `paid_at`.

---

## Task 5: DAL — Payment Methods

**Files:** Create `lib/db/paymentMethods.ts`

- [ ] **Step 1: `listPaymentMethods(supabase, customerId, session)`**
- [ ] **Step 2: `addPaymentMethod(supabase, input)`** — after Stripe attach is confirmed.
- [ ] **Step 3: `setDefaultPaymentMethod(supabase, id, customerId)`** — unsets existing default, sets new one.
- [ ] **Step 4: `removePaymentMethod(supabase, id)`**

---

## Task 6: DAL — Discounts

**Files:** Create `lib/db/discounts.ts`

- [ ] **Step 1: `listDiscountTiers(supabase)`**
- [ ] **Step 2: `getDiscountTierForCount(supabase, count)`** — used during invoice generation.
- [ ] **Step 3: `upsertDiscountTier(supabase, input)`**

---

## Task 7: Billing Business Logic

**Files:** Create `lib/billing/invoice.ts`

- [ ] **Step 1: `computeFirstMonthAmount(price, enrollmentDate)`**

  ```typescript
  // Returns prorated amount for remainder of current month
  // If enrollmentDate is 1st, returns full price
  function computeFirstMonthAmount(price: number, enrollmentDate: Date): number {
    const daysInMonth = new Date(enrollmentDate.getFullYear(), enrollmentDate.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - enrollmentDate.getDate() + 1;
    if (remainingDays === daysInMonth) return price; // enrolled on the 1st
    return parseFloat(((price / daysInMonth) * remainingDays).toFixed(2));
  }
  ```

- [ ] **Step 2: `computeMultiPlanetDiscount(subtotal, activePlanetCount, tiers)`** — looks up applicable tier, returns discount amount.
- [ ] **Step 3: `buildInvoiceLineItems(enrollments, setupFees, tiers, enrollmentDate)`** — returns `InvoiceLineItemInput[]` with prorated amounts, setup fee lines, and discount applied.

---

## Task 8: Stripe Client

**Files:** Create `lib/stripe/client.ts`

- [ ] **Step 1: Export Stripe singleton** — `new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })`
- [ ] **Step 2: `createStripeCustomer(email, name)`** — wraps `stripe.customers.create`. Stores result in `customers.stripe_customer_id`.
- [ ] **Step 3: `attachPaymentMethod(stripeCustomerId, stripePmId)`** — wraps `stripe.paymentMethods.attach`.
- [ ] **Step 4: `createPaymentIntent(amount, currency, stripeCustomerId, stripePmId)`** — wraps `stripe.paymentIntents.create`.
- [ ] **Step 5: `detachPaymentMethod(stripePmId)`** — wraps `stripe.paymentMethods.detach`.

---

## Task 9: API — Enrollments

**Files:** Create `app/api/enrollments/route.ts` + `app/api/enrollments/[id]/route.ts` + `app/api/enrollments/[id]/batches/route.ts`

- [ ] **Step 1: `GET /api/enrollments`** — parse query params, call `listEnrollments`, return scoped results.
- [ ] **Step 2: `POST /api/enrollments`**
  - Validate session role.
  - Validate `batchIds.length === variant.frequency_per_week`.
  - Validate batch capacity (each batch: `max_capacity > current enrollment_batches count`).
  - Snapshot `offering_price` from `location_course_offerings`.
  - Check `member_planet_setup_fees` for existing setup fee.
  - Call `buildInvoiceLineItems` to produce line items.
  - If cash: `createEnrollment` + `createInvoice` with `status = 'paid'`.
  - If card: `createEnrollment` + `createInvoice` with `status = 'pending'` → create Stripe PaymentIntent → return `clientSecret`.
- [ ] **Step 3: `GET /api/enrollments/:id`** — single enrollment with batches.
- [ ] **Step 4: `PATCH /api/enrollments/:id`** — validate 15-day cancellation rule; call `updateEnrollmentStatus`.
- [ ] **Step 5: `GET /api/enrollments/:id/batches`** — list enrollment_batches with batch detail.

---

## Task 10: API — Invoices

**Files:** Create `app/api/invoices/route.ts` + `app/api/invoices/[id]/route.ts` + `app/api/invoices/[id]/retry/route.ts`

- [ ] **Step 1: `GET /api/invoices`** — scoped by role + query filters.
- [ ] **Step 2: `GET /api/invoices/:id`** — with line items; 404 for out-of-scope.
- [ ] **Step 3: `POST /api/invoices/:id/retry`** — FA/XA only. Validates invoice is `failed`. Creates new Stripe PaymentIntent. Updates `stripe_pi_id` on invoice.

---

## Task 11: API — Payment Methods

**Files:** Create `app/api/payment-methods/route.ts` + `app/api/payment-methods/[id]/route.ts`

- [ ] **Step 1: `GET /api/payment-methods`** — scoped; returns sorted list.
- [ ] **Step 2: `POST /api/payment-methods`** — creates Stripe customer if needed; attaches PM to Stripe; stores in DB.
- [ ] **Step 3: `PATCH /api/payment-methods/:id`** — set as default.
- [ ] **Step 4: `DELETE /api/payment-methods/:id`** — detach from Stripe; remove from DB. Block if only PM and active enrollments exist.

---

## Task 12: API — Discounts + Webhook

**Files:** Create `app/api/discounts/route.ts`, `app/api/discounts/[id]/route.ts`, `app/api/webhooks/stripe/route.ts`

- [ ] **Step 1: `GET /api/discounts`** — FA/FM only.
- [ ] **Step 2: `POST /api/discounts`** — FA only; validate unique `planets_count`.
- [ ] **Step 3: `PATCH /api/discounts/:id`** — FA only.
- [ ] **Step 4: `POST /api/webhooks/stripe`** — verify signature using `stripe.webhooks.constructEvent`. Handle `payment_intent.succeeded` → `updateInvoiceStatus(paid)`. Handle `payment_intent.payment_failed` → `updateInvoiceStatus(failed)`. **Must use `export const config = { api: { bodyParser: false } }`** (raw body required for signature verification).

---

## Task 13: Customer Enroll UI — Refactor

**Files:** Modify `app/(app)/customer/enroll/page.tsx`; create `EnrollClient.tsx` + step components

- [ ] **Step 1: Refactor `page.tsx`** — Server Component; fetch planets list, customer's members, customer's default payment method. Pass as props to `EnrollClient`.
- [ ] **Step 2: Create `EnrollClient.tsx`** — owns `currentStep` state (1–6); renders active step component; passes state + handlers down.
- [ ] **Step 3: Create `StepVariant.tsx`** — planet select → level select → variant cards (1x/2x/3x per week) with real `location_course_offerings` price. Fetches via `GET /api/course-variants?levelId=`.
- [ ] **Step 4: Create `StepMember.tsx`** — radio card list from `initialMembers` prop. "Enroll myself" shortcut if customer is also a member.
- [ ] **Step 5: Create `StepBatches.tsx`** — fetch batches for selected location + level via `GET /api/batches?locationId=&levelId=`. Allow selecting **N slots** (N = `variant.frequencyPerWeek`). Show remaining capacity badge. Validate N slots selected before proceeding.
- [ ] **Step 6: Create `StepPayment.tsx`** — invoice preview card (enrollment line + setup fee if applicable + discount if applicable). Render `@stripe/react-stripe-js` `PaymentElement` for card; "Pay with Cash" option visible to FA/XA only. Submit → `POST /api/enrollments`.
- [ ] **Step 7: Create `StepConfirm.tsx`** — success card showing member name, variant, selected batch days/times, first payment amount, next billing date.

---

## Task 14: Customer Payments UI — Refactor

**Files:** Modify `app/(app)/customer/payments/page.tsx`

- [ ] **Step 1: Convert to Server Component** — fetch invoices + payment methods from real DB.
- [ ] **Step 2: Invoices tab** — expandable invoice rows with line items (description, amount, discount). Status badge (paid/pending/failed). Download PDF placeholder.
- [ ] **Step 3: Payment Methods tab** — card list with default badge. "Add Card" → renders Stripe Payment Element in modal; on confirm, `POST /api/payment-methods`. Delete card → `DELETE /api/payment-methods/:id`.

---

## Task 15: Admin Payments UI — Refactor

**Files:** Modify `app/(app)/admin/payments/page.tsx`

- [ ] **Step 1: Convert to Server Component** — fetch failed invoices + all invoices (scoped).
- [ ] **Step 2: Failed Payments section** — list with customer name, amount, failed date, "Retry" button → `POST /api/invoices/:id/retry` → refresh.
- [ ] **Step 3: All Invoices section** — filter by status, date range. Expandable rows with line items. "Waive" action for FA → sets `status = 'waived'` via PATCH + notes field.

---

## Task 16: Admin Discounts Page — New

**Files:** Create `app/(app)/admin/discounts/page.tsx` + `DiscountsClient.tsx`

- [ ] **Step 1: Server Component** — validate FA role; fetch `GET /api/discounts`.
- [ ] **Step 2: Client Component** — table: Planets Count | Discount % | Active toggle | Edit. Edit modal: update % via `PATCH /api/discounts/:id`. Add tier modal: new planets count + %. Delete: `DELETE /api/discounts/:id` (only if no active enrollments use that tier count).

---

## Task 17: Seed Data

**Files:** Create `scripts/seed-enrollment.ts`

- [ ] **Step 1: Seed 2 discount tiers** — `{ planets_count: 2, discount_pct: 5.00 }` and `{ planets_count: 3, discount_pct: 10.00 }`. Idempotent (skip by `planets_count` uniqueness).
- [ ] **Step 2: Seed 1 test enrollment** — Raj Sharma's first member, Chess PP 1x/week at Surrey Central. Snapshot offering price. No Stripe call — create as cash payment.
- [ ] **Step 3: Seed 1 paid invoice** — for the test enrollment. Current month, full price (no proration). `status = 'paid'`, `paid_at = now()`.

---

## Open Items (Deferred)

- [ ] **Monthly invoice cron job** — `generateMonthlyInvoices` DAL is built; the scheduled trigger (Supabase Edge Function with `pg_cron` or Vercel Cron) is wired in Module 15 (Notifications & Automation).
- [ ] **Tax calculation** — `tax = 0` at launch. No tax logic implemented.
- [ ] **Refund flow** — `status = 'refunded'` exists; Stripe refund API call + UI deferred.
- [ ] **Customer cancellation self-service** — 15-day rule enforced server-side; dedicated cancel UI flow in customer portal is scoped for polish pass.
- [ ] **Loyalty points display** — `customers.loyalty_points` auto-incremented by DB trigger on invoice paid; display in customer dashboard/profile is a follow-up task.
- [ ] **PDF invoice download** — placeholder button in UI; actual PDF generation (e.g. via React PDF or a Supabase Edge Function) deferred.
