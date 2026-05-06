# Mentora — Schema ↔ UX Gap Analysis

_Generated: 2026-05-04_
_Updated: 2026-05-04 — added Section 8 for per-tenant deployment architecture gaps_

Organized by severity. Issues marked **[SQL BUG]** mean the schema file won't execute as written.

---

## 1. SQL Schema Internal Bugs

These exist entirely within the schema file and must be fixed before the schema can be applied.

| # | Location | Bug |
|---|---|---|
| S1 | `enrollments` table | `UNIQUE (member_id, batch_id)` — `batch_id` is not a column in this table (it lives in `enrollment_batches`). |
| S2 | `rosters` table | `UNIQUE (location_id, week_start_date)` — `location_id` is not a column in `rosters` (column is `ownership_id`). |
| S3 | `lms_quiz_questions` | `CHECK (reference_type IN ('Single', 'Multiple'))` — the column name is `answer_type`, not `reference_type`. |
| S4 | `lms_quiz_questions` | Missing comma before `sort_order INTEGER NOT NULL DEFAULT 0`. DDL will fail to parse. |
| S5 | `lms_quiz_answer_options` | Same missing comma before `sort_order`. |
| S6 | `lms_product_sale_product_mapping` | `sale_product_id UUID NOT NULL;` — semicolon instead of comma breaks the `CREATE TABLE`. |
| S7 | Index section | Indexes defined on nonexistent tables: `sessions`, `events`, `event_registrations`. Also `idx_attendance_session ON attendance(session_id)` — `session_id` is not a column in `attendance` (it's `roster_assignment_id`). |

---

## 2. Missing Tables / Entire Sections

These features are used by live UX pages but have no corresponding SQL table.

### 2a. Events & Event Registrations (Section 9 entirely absent)
- `app/(app)/admin/events/page.tsx` and `app/(app)/customer/events/page.tsx` both import `Event` / `EventRegistration` types.
- The SQL schema jumps from Section 8 (Trials) to Section 10 (Notifications) — no `events`, `event_registrations`, or `event_custom_fields` tables. The index section references them, confirming they were intended but never written.
- **Fix:** Add `events`, `event_custom_fields`, and `event_registrations` tables to the schema.

### 2b. Member Achievements
- `app/(app)/coach/achievements/page.tsx` uses `MemberAchievement` from `lib/types.ts`.
- No `member_achievements` (or equivalent) table exists in the SQL schema.
- **Fix:** Add a `member_achievements` table: `id`, `member_id`, `awarded_by_profile_id`, `badge_name`, `notes`, `awarded_at`.

### 2c. LMS Quiz Attempts
- `lib/types.ts` defines `LmsQuizAttempt` (used by the customer LMS portal and progression gating per user stories).
- No `lms_quiz_attempts` table in the schema.
- **Fix:** Add `lms_quiz_attempts`: `id`, `quiz_id`, `member_id`, `score`, `passed`, `attempted_at`.

---

## 3. Critical Model Mismatches (TypeScript ↔ SQL)

These will cause direct runtime failures when the mock layer is replaced with real queries.

### 3a. Enrollment is single-batch; schema is multi-batch
- TypeScript `Enrollment` has a single `batchId: ID`.
- SQL correctly uses a separate `enrollment_batches` junction table (many enrollments → many batches), because a "2x/week" variant requires the customer to pick 2 separate day slots.
- The enroll flow's Step 4 says **"Select 1 time slot"** and stores a single `batch: Batch | null` — this silently breaks multi-frequency enrollment. A customer who buys a 2x/week Math variant will only have 1 batch slot registered.
- **Fix in types:** Remove `batchId` from `Enrollment`; add `productVariantId: ID`. Add a new `EnrollmentBatch` type.
- **Fix in UX:** Step 4 needs to allow selection of N slots where N = `variant.frequencyPerWeek`, not just 1.

### 3b. `PriceChangeRequest.requestingOwnershipId` vs. SQL `requesting_location_id`
- TypeScript: `requestingOwnershipId: ID`
- SQL: `requesting_location_id UUID NOT NULL REFERENCES locations(id)`
- The SQL design is correct — price overrides are per-location per-product-variant (different locations under the same franchisee can have different prices). Using `ownershipId` makes it impossible to show which specific location is requesting the change.
- `app/(app)/franchisee-admin/price-requests/page.tsx` will display incorrect scope.
- **Fix in types:** Rename to `requestingLocationId: ID`.

### 3c. `Roster` location vs. ownership
- TypeScript `Roster`: `locationId: ID`
- SQL `rosters`: `ownership_id UUID NOT NULL REFERENCES ownerships(id)`
- The admin roster pages filter and display by location, so using ownership as the roster key is too coarse — one roster would span multiple locations.
- **Recommendation:** Change SQL to key rosters by `location_id` (matches TypeScript and user story intent: "assign coaches to sessions by locations"). This also fixes SQL Bug S2.

### 3d. `CoachAvailability` / `CoachLeave` use `coachId`; SQL uses `profile_id`
- TypeScript `CoachAvailability.coachId`, `CoachLeave.coachId`
- SQL `staff_availability.profile_id`, `staff_leaves.profile_id`
- No mapping between `Coach.id` and `profile_id` exists in either the TypeScript types or the mock data. When wiring to real queries, joins will fail.
- **Fix:** Either add `profileId` to the TypeScript `Coach` type (bridging the two), or consistently use `profileId` throughout.

---

## 4. Feature Gaps (schema supports it; UX can't fully use it)

### 4a. `Holiday` missing `ownershipId` in SQL
- TypeScript `Holiday` has `ownershipId?: ID` to model ownership-level holidays (e.g., "all TLP locations closed Christmas").
- SQL `holidays` only has `location_id` (nullable for "all locations in the ownership"). There is no `ownership_id` column.
- Result: ownership-wide holiday entries from `lib/mock/holidays` will have no SQL home.
- **Fix:** Add `ownership_id UUID REFERENCES ownerships(id)` to `holidays`, with a CHECK ensuring at least one of `ownership_id` or `location_id` is set.

### 4b. `LocationCourseOffering` missing price fields in TypeScript
- SQL `location_course_offerings` captures `price` and `setup_fee` per location (the per-franchisee price override that gets populated at enrollment time and re-snapshotted on price-change approval).
- TypeScript `LocationCourseOffering` only has `{ id, locationId, levelId, isActive }` — no price fields.
- The franchisee pricing UX (current price vs. requested price) relies on this per-location price. Without it, the enroll flow also can't show the correct location-specific price.
- **Fix:** Add `price: number` and `setupFee: number` to the TypeScript `LocationCourseOffering` type and update mock data accordingly.

### 4c. `AttendanceStatus` is incomplete
- SQL defines 7 statuses: `expected`, `present`, `absent`, `makeup booked`, `trial booked`, `makeup attended`, `trial attended`
- TypeScript only has 4: `"expected" | "present" | "absent" | "makeup"`
- The sessions/attendance UX will be unable to differentiate a makeup that is booked vs. attended, or distinguish trial attendance from makeup attendance — both operationally important.
- **Fix:** Expand the TypeScript union to match SQL.

### 4d. `Invoice` missing `ownershipId`, `dueDate`, `notes`
- SQL `invoices`: `ownership_id`, `due_date`, `notes`
- TypeScript `Invoice`: none of these three fields
- Admin payments page filters by ownership; `dueDate` is needed for overdue detection; `notes` for waived-payment explanations.
- **Fix:** Add all three to the TypeScript `Invoice` type.

### 4e. `LmsQuiz.passingScorePct` missing from SQL
- User stories confirm: "Coach-configurable per quiz" passing score.
- TypeScript `LmsQuiz` has `passingScorePct: number`.
- SQL `lms_quizzes` has no such column.
- **Fix:** Add `passing_score_pct NUMERIC(5,2) NOT NULL DEFAULT 70` to `lms_quizzes`.

### 4f. `Member` missing `gender` in TypeScript
- SQL `members` has `gender VARCHAR(20)`.
- TypeScript `Member` type does not have a `gender` field.
- User stories require gender on member profiles.
- **Fix:** Add `gender?: string` to `Member`.

### 4g. `Customer` has `gender` and `cfcId`; SQL `customers` table does not
- TypeScript `Customer` has `gender?: string` and `cfcId?: string`.
- User stories place these on the customer registration form.
- SQL `customers` table has neither column — both currently only live on `members`.
- **Fix:** Add `gender VARCHAR(20)` and `cfc_id VARCHAR(100)` to the SQL `customers` table.

---

## 5. LMS Hierarchy Disconnect

### 5a. Separate LMS hierarchy is invisible to TypeScript
- SQL has a fully independent LMS hierarchy: `lms_planets` → `lms_products` → `lms_modules` → `lms_topics`, linked back to the sales hierarchy via `lms_product_sale_product_mapping`.
- TypeScript skips this entirely — `LmsModule.levelId` goes directly to the sales `Level` type.
- The mapping table (`lms_product_sale_product_mapping`) has no TypeScript equivalent.
- In the prototype this works fine, but when you wire Supabase you'll need `lms_planets`, `lms_products`, and the mapping type to query the LMS DB separately.
- **Recommendation:** Add `LmsPlanet`, `LmsProduct`, and `LmsProductSaleMapping` TypeScript types now, even if mock data is flat. This will prevent a painful refactor when the LMS is split to a separate DB (as the schema comment notes is planned).

### 5b. `LmsQuizQuestion` single-answer model vs. SQL multi-answer model
- SQL has a separate `lms_quiz_answer_options` table with an `is_correct_answer` boolean per option, supporting multiple correct answers (for `answer_type = 'Multiple'`).
- TypeScript `LmsQuizQuestion` uses `options: string[]` and `correctAnswer: string` (single string) — it cannot model multi-correct questions.
- **Fix:** Replace TypeScript's `options`/`correctAnswer` fields with an `LmsAnswerOption` sub-type array that includes `isCorrect: boolean`.

---

## 6. Coach Entity Has No SQL Home

- TypeScript has a `Coach` type with: `status: "active" | "on_leave" | "inactive"`, `planetIds: ID[]`, `phone`, `locationId`.
- SQL has no `coaches` table — coaches are plain `profiles` rows with `role_id = 'coach'`.
- **Three specific gaps:**
  - `Coach.status` — has to be derived at query time from `staff_leaves` (today has a leave = "on_leave"). There is no persistent status column.
  - `Coach.planetIds[]` — there is no `coach_planets` or `staff_planets` junction table in the schema. The coach/students and admin/coaches pages display planet assignments; they'll have no data source.
  - `Coach.phone` — not on `profiles`. Needs to be added or sourced from elsewhere.
- **Recommendation:** Add a `staff_planets` table (`profile_id`, `planet_id`, `UNIQUE`) and add `phone VARCHAR(30)` to `profiles`. Derive `status` dynamically rather than storing it.

---

## 7. Minor Naming Inconsistencies

These won't break the prototype but will cause confusion during backend wiring.

| TypeScript name | SQL column name | Impact |
|---|---|---|
| `Level` type | `products` table | Same concept, different names |
| `CourseVariant` type | `product_variants` table | Same concept, different names |
| `userId` on many types | `profile_id` in SQL | Every join will need a mental translation |
| `Session` type | No `sessions` table (derived from `roster_assignments`) | Intermediate abstraction with no SQL backing |
| `EnrollmentDiscount` type | No SQL table | TypeScript-only, no persistence path |
| `setup_fee` scope | SQL: per `product_variant`; user stories: "per member per Planet" | The `setup_fee_paid` boolean on `enrollments` doesn't track which planets have had the setup fee paid — a member's second-planet enrollment would incorrectly skip the fee |

---

---

## 8. Deployment Architecture Note

_Clarified: one Vercel deployment + one Supabase DB per **brand** (e.g. The Learning Planet).
All ownerships (corporate + all franchisees), their locations, coaches, customers, and data
coexist in the same DB. `ownership_id` remains necessary throughout the schema to distinguish
corporate data from franchisee data within that DB._

No cross-deployment API calls, no master-data sync, no fan-out aggregation. All reports,
price change requests, and roster operations are simple intra-DB queries.

The only per-deployment configuration needed is:
- `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (standard Supabase env vars)
- `STRIPE_SECRET_KEY` (per-brand Stripe account)

---

## Summary Checklist

| Priority | Count | Action |
|---|---|---|
| Fix SQL before apply | 7 | Fix bugs S1–S7 in schema file |
| Add missing tables | 3 | `events`/`event_registrations`, `member_achievements`, `lms_quiz_attempts` |
| Fix type/schema mismatches | 4 | Enrollment multi-batch, `PriceChangeRequest` location scope, Roster ownership→location, CoachAvailability profile bridging |
| Fill feature gaps | 7 | Holiday ownership_id, LocationCourseOffering price, AttendanceStatus, Invoice fields, Quiz passing score, Member gender, Customer gender/cfcId |
| LMS refactor | 2 | Add LMS type hierarchy, fix quiz answer model |
| Coach entity | 1 | Add `staff_planets` table, add phone to profiles |
| Setup fee per-planet | 1 | Consider a `member_planet_setup_fees` tracking table instead of a single boolean |
