# Module 8 — Enrollment & Billing: Design Spec

_Date: 2026-05-07_
_Status: Approved — ready for planning_

---

## Overview

Enrollment & Billing is the financial engine of Mentora. It covers the complete lifecycle from a customer selecting a program variant through to monthly recurring invoicing, Stripe payment processing, and cancellation.

Three sub-domains delivered in dependency order:

1. **Enrollment** — Member signs up for a `product_variant` at a `location`, selects N batch slots (N = `frequencyPerWeek`), and gets an `enrollment` record + N `enrollment_batches` rows.
2. **Billing** — Monthly invoices generated per customer, line items per active enrollment, Stripe payment intent or cash payment, retry on failure, proration of first month.
3. **Discounts & Setup Fees** — `discount_tiers` table (multi-planet monthly discounts), `member_planet_setup_fees` table (one-time setup fee tracked per member per planet, not per enrollment).

**Stack:** Next.js 16.2.2 App Router · Supabase Postgres · `@supabase/ssr` · Stripe Node SDK · TypeScript 5

**Supabase Project ID:** `nxocuhlrldrbbltiqkqh`

---

## Chosen Approach: Server-side enrollment with Stripe hosted payment element

Enrollment and billing logic all runs server-side (Next.js route handlers + Supabase). The Stripe **Payment Element** (hosted) is used for card collection — raw card numbers never touch our server. Admin cash payments bypass Stripe entirely and produce a `PAID` invoice directly.

### Why this approach

- **Stripe Payment Element over Stripe Checkout**: We keep customers inside the Mentora UI, avoid redirect-back flows, and can pre-fill known customer data (name, email). The Payment Element is PCI-compliant by default.
- **Server-side invoice generation over Stripe's subscription engine**: Mentora's invoicing rules (multi-planet discounts, first-month proration, setup fee per planet) are complex enough that delegating them to Stripe subscriptions would require significant metadata gymnastics. Generating invoices in our DB gives us full control and audit trails.
- **`member_planet_setup_fees` table over a boolean on `enrollments`**: A boolean `setup_fee_paid` on `enrollments` cannot handle a member enrolled in multiple planets — the second planet would need its own setup fee check. A dedicated tracking table (`member_id` + `planet_id`) is clean, queryable, and idempotent (see gaps.md §7).

### Alternatives Considered

**Option B — Stripe Subscriptions for recurring billing**
- Pro: Stripe handles the billing cycle, retries, and webhooks automatically.
- Con: Our discount structure (multi-planet, per-member, recalculated monthly) doesn't map cleanly to Stripe's coupon/promotion model. Would require significant hackery or a custom proration middleware. Monthly invoices in our DB remain the source of truth anyway for the admin UI.
- Not chosen.

**Option C — Single-batch enrollment (current mock model)**
- Pro: Simpler schema — `enrollment.batch_id` FK instead of a junction table.
- Con: A customer buying a `2x/week` variant needs 2 separate time slots (e.g. Tuesday + Thursday). A single FK silently drops one slot. This is explicitly flagged in gaps.md §3a.
- Not chosen: multi-batch junction table is required.

---

## Database

### `enrollments` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `member_id` | uuid | NOT NULL, FK → `members(id) ON DELETE CASCADE` | Who is enrolled |
| `customer_id` | uuid | NOT NULL, FK → `customers(id) ON DELETE CASCADE` | Billing contact |
| `product_variant_id` | uuid | NOT NULL, FK → `product_variants(id)` | What they're enrolled in |
| `location_id` | uuid | NOT NULL, FK → `locations(id)` | Where |
| `offering_price` | numeric(10,2) | NOT NULL | Snapshot of `location_course_offerings.price` at time of enrollment |
| `status` | varchar(20) | NOT NULL, default `'active'`, CHECK IN (`active`, `cancelled`, `suspended`) | |
| `enrolled_at` | timestamptz | NOT NULL, default now() | |
| `cancelled_at` | timestamptz | nullable | Set on cancellation |
| `cancellation_reason` | text | nullable | |
| `ownership_id` | uuid | NOT NULL, FK → `ownerships(id)` | Denormalized for RLS scoping |

**No `batch_id` column** — batch assignments live in `enrollment_batches`. See gaps.md §3a.

### `enrollment_batches` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `enrollment_id` | uuid | NOT NULL, FK → `enrollments(id) ON DELETE CASCADE` | |
| `batch_id` | uuid | NOT NULL, FK → `batches(id)` | One row per selected time slot |
| `created_at` | timestamptz | NOT NULL, default now() | |

UNIQUE constraint: `(enrollment_id, batch_id)`. The number of rows per `enrollment_id` must equal `product_variants.frequency_per_week` — validated at the API layer.

### `member_planet_setup_fees` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `member_id` | uuid | NOT NULL, FK → `members(id) ON DELETE CASCADE` | |
| `planet_id` | uuid | NOT NULL, FK → `planets(id)` | |
| `amount_charged` | numeric(10,2) | NOT NULL | Setup fee amount at time of charging |
| `paid_at` | timestamptz | NOT NULL, default now() | |

UNIQUE constraint: `(member_id, planet_id)` — setup fee is charged exactly once per member per planet, regardless of how many enrollments they have for that planet.

### `invoices` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `customer_id` | uuid | NOT NULL, FK → `customers(id) ON DELETE CASCADE` | |
| `ownership_id` | uuid | NOT NULL, FK → `ownerships(id)` | For admin scoping and reporting |
| `payment_method_id` | uuid | nullable, FK → `payment_methods(id)` | null = cash payment |
| `amount` | numeric(10,2) | NOT NULL | Pre-discount, pre-tax subtotal |
| `discount` | numeric(10,2) | NOT NULL, default 0 | Multi-planet discount applied |
| `tax` | numeric(10,2) | NOT NULL, default 0 | Reserved; not charged at launch |
| `total` | numeric(10,2) | NOT NULL | `amount - discount + tax` |
| `status` | varchar(20) | NOT NULL, default `'pending'`, CHECK IN (`pending`, `paid`, `failed`, `refunded`, `waived`) | |
| `due_date` | date | NOT NULL | Always the 1st of the billing month |
| `billing_period_start` | date | NOT NULL | First day of covered month |
| `billing_period_end` | date | NOT NULL | Last day of covered month |
| `stripe_pi_id` | varchar(255) | nullable | Stripe Payment Intent ID |
| `notes` | text | nullable | Admin-entered notes (e.g. "waived — hardship") |
| `issued_at` | timestamptz | NOT NULL, default now() | |
| `paid_at` | timestamptz | nullable | |

### `invoice_line_items` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `invoice_id` | uuid | NOT NULL, FK → `invoices(id) ON DELETE CASCADE` | |
| `enrollment_id` | uuid | nullable, FK → `enrollments(id)` | null for setup fee or ad-hoc lines |
| `description` | text | NOT NULL | "Chess PP 1x/week — October 2026" |
| `amount` | numeric(10,2) | NOT NULL | Before discount |
| `discount_amount` | numeric(10,2) | NOT NULL, default 0 | Multi-planet discount for this line |
| `reference_type` | varchar(30) | NOT NULL, CHECK IN (`enrollment`, `setup_fee`, `trial`, `adjustment`) | |
| `reference_id` | uuid | nullable | Points to enrollment or member_planet_setup_fees |

### `payment_methods` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `customer_id` | uuid | NOT NULL, FK → `customers(id) ON DELETE CASCADE` | |
| `stripe_pm_id` | varchar(255) | NOT NULL, UNIQUE | Stripe Payment Method ID (pm_...) |
| `last4` | varchar(4) | NOT NULL | Last 4 digits of card |
| `card_brand` | varchar(30) | NOT NULL | visa / mastercard / amex / discover |
| `exp_month` | smallint | NOT NULL | |
| `exp_year` | smallint | NOT NULL | |
| `is_default` | boolean | NOT NULL, default false | Only one default per customer |
| `created_at` | timestamptz | NOT NULL, default now() | |

### `discount_tiers` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `planets_count` | smallint | NOT NULL, UNIQUE | 2, 3, 4, 5 |
| `discount_pct` | numeric(5,2) | NOT NULL | e.g. 5.00 for 5% |
| `is_active` | boolean | NOT NULL, default true | FA can disable a tier |
| `created_at` | timestamptz | NOT NULL, default now() | |

---

## RLS Policies

### `enrollments`

| Policy | Operation | Condition |
|---|---|---|
| `customer_own_enrollments` | SELECT | `auth.uid() IN (SELECT profile_id FROM customers WHERE id = customer_id)` |
| `franchisor_all_enrollments` | ALL | `jwt role IN ('franchisor_admin', 'franchisor_mgmt')` |
| `franchisee_own_enrollments` | ALL | `ownership_id = jwt ownership_id::uuid` |
| `coach_read_enrollments` | SELECT | `jwt role = 'coach'` — further restricted to their batches at app layer |

### `enrollment_batches`

Same scoping as `enrollments` via join: `enrollment_id IN (SELECT id FROM enrollments WHERE ...)`.

### `invoices` + `invoice_line_items`

| Policy | Operation | Condition |
|---|---|---|
| `customer_own_invoices` | SELECT | `auth.uid() IN (SELECT profile_id FROM customers WHERE id = invoices.customer_id)` |
| `franchisor_all_invoices` | ALL | `jwt role IN ('franchisor_admin', 'franchisor_mgmt')` |
| `franchisee_own_invoices` | ALL | `ownership_id = jwt ownership_id::uuid` |

Customers cannot insert or update invoices — invoices are system-generated only.

### `payment_methods`

| Policy | Operation | Condition |
|---|---|---|
| `customer_own_payment_methods` | ALL | `auth.uid() IN (SELECT profile_id FROM customers WHERE id = customer_id)` |
| `franchisor_all_payment_methods` | SELECT | `jwt role IN ('franchisor_admin', 'franchisor_mgmt')` |
| `franchisee_own_payment_methods` | SELECT | Customer's `ownership_id` matches |

### `discount_tiers`

All authenticated roles: SELECT. FA only: INSERT, UPDATE, DELETE.

---

## TypeScript Type Fixes Required (from gaps.md)

Before wiring the UI, the following types in `lib/types.ts` must be updated:

### `Enrollment` — remove `batchId`, add `productVariantId` and `offeringPrice`

```typescript
// BEFORE (broken — single batchId cannot handle N-frequency variants)
interface Enrollment {
  batchId: ID;
  setupFeePaid: boolean;
  ...
}

// AFTER
interface Enrollment {
  productVariantId: ID;      // replaces batchId
  locationId: ID;            // where they're enrolled
  offeringPrice: number;     // snapshot of price at enrollment time
  ownershipId: ID;           // for scoping
  cancelledAt?: ISODateTime;
  cancellationReason?: string;
  ...
}

// New type
interface EnrollmentBatch {
  id: ID;
  enrollmentId: ID;
  batchId: ID;
}
```

### `Invoice` — add missing fields (gaps.md §4d)

```typescript
// Add to Invoice
interface Invoice {
  ...
  ownershipId: ID;              // for admin scoping
  dueDate: ISODate;             // always 1st of billing month
  billingPeriodStart: ISODate;
  billingPeriodEnd: ISODate;
  notes?: string;               // admin annotation
}
```

### `InvoiceLineItem` — add `discountAmount` and fix `referenceType`

```typescript
interface InvoiceLineItem {
  ...
  discountAmount: number;       // per-line discount
  referenceType: "enrollment" | "setup_fee" | "trial" | "adjustment";
  // Remove "event" | "camp" — not in Phase 1
}
```

### New type: `MemberPlanetSetupFee`

```typescript
interface MemberPlanetSetupFee {
  id: ID;
  memberId: ID;
  planetId: ID;
  amountCharged: number;
  paidAt: ISODateTime;
}
```

### New type: `DiscountTier`

```typescript
interface DiscountTier {
  id: ID;
  planetsCount: number;
  discountPct: number;
  isActive: boolean;
}
```

---

## Business Rules

### Setup Fee
- Charged **once per member per planet** across all their lifetime enrollments.
- Amount is sourced from `location_course_offerings.setup_fee` at enrollment time.
- `member_planet_setup_fees` is the source of truth. Before generating the setup fee line item, check if a row already exists for `(member_id, planet_id)`.
- If the member was already charged a setup fee for Chess (via a previous enrollment), and they re-enroll in Chess at a new location, **no new setup fee is charged**.

### First Month Proration
- Formula: `daily_rate × remaining_days_in_month`.
- `daily_rate = monthly_price / days_in_month`.
- If enrollment date is the 1st, no proration — full month charged.
- Proration only applies to the `enrollment` line item, not the setup fee.

### Multi-Planet Discount
- Applied monthly per member across all their active enrollment line items.
- Step 1: Count distinct planets for all active enrollments of that member.
- Step 2: Look up `discount_tiers` for that planet count.
- Step 3: Apply `discount_pct` to the subtotal of all enrollment line items for that member on that invoice.
- Setup fee lines are **excluded** from the discount.

### Cancellation
- Customer can request cancellation only with ≥ 15 days notice before next billing date (the 1st of the following month).
- If within 15 days: cancellation takes effect at the end of the **following** billing cycle.
- If ≥ 15 days: cancellation takes effect at end of **current** billing cycle.
- No refund of the current cycle's payment.
- Status set to `cancelled`; `cancelled_at` timestamped.

### Admin Cash Payment
- FA or XA can mark a payment as "Cash" when enrolling on behalf of a customer.
- Creates an invoice with `status = 'paid'`, `payment_method_id = null`, `stripe_pi_id = null`, `paid_at = now()`.
- No Stripe API call made.

---

## API Design

### `POST /api/enrollments`

Creates enrollment + batch slots + computes first invoice.

**Request body:**
```json
{
  "memberId": "uuid",
  "productVariantId": "uuid",
  "locationId": "uuid",
  "batchIds": ["uuid", "uuid"],
  "paymentMethodId": "uuid | null (null = cash)",
  "isCashPayment": false
}
```

**Flow:**
1. Validate session (CX: own customer only; FA/XA: any customer in scope).
2. Validate `batchIds.length === variant.frequency_per_week`.
3. Validate batch capacity not exceeded for each `batch_id`.
4. Snapshot `offering_price` from `location_course_offerings`.
5. Insert `enrollments` row + N `enrollment_batches` rows.
6. Determine if setup fee is owed (`member_planet_setup_fees` lookup).
7. Compute first-month invoice (prorated + setup fee if applicable).
8. If cash: create `PAID` invoice immediately.
9. If card: create Stripe PaymentIntent → return `client_secret` for frontend to confirm.
10. On Stripe confirmation (via webhook): mark invoice `PAID`, update `stripe_pi_id`.

**Response:** `201 { enrollmentId, invoiceId, clientSecret? }`

### `PATCH /api/enrollments/:id`

FA/XA only. Supports: `status` update (`suspended`, `cancelled`), `cancellationReason`.

**Request body:** `{ status, cancellationReason? }`

**Cancellation validation:** If `status = 'cancelled'`, enforce 15-day notice rule. Return `422` with explanation if too late.

**Response:** `200` with updated enrollment row.

### `GET /api/enrollments`

Query params: `customerId`, `memberId`, `batchId`. Scoped by role. Joins `enrollment_batches`, `product_variants`, `products`, `planets` for display.

### `GET /api/invoices`

Query params: `customerId`, `ownershipId`, `status`. Joins line items. Sorted by `due_date DESC`.

### `GET /api/invoices/:id`

Single invoice with full line items. Returns `404` (not `403`) for out-of-scope.

### `POST /api/invoices/:id/retry`

FA/XA only. Re-attempts Stripe charge for a `failed` invoice. Creates a new PaymentIntent against the customer's default payment method.

### `GET /api/payment-methods?customerId=`

CX (own), FA, XA. Returns all active payment methods sorted by `is_default DESC, created_at ASC`.

### `POST /api/payment-methods`

Accepts a Stripe `paymentMethodId` (returned by the Payment Element after the customer fills in card details). Attaches it to the Stripe customer via Admin API, stores the token in `payment_methods`. If `isDefault: true`, unsets any existing default first.

### `DELETE /api/payment-methods/:id`

Detaches from Stripe, removes row. Prevents deletion of the default method if other active enrollments exist.

### `GET /api/discounts`

FA/FM only. Returns all discount tiers ordered by `planets_count`.

### `POST /api/discounts` + `PATCH /api/discounts/:id`

FA only. Create or update a discount tier. Validates `planets_count` uniqueness.

---

## Data Access Layer

### `lib/db/enrollments.ts`

```typescript
listEnrollments(supabase, filters, session)        // EnrollmentRow[] — filters: customerId | memberId | batchId
getEnrollment(supabase, id, session)               // EnrollmentRow | null
createEnrollment(supabase, input)                  // EnrollmentRow (also creates enrollment_batches)
updateEnrollmentStatus(supabase, id, update)       // EnrollmentRow | null
listEnrollmentBatches(supabase, enrollmentId)      // EnrollmentBatchRow[]
```

### `lib/db/invoices.ts`

```typescript
listInvoices(supabase, filters, session)           // InvoiceRow[] with line items
getInvoice(supabase, id, session)                  // InvoiceRow with line items | null
createInvoice(supabase, input)                     // InvoiceRow (used by POST /api/enrollments)
updateInvoiceStatus(supabase, id, update)          // InvoiceRow
generateMonthlyInvoices(supabase, ownershipId)     // InvoiceRow[] — called by cron/admin action
```

### `lib/db/paymentMethods.ts`

```typescript
listPaymentMethods(supabase, customerId, session)  // PaymentMethodRow[]
addPaymentMethod(supabase, input)                  // PaymentMethodRow
setDefaultPaymentMethod(supabase, id, customerId)  // void
removePaymentMethod(supabase, id)                  // void
```

### `lib/db/discounts.ts`

```typescript
listDiscountTiers(supabase)                        // DiscountTierRow[]
getDiscountTierForCount(supabase, count)           // DiscountTierRow | null
upsertDiscountTier(supabase, input)                // DiscountTierRow
```

### `lib/billing/invoice.ts` (business logic, not DB)

```typescript
computeFirstMonthAmount(price, enrollmentDate)     // number (prorated)
computeMultiPlanetDiscount(lineItems, tiers, memberActivePlanetCount) // number
buildInvoiceLineItems(enrollments, setupFees)      // InvoiceLineItemInput[]
```

---

## Page Architecture

### Customer → Enroll (`/customer/enroll`) — REFACTOR

The existing mock multi-step enrollment flow (`page.tsx`, 685 lines) must be refactored into:

1. **Step 1 — Select Planet & Level**: Fetches real catalog via `GET /api/planets` → dropdown of active planets → active levels for selected planet.
2. **Step 2 — Select Variant (frequency)**: Fetches `GET /api/course-variants?levelId=` → shows 1x/2x/3x/week options with location-specific prices from `location_course_offerings`.
3. **Step 3 — Select Member**: Lists the customer's members (from `customers` join); checkbox to enroll self.
4. **Step 4 — Select Batch Slots**: Must allow selection of **N slots** where N = `variant.frequencyPerWeek`. Currently broken — selects only 1. Grid of available batch slots (day + time + remaining capacity) filtered by `location_id`. Capacity check via `batches.max_capacity - count(enrollment_batches)`.
5. **Step 5 — Payment**: Shows invoice preview (prorated first month + setup fee if applicable + multi-planet discount if applicable). Renders Stripe Payment Element if card payment; cash option for FA/XA. Submit → `POST /api/enrollments`.
6. **Step 6 — Confirmation**: Shows enrollment summary, next billing date, enrolled batches.

**Architecture:** Break the 685-line single-file component into:
- `page.tsx` — Server Component; fetches initial data (planets, customer's members, default payment method).
- `EnrollClient.tsx` — Client Component; owns step state machine.
- `steps/StepVariant.tsx`, `StepMember.tsx`, `StepBatches.tsx`, `StepPayment.tsx`, `StepConfirm.tsx` — individual step components.

### Customer → Payments (`/customer/payments`)

Refactor from mock to real data:
- **Invoices tab**: `GET /api/invoices?customerId=` → sortable list, expandable line items.
- **Payment Methods tab**: `GET /api/payment-methods?customerId=` → card list with default badge, add card via Stripe Payment Element, delete card.

### Admin → Payments (`/admin/payments`)

Refactor from mock to real data:
- **Failed Payments** section: invoices with `status = 'failed'`, with "Retry" button → `POST /api/invoices/:id/retry`.
- **All Invoices** section: filterable by ownership, status, date range.

### Admin → Discounts (`/admin/discounts`) — NEW

FA-only page:
- Table of discount tiers (planets count → discount %).
- Edit inline or via modal → `PATCH /api/discounts/:id`.
- Add tier → `POST /api/discounts`.

---

## Role Access Summary

| Action | FA | FM | XA | XM | CO | CX |
|---|---|---|---|---|---|---|
| Enroll a member | ✅ | ❌ | ✅ own | ❌ | ❌ | ✅ self |
| View enrollments | ✅ all | ✅ all | ✅ own | ❌ | ✅ (their batches) | ✅ self |
| Cancel enrollment | ✅ | ❌ | ✅ own | ❌ | ❌ | ✅ self (15d rule) |
| View invoices | ✅ all | ✅ all | ✅ own | ✅ own (read) | ❌ | ✅ self |
| Retry failed invoice | ✅ | ❌ | ✅ own | ❌ | ❌ | ❌ |
| Manage payment methods | ✅ | ❌ | ✅ own | ❌ | ❌ | ✅ self |
| Manage discount tiers | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## Stripe Integration

### Stripe objects used

| Stripe Object | Our Usage |
|---|---|
| `Customer` | One per customer; `stripe_customer_id` stored on `customers` table |
| `PaymentMethod` | Card token; stored in `payment_methods.stripe_pm_id` |
| `PaymentIntent` | Created per invoice; `stripe_pi_id` stored on `invoices` |
| `Payment Element` | Hosted card input; embedded in Step 5 of enrollment flow |

### Stripe Customer creation

On first card enrollment:
1. If `customers.stripe_customer_id` is null, call `stripe.customers.create({ email, name })`.
2. Store returned `id` in `customers.stripe_customer_id`.
3. Attach the Payment Method to the Stripe Customer.

### Webhook events handled

| Event | Action |
|---|---|
| `payment_intent.succeeded` | Set `invoices.status = 'paid'`, set `paid_at = now()` |
| `payment_intent.payment_failed` | Set `invoices.status = 'failed'` |

Webhook endpoint: `POST /api/webhooks/stripe` — **verify Stripe signature**, `STRIPE_WEBHOOK_SECRET` env var required.

### Environment variables required

```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Demo / Seed Data

- 2 discount tiers: `2 planets → 5%`, `3 planets → 10%`.
- 1 test enrollment for "Raj Sharma"'s first member in Chess PP 1x/week at Surrey Central.
- 1 paid invoice for that enrollment (current month, setup fee included).
- 1 test payment method (Stripe test card token — only visible in test mode).

---

## What This Module Does NOT Cover

- **Stripe Subscriptions**: We use Payment Intents, not Subscriptions. Monthly charges are initiated server-side by a cron or admin action.
- **Cron job for monthly invoice generation**: The `generateMonthlyInvoices` DAL function is built; the cron trigger (Supabase Edge Function on a schedule or Vercel Cron) is deferred to Module 15 (Notifications) where the full notification + billing cycle runner is set up.
- **Tax calculation**: `tax` column exists; tax logic is not implemented at launch. `tax = 0` always.
- **Refunds**: `invoices.status = 'refunded'` status exists; the Stripe refund API call and UI are deferred.
- **Member self-cancellation portal**: Customers can request cancellation; the 15-day enforcement logic is server-side. A dedicated "Cancel Enrollment" UI flow for the customer portal is scoped for Module 8 but the exact UX (confirmation modal + notice period display) is defined during implementation.
- **Multi-currency**: All amounts are CAD. No currency conversion.
- **Loyalty points update**: `customers.loyalty_points` should be incremented on invoice payment (`$1 CAD = 1 pt`). A DB trigger is the right mechanism; defined in this module, implemented as part of invoice status update.
