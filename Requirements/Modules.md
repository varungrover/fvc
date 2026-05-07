# Mentora — Module Delivery Map

_Last updated: 2026-05-05_

Each module entry defines the bounded domain, its database ownership, API surface, UI pages,
role access, and inter-module dependencies. Use this to sequence sprints, assign work,
and track delivery status.

**Role abbreviations:** `FA` Franchisor Admin · `FM` Franchisor Management · `XA` Franchisee Admin · `XM` Franchisee Management · `CO` Coach · `CX` Customer · `PUB` Public (unauthenticated)

**Status legend:** `[ ]` Not started · `[~]` In progress · `[x]` Done

---

## Delivery Order (Critical Path)

Modules must be delivered in this sequence — each row depends on everything above it being at
least schema-complete and API-ready.

```
1. Auth & Identity
2. Tenancy & Ownerships
3. Catalog, Locations & Offerings (depends on 2)
5. Scheduling & Batches           (depends on 3)
6. Coach & Staff                 (depends on 2, 3)
7. Customer & Member             (depends on 2)
8. Enrollment & Billing          (depends on 3, 5, 6, 7)
9. Roster                        (depends on 5, 6)
10. Attendance, Sessions & Trials (depends on 5, 6, 7, 8, 9)
13. LMS & Content                (depends on 3, 7)
15. Notifications                (depends on 8, 10)
16. Reporting & Analytics        (depends on 8, 10)
17. Price Change Requests & Support Tickets (depends on 2, 3)
19. Public Storefront            (depends on 3)
```

---

## Module 1 — Auth & Identity

**Domain:** Authentication, session lifecycle, 2FA, role resolution.

### Database tables
| Table | Purpose |
|---|---|
| `profiles` | One row per user; holds `role_id`, `ownership_id`, hashed password |
| `roles` | Enum: FA, FM, XA, XM, CO, CX |
| `sessions` (auth, not class) | JWT refresh tokens / session tracking |

### API routes
| Method | Path | Roles |
|---|---|---|
| POST | `/api/auth/login` | PUB |
| POST | `/api/auth/logout` | All |
| GET | `/api/auth/me` | All |
| POST | `/api/auth/change-password` | All |
| POST | `/api/auth/2fa/verify` | CX, FA, XA |

### UI pages
| Page | Role |
|---|---|
| `/login` | PUB |
| Settings → Change Password section | All |

### Role access summary
All roles pass through Auth. 2FA gate is enforced before exposing PII on customer and admin
profiles (roles: CX, FA, XA).

### Dependencies
None — this is the foundation for every other module.

### Notes
- JWT carries `profile_id`, `role_id`, `ownership_id`. All downstream modules read these claims; they never re-query profiles to resolve ownership scope.
- 2FA channel: SMS or authenticator app (decided). At launch, trigger via Supabase Auth or a thin wrapper; do not build a custom OTP service.
- Temp-password flow (used by Coach and Ownership creation modules) is owned here: system sets a random password and emails the user; on first login, change-password is forced.

---

## Module 2 — Tenancy & Ownerships

**Domain:** Deployment-level isolation model, franchisor vs. franchisee ownership records,
management account creation.

### Database tables
| Table | Purpose |
|---|---|
| `ownerships` | Corporate or franchisee entities within this deployment |

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/ownerships` | FA, FM |
| POST | `/api/ownerships` | FA |
| GET | `/api/ownerships/:id` | FA, FM, XA, XM |
| PATCH | `/api/ownerships/:id` | FA |

### UI pages
| Page | Role |
|---|---|
| Admin → Planets (ownership context panel) | FA |
| Franchisee Admin → Dashboard (own ownership info) | XA, XM |

### Role access summary
FA creates and edits all ownerships. FM reads all. XA/XM read their own only.

### Dependencies
- Module 1 (Auth) — ownership scope is embedded in the JWT.

### Notes
- Creating an ownership triggers Module 1's temp-password flow to email the new management account.
- Each Vercel + Supabase deployment is a single brand (e.g. The Learning Planet). All ownerships in that brand coexist in the same DB — there is no cross-deployment data.
- `ownership_id` is the primary scoping key throughout the entire system. Every other module that filters by ownership reads this from the caller's JWT claim.

---

## Module 3 — Catalog, Locations & Offerings

**Domain:** The full "what and where" setup layer: global course catalog (Planets → Levels →
Variants), physical locations per ownership, which variants are active at each location with
local price overrides, and the holiday calendar.

> **Scope note:** Catalog writes are FA-only (global). Location and offering writes are FA + XA
> (per-ownership). Keep this distinction in mind when implementing role guards.

### Database tables
| Table | Purpose |
|---|---|
| `planets` | Top-level subject: Chess, Math, English, Finance, Arts — global, FA-owned |
| `products` (Levels in UX) | Named level under a planet: PP, RR, Grade 7 — global |
| `product_variants` | Frequency/price variant: 1×/week $159, 2×/week $199 — global |
| `locations` | Address, active flag, `ownership_id` — per-ownership |
| `location_course_offerings` | Which `product_variant` is active at a location; local `price` and `setup_fee` overrides |
| `holidays` | Date + optional `ownership_id` or `location_id` scope |

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/planets` | All |
| POST | `/api/planets` | FA |
| PATCH | `/api/planets/:id` | FA |
| DELETE | `/api/planets/:id` | FA |
| GET | `/api/levels?planetId=` | All |
| POST | `/api/levels` | FA |
| PATCH | `/api/levels/:id` | FA |
| DELETE | `/api/levels/:id` | FA |
| GET | `/api/course-variants?levelId=` | All |
| POST | `/api/course-variants` | FA |
| PATCH | `/api/course-variants/:id` | FA |
| DELETE | `/api/course-variants/:id` | FA |
| GET | `/api/locations?ownershipId=` | FA, FM, XA, XM, CO |
| POST | `/api/locations` | FA, XA |
| GET | `/api/locations/:id` | FA, FM, XA, XM, CO |
| PATCH | `/api/locations/:id` | FA, XA |
| GET | `/api/locations/:id/offerings` | FA, XA, CO, CX |
| POST | `/api/locations/:id/offerings` | FA, XA |
| PATCH | `/api/locations/:id/offerings/:offeringId` | FA, XA |
| GET | `/api/holidays?ownershipId=&locationId=` | FA, XA, CO |
| POST | `/api/holidays` | FA, XA |
| DELETE | `/api/holidays/:id` | FA, XA |

### UI pages
| Page | Role |
|---|---|
| Admin → Planets (list + levels + variants) | FA |
| Admin → Locations (list + detail) | FA |
| Admin → Holidays | FA |
| Franchisee Admin → Locations | XA |
| Franchisee Admin → Holidays | XA |
| Public storefront (catalog read-only display) | PUB |
| Customer → Enroll (step 1: pick planet/level/variant) | CX |

### Role access summary
Catalog (planets/levels/variants): FA creates and modifies; all roles read.
Locations and offerings: FA sees all ownerships; XA sees own only; CO reads assigned locations; CX reads offerings during enrollment.

### Dependencies
- Module 1 (Auth)
- Module 2 (Ownerships) — locations belong to an ownership; catalog planets belong to the franchisor

### Notes
- `products` table is the SQL name for what the UX calls "Levels" — maintain this mapping during backend wiring.
- `location_course_offerings` carries `price` and `setup_fee` — enrollment prices from here, not the variant's base price. **Do not skip these fields** (see gaps.md §4b).
- Multi-planet discount (Module 8) references Planets for discount tier calculation — catalog must be stable before Enrollment is built.
- Holidays feed into Module 9 (Roster) for automatic session exclusion.
- Franchisee Admin can enter their own ownership's holidays; Franchisor Admin covers corporate locations.
- The LMS content hierarchy (Module 13) maps onto Levels via `lms_product_sale_product_mapping`. Catalog does not own that mapping.

---

## Module 5 — Scheduling & Batches

**Domain:** Recurring batch slots — day of week, time, capacity, location, level. Defines
the grid of available class seats that enrollment fills.

### Database tables
| Table | Purpose |
|---|---|
| `batches` | `location_id`, `level_id`, day, start/end time, max capacity |

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/batches?locationId=&levelId=` | All |
| POST | `/api/batches` | FA, XA |
| PATCH | `/api/batches/:id` | FA, XA |
| DELETE | `/api/batches/:id` | FA, XA |

### UI pages
| Page | Role |
|---|---|
| Admin → Locations → Batch drill-down | FA |
| Franchisee Admin → Locations → Batch drill-down | XA |
| Customer → Enroll (step 2: pick batch slots) | CX |
| Public storefront (capacity count display) | PUB |

### Role access summary
FA/XA create and edit batches for their locations. All authenticated roles and PUB read
capacity counts.

### Dependencies
- Module 3 (Catalog, Locations & Offerings) — batch belongs to a location and is for a level

### Notes
- A batch is a recurring slot (e.g. "Monday 4–5 pm"). Individual session occurrences are
  derived in Module 10 (Attendance) from the roster.
- Capacity enforcement: `enrolled_count` is computed at query time from active `enrollment_batches` rows; it is not stored on the batch. Enforce a server-side check on enrollment to prevent overbooking.
- For multi-frequency variants (2×/week), the customer picks N distinct batch slots at checkout — one per frequency unit. The enroll API creates N `enrollment_batches` rows (see gaps.md §3a).

---

## Module 6 — Coach & Staff [COMPLETE]

**Domain:** Coach profile management, planet assignments, availability schedule, and leaves.


### Database tables
| Table | Purpose |
|---|---|
| `profiles` (role = coach) | Shared with Auth; coach rows have `role_id = 'coach'`, `ownership_id` |
| `staff_planets` | Junction: `profile_id` ↔ `planet_id` (to be added — see gaps.md §6) |
| `staff_availability` | Weekly recurring availability by day |
| `staff_leaves` | Date-range absences; drives `status` derivation |

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/coaches?ownershipId=` | FA, XA, FM, XM |
| POST | `/api/coaches` | FA, XA |
| GET | `/api/coaches/:id` | FA, XA, CO (own) |
| PATCH | `/api/coaches/:id` | FA, XA |
| GET | `/api/coaches/:id/availability` | FA, XA, CO (own) |
| PUT | `/api/coaches/:id/availability` | CO (own), FA, XA |
| GET | `/api/coaches/:id/leaves` | FA, XA, CO (own) |
| POST | `/api/coaches/:id/leaves` | CO (own), FA, XA |
| DELETE | `/api/coaches/:id/leaves/:leaveId` | CO (own), FA, XA |

### UI pages
| Page | Role |
|---|---|
| Admin → Coaches (list + detail) | FA |
| Franchisee Admin → Coaches | XA |
| Coach → Availability | CO |

### Role access summary
FA/XA manage coach accounts for their ownership. Coaches can only read/write their own
availability and leaves.

### Dependencies
- Module 1 (Auth) — coach account is a `profiles` row; creation triggers temp-password email
- Module 2 (Ownerships) — coach belongs to an ownership
- Module 3 (Catalog) — planet assignments via `staff_planets`

### Notes
- Coach `status` ("active", "on_leave", "inactive") is **derived at query time** from `staff_leaves`, not stored. A coach is "on_leave" if today falls within any of their leave entries (see gaps.md §6).
- `staff_planets` junction table is missing from the current schema and must be added before this module can be wired (see gaps.md §6).
- Availability and leaves feed directly into Module 9 (Roster) generation.
- Creating a coach account sends a temp-password email — this uses the same Module 1 flow as ownership creation.

---

## Module 7 — Customer & Member [COMPLETE — Pending 2FA Unmasking]

**Domain:** Customer account registration and management, member profiles under a customer
account, PII masking, 2FA-gated PII access, loyalty point display.

### Database tables
| Table | Purpose |
|---|---|
| `customers` | Account holder; billing contact; Stripe `customer_id` |
| `members` | Learner profiles under a customer; `customer_id` FK |

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/customers?ownershipId=` | FA, XA, FM, XM |
| POST | `/api/customers` | FA, XA, CX (self-register) |
| GET | `/api/customers/:id` | CX (own), FA, XA |
| PATCH | `/api/customers/:id` | CX (own), FA, XA |
| GET | `/api/members?customerId=` | CX (own), FA, XA, CO |
| POST | `/api/members` | CX, FA, XA |
| GET | `/api/members/:id` | CX (own), FA, XA, CO |
| PATCH | `/api/members/:id` | CX (own), FA, XA |
| DELETE | `/api/members/:id` | FA, XA |

### UI pages
| Page | Role |
|---|---|
| `/login` (self-register path) | PUB |
| Customer → Members | CX |
| Customer → Settings | CX |
| Admin → Customers (list + detail) | FA |
| Franchisee Admin → Customers | XA |

### Role access summary
CX manages their own account and member profiles. FA/XA manage customers in their ownership.
CO reads member details for enrolled students (no PII fields).

### Dependencies
- Module 1 (Auth) — customer account is a `profiles` row (CX role)
- Module 2 (Ownerships) — customer is scoped to an ownership

### Notes
- PII masking rule: DOB, email, gender, phone, billing address are masked by default in API responses. Add a `x-2fa-verified: true` header (set by the 2FA middleware) to unmasked responses.
- "Register me as a member" shortcut: on self-registration, a checkbox copies contact info from the customer profile to a new member profile automatically.
- Loyalty points: `loyalty_points` are computed as total spend / 1 CAD = 1 point. Display only at launch; no redemption logic needed.
- `members.t_shirt_size`, `members.preferred_color`, `members.grade` are display fields — store but no business logic needed at launch.

---

## Module 8 — Enrollment & Billing

**Domain:** The full enrollment lifecycle: checkout, Stripe payment, recurring monthly billing,
multi-planet discounts, setup fees, cancellation, invoice management, payment method management.

### Database tables
| Table | Purpose |
|---|---|
| `enrollments` | Active enrollment: `member_id`, `product_variant_id`, `location_id`, status |
| `enrollment_batches` | Junction: one row per batch slot selected (N rows for N-frequency variants) |
| `invoices` | Monthly invoice per customer; `ownership_id`, `due_date`, `notes` |
| `invoice_line_items` | Per enrollment line on an invoice |
| `payment_methods` | Stripe `payment_method_id` tokens per customer |
| `discount_tiers` | Multi-planet discount percentages |

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/enrollments?customerId=` | CX (own), FA, XA |
| GET | `/api/enrollments?memberId=` | CX (own), FA, XA, CO |
| GET | `/api/enrollments?batchId=` | FA, XA, CO |
| POST | `/api/enrollments` | CX, FA, XA |
| PATCH | `/api/enrollments/:id` | FA, XA |
| GET | `/api/enrollments/:id/batches` | CX, FA, XA, CO |
| GET | `/api/invoices?customerId=` | CX (own), FA, XA |
| GET | `/api/invoices?ownershipId=&status=` | FA, XA, FM, XM |
| GET | `/api/invoices/:id` | CX (own), FA, XA |
| POST | `/api/invoices/:id/retry` | FA, XA |
| GET | `/api/payment-methods?customerId=` | CX (own), FA, XA |
| POST | `/api/payment-methods` | CX, FA, XA |
| PATCH | `/api/payment-methods/:id` | CX (own), FA, XA |
| DELETE | `/api/payment-methods/:id` | CX (own), FA, XA |
| GET | `/api/discounts` | FA, FM |
| POST | `/api/discounts` | FA |
| PATCH | `/api/discounts/:id` | FA |
| DELETE | `/api/discounts/:id` | FA |

### UI pages
| Page | Role |
|---|---|
| Customer → Enroll (multi-step flow) | CX |
| Customer → Payments (invoices + cards) | CX |
| Admin → Payments (missed payments) | FA |
| Admin → Discounts | FA |
| Franchisee Admin → (no billing mgmt in franchisee scope) | — |

### Role access summary
CX self-enrolls. FA/XA enroll on behalf of a customer and accept cash or card. FA manages
discount tiers globally. FM/XM see revenue-level invoice data via Reporting.

### Dependencies
- Module 3 (Catalog, Locations & Offerings) — variant + level + planet IDs; enrollment price comes from `location_course_offerings`
- Module 5 (Batches) — batch slot selection and capacity check
- Module 6 (Coach & Staff) — coach context for the enrolled batch (read-only at enrollment time)
- Module 7 (Customer & Member) — `customer_id`, `member_id`

### Notes
- **Setup fee rule:** $25 (configurable) per member per Planet on first enrollment. Track with a `member_planet_setup_fees` table (`member_id`, `planet_id`, `paid_at`) rather than the current single boolean on `enrollment` — the boolean cannot handle multiple planets per member (see gaps.md §7).
- **Billing cycle:** Charge on the 1st of each month; prorate the first month by remaining days.
- **Cancellation:** Only accepted with ≥ 15 days notice before the next billing date. Stop the next cycle's charge; do not refund the current cycle.
- **Multi-planet discount:** Recalculated monthly per member. When a member has N active planet enrollments, apply the configured discount tier for N planets to all their line items.
- **Multi-frequency batch selection:** `POST /api/enrollments` accepts a `batchIds: string[]` array; server creates one `enrollment_batches` row per ID. The enroll UI must let the customer select exactly N batch slots where N = `variant.frequencyPerWeek`.
- **Admin cash payment:** FA can mark a payment as "Cash" at enrollment — no Stripe call; creates a `PAID` invoice immediately.
- Stripe integration: use Stripe's hosted payment element for card entry (never collect raw card numbers in your own UI).

---

## Module 9 — Roster

**Domain:** Weekly staff roster generation per location: assigning coaches to batch sessions
for a given week, accounting for holidays and coach availability/leaves, publishing the roster
to coaches.

### Database tables
| Table | Purpose |
|---|---|
| `rosters` | One roster per location per week (`location_id`, `week_start_date`, status: draft/published) |
| `roster_assignments` | Coach assigned to a batch session slot within a roster |

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/rosters?locationId=&weekStartDate=` | FA, XA, CO |
| POST | `/api/rosters` | FA, XA |
| POST | `/api/rosters/:id/publish` | FA, XA |
| GET | `/api/rosters/:id/assignments` | FA, XA, CO |
| POST | `/api/rosters/:id/assignments` | FA, XA |
| PATCH | `/api/rosters/:id/assignments/:assignmentId` | FA, XA |
| DELETE | `/api/rosters/:id/assignments/:assignmentId` | FA, XA |

### UI pages
| Page | Role |
|---|---|
| Admin → Roster (list / calendar / by-coach views) | FA |
| Franchisee Admin → Roster | XA |

### Role access summary
FA/XA create, edit, and publish rosters. CO reads their published assignments only (not drafts).

### Dependencies
- Module 3 (Catalog, Locations & Offerings) — roster is per location; holidays from this module are excluded
- Module 5 (Batches) — roster fills the batch slots defined here
- Module 6 (Coach & Staff) — availability and leaves determine assignability

### Notes
- Roster must be created at least 1 week in advance and must cover at least 2 weeks.
- Auto-generation hint: when creating a roster, the API should suggest eligible coaches per batch slot (available + not on leave + assigned to the planet). Manual override is always allowed.
- Roster `key` fix required: SQL `rosters` currently keys by `ownership_id` but should key by `location_id` — fix this schema gap before building (see gaps.md §3c).
- Publishing a roster triggers a notification to all assigned coaches (Module 15).

---

## Module 10 — Attendance, Sessions & Trials

**Domain:** Session-level tracking derived from roster assignments (marking attendance, session
notes, makeup management) and the full trial lifecycle (booking, assessment, batch recommendation).

### Database tables
| Table | Purpose |
|---|---|
| `roster_assignments` | Shared with Module 9; attendance and trial slots anchor here |
| `attendance` | Per-member attendance record (`roster_assignment_id`, `member_id`, status) |
| `session_notes` | Coach-level notes per session |
| `member_session_notes` | Per-member private notes by coach |
| `trials` | `member_id`, `batch_id`, `location_id`, status |
| `trial_assessments` | Text feedback, attachment, recommended batch IDs |

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/sessions?coachId=&from=&to=` | CO, FA, XA |
| GET | `/api/sessions?batchId=` | FA, XA, CO |
| GET | `/api/sessions/:id/attendance` | CO, FA, XA |
| PATCH | `/api/sessions/:id/attendance` | CO |
| GET | `/api/sessions/:id/notes` | CO, FA, XA |
| POST | `/api/sessions/:id/notes` | CO |
| PATCH | `/api/sessions/:id/notes/:noteId` | CO |
| GET | `/api/sessions/:id/member-notes` | CO, FA, XA |
| POST | `/api/sessions/:id/member-notes` | CO |
| GET | `/api/trials?memberId=` | CX (own), FA, XA, CO |
| POST | `/api/trials` | CX, FA, XA |
| PATCH | `/api/trials/:id` | CO, FA, XA |
| POST | `/api/trials/:id/assessment` | CO |
| GET | `/api/trials/:id/assessment` | CX (own), FA, XA |

### UI pages
| Page | Role |
|---|---|
| Coach → Sessions (list + attendance modal + trial/makeup management) | CO |
| Coach → Students | CO |
| Customer → Members (attendance history per member) | CX |
| Customer → Dashboard (recommended batch from trial assessment) | CX |
| Admin → Roster (session detail drill-down) | FA |
| Public storefront (trial booking CTA → login gate) | PUB |

### Role access summary
CO marks attendance, writes notes, and completes trial assessments. CX reads their own members'
attendance history and books trials. FA/XA manage all sessions and trials in their ownership.

### Dependencies
- Module 5 (Batches) — trial is booked into an existing batch slot
- Module 6 (Coach & Staff) — coach conducts sessions and trials
- Module 7 (Customer & Member) — member identity for both attendance and trials
- Module 8 (Enrollment) — expected attendance list derived from active `enrollment_batches`
- Module 9 (Roster) — `roster_assignments` is the session record; attendance and trials hang off it

### Notes
- A "session" in the UX is a `roster_assignment` row (no standalone `sessions` table in SQL — see gaps.md §7).
- Expected attendance sheet is generated automatically when a roster is published: one `attendance` row per active enrolled member in the batch, status = `expected`.
- Makeup class: admin creates a makeup `roster_assignment` for the missed member; attendance status is `makeup_booked` → `makeup_attended`.
- `AttendanceStatus` must be expanded to 7 values: `expected`, `present`, `absent`, `makeup_booked`, `makeup_attended`, `trial_booked`, `trial_attended` (see gaps.md §4c).
- If no substitute coach is available for an absent coach, admin reschedules within 7 days; no automated rescheduling at launch.
- **Trial policy:** one free trial per member per Planet. Server must enforce — reject a second booking for the same `member_id` + `planet_id`.
- Trial assessment attachment: store in Supabase Storage; save URL in `trial_assessments`.
- Recommended batch from assessment surfaces on the CX dashboard with a direct "Enroll now" CTA pre-filling Module 8's enroll flow.

---

## Module 13 — LMS & Content

**Domain:** Learning management system — content hierarchy (Planet → Level → Module → Topic),
content types (text editor, PDF, YouTube), quiz builder, quiz attempts, and progression gating.

### Database tables
| Table | Purpose |
|---|---|
| `lms_planets` | LMS-side planet (mirrors `planets` but independently versioned) |
| `lms_products` | LMS-side level/product |
| `lms_product_sale_product_mapping` | Links LMS product to sales `product_variants` |
| `lms_modules` | Module under an LMS product |
| `lms_topics` | Topic under a module; `content_type`: text, pdf, youtube |
| `lms_quizzes` | Quiz at module or topic level; `passing_score_pct` (to be added — see gaps.md §4e) |
| `lms_quiz_questions` | Question with `answer_type`: Single, Multiple |
| `lms_quiz_answer_options` | Answer options; `is_correct_answer` per option |
| `lms_quiz_attempts` | Member attempt: score, passed, timestamp (to be added — see gaps.md §2c) |

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/lms/modules?levelId=` | CX, CO, FA, XA |
| POST | `/api/lms/modules` | CO |
| PATCH | `/api/lms/modules/:id` | CO, FA |
| DELETE | `/api/lms/modules/:id` | FA |
| GET | `/api/lms/modules/:id/topics` | CX, CO, FA, XA |
| POST | `/api/lms/modules/:id/topics` | CO |
| PATCH | `/api/lms/topics/:id` | CO, FA |
| DELETE | `/api/lms/topics/:id` | FA |
| GET | `/api/lms/quizzes?moduleId=` | CX, CO, FA, XA |
| POST | `/api/lms/quizzes` | CO |
| PATCH | `/api/lms/quizzes/:id` | CO, FA |
| POST | `/api/lms/quizzes/:id/questions` | CO |
| PATCH | `/api/lms/questions/:id` | CO |
| DELETE | `/api/lms/questions/:id` | CO |
| POST | `/api/lms/quizzes/:id/attempts` | CX |
| GET | `/api/lms/attempts?memberId=&quizId=` | CX (own), CO, FA, XA |

### UI pages
| Page | Role |
|---|---|
| Coach → LMS (content authoring: module/topic/quiz builder) | CO |
| Customer → LMS (learning portal: read topics, attempt quizzes) | CX |

### Role access summary
CO authors content and builds quizzes. CX (member) reads published content and submits quiz
attempts. FA can delete content. Published filter: CX only sees published modules/topics;
CO/FA see all including drafts.

### Dependencies
- Module 3 (Catalog) — LMS content maps to sales levels via `lms_product_sale_product_mapping`
- Module 7 (Customer & Member) — quiz attempts are per member
- Module 8 (Enrollment) — purchasing a course auto-unlocks its LMS content for the member

### Notes
- Purchasing a course (Module 8) should write a record linking `member_id` → `lms_product_id` to gate access. Members without an active enrollment for that level cannot see its LMS content.
- **Quiz answer model** must be updated: replace `correctAnswer: string` with `LmsAnswerOption[]` carrying `isCorrect: boolean` to support multi-correct questions (see gaps.md §5b).
- Progression gating (decided: yes) — a member cannot proceed to Module N+1 until all quizzes in Module N are passed.
- YouTube topics: open in a new browser tab, not an embedded iframe.
- Score calculation is server-side only — never trust client-submitted scores.

---

## Module 15 — Notifications

**Domain:** System-generated in-app notifications triggered by key events across modules.

### Database tables
| Table | Purpose |
|---|---|
| `notifications` | `profile_id`, message, `is_read`, `created_at`, optional `entity_type` + `entity_id` link |

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/notifications` | All |
| PATCH | `/api/notifications/:id` | All |
| POST | `/api/notifications/read-all` | All |

### UI pages
| Page | Role |
|---|---|
| TopBar notification bell (all authenticated pages) | All |

### Role access summary
Every authenticated user manages their own notifications. No cross-user reads.

### Dependencies
- Module 8 (Enrollment & Billing) — missed payment, failed charge triggers
- Module 9 (Roster) — roster published notification to coaches
- Module 10 (Attendance & Trials) — missed class notification to CX; trial assessment submitted notification to CX

### Notes
- Delivery channel at launch: in-app only. SMS/email deferred to a later phase.
- Notifications are written by server-side event handlers (e.g. in the Stripe webhook, the billing job, the roster publish endpoint).
- Keep the notification schema generic (`entity_type`, `entity_id`) so the bell can deep-link to the relevant page.

---

## Module 16 — Reporting & Analytics

**Domain:** Aggregated data views for management — revenue, enrollment trends, attendance
rates, and failed-registration analysis.

### Database tables
No owned tables — reads across Modules 3, 4, 8, 10.

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/reports/revenue` | FM, XM, FA, XA |
| GET | `/api/reports/enrollments` | FM, XM, FA, XA |
| GET | `/api/reports/failed-enrollments` | FM, XM, FA, XA |
| GET | `/api/reports/attendance` | FM, XM, FA, XA |

**Common query params:** `ownershipId`, `locationId`, `planetId`, `levelId`, `from`, `to`. Append `?format=csv` for CSV export.

### UI pages
| Page | Role |
|---|---|
| Management → Revenue (pivot table) | FM, XM |
| Management → Reports | FM, XM |
| Management → Locations | FM, XM |
| Admin → Payments (missed payments view) | FA, XA |

### Role access summary
FM and FA see all ownerships in the deployment. XM and XA see only their own ownership.
Scoping is enforced server-side by comparing the `ownershipId` query param against the JWT claim.

### Dependencies
All data modules (8, 10) must be complete before reports have real data.

### Notes
- All four report endpoints are read-only SQL aggregations — no write path.
- CSV export: same query, different serialization. Use a shared query layer and serialize per the `format` param.
- Failed enrollments: log a `enrollment_attempt` event (lightweight table or Supabase log) whenever a batch is full and a CX tries to enroll. Report on these events.

---

## Module 17 — Price Change Requests & Support Tickets

**Domain:** Two franchisee-initiated workflows with the same role pattern (XA/XM submit →
FA/FM action): price override requests with franchisor approval and price write-back, and
internal IT/non-IT issue tracking.

### Database tables
| Table | Purpose |
|---|---|
| `price_change_requests` | `requesting_location_id`, `product_variant_id`, requested price, reason, status, attachments |
| `support_tickets` | `ownership_id`, optional `location_id`, category (IT/Non-IT), description, status |

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/price-requests?status=` | FA, XA, FM, XM |
| POST | `/api/price-requests` | XA, XM |
| POST | `/api/price-requests/:id/attachments` | XA, XM |
| PATCH | `/api/price-requests/:id/review` | FA, FM |
| GET | `/api/tickets?ownershipId=` | FA, XA, FM, XM |
| POST | `/api/tickets` | FA, XA, FM, XM |
| PATCH | `/api/tickets/:id` | FA, FM |

### UI pages
| Page | Role |
|---|---|
| Franchisee Admin → Price Requests (submit + track) | XA |
| Franchisee Admin → Tickets (raise + track) | XA |
| Management → Pricing (Franchisor: approve/reject; Franchisee: submit/track) | FM, XM |

### Role access summary
XA/XM submit price requests and raise tickets. FA/FM review price requests and approve or reject; FA/FM view all tickets and update status.

### Dependencies
- Module 2 (Ownerships) — both resources scoped to an ownership
- Module 3 (Catalog, Locations & Offerings) — price request approval writes to `location_course_offerings`; `product_variant_id` reference

### Notes
- Schema gap: `requesting_location_id` (SQL) vs. `requestingOwnershipId` (TypeScript). The SQL design is correct — fix TypeScript (see gaps.md §3b) before wiring price requests.
- On price request approval, server should immediately PATCH the relevant `location_course_offerings` row with the new price and trigger a notification to the requesting XA.
- Attachment storage: Supabase Storage; save URL in the request record.
- Support tickets are simple CRUD at launch — no assignment, SLA tracking, or email threading needed.
- `ownership_id` on tickets is auto-populated from the JWT claim; submitter picks an optional location.

---

## Module 19 — Public Storefront

**Domain:** Unauthenticated brand-specific landing page — course catalog, pricing, and trial/enrollment CTAs.

### Database tables
No owned tables — reads from Module 3.

### API routes
| Method | Path | Roles |
|---|---|---|
| GET | `/api/public/storefront` | PUB |
| GET | `/api/public/planets` | PUB |

### UI pages
| Page | Role |
|---|---|
| `/t/[tenant]` | PUB |

### Role access summary
Fully public — no auth.

### Dependencies
- Module 3 (Catalog) — planets, levels, pricing

### Notes
- Per-tenant branding (logo, colors) is configured in deployment env vars or a `brand_config` table; the storefront API returns this alongside catalog data.
- All CTAs (enroll, book trial) deep-link to `/login?next=<destination>` — no public checkout.
- Path-based routing (`/t/[tenant]`) is used for the prototype. Production will use subdomain or custom CNAME — defer this decision until post-launch.

---

## Open Items (resolve before backend sprint begins)

| # | Item | Owner | Module affected |
|---|---|---|---|
| G1 | Fix 7 SQL schema bugs (S1–S7 in gaps.md §1) | — | All |
| G4 | Add missing table: `lms_quiz_attempts` | — | 13 |
| G5 | Add missing table: `staff_planets` | — | 6 |
| G6 | Fix `rosters` key: `ownership_id` → `location_id` | — | 9 |
| G7 | Fix `Enrollment` type: single `batchId` → multi-batch via `enrollment_batches` | — | 8 |
| G8 | Fix `PriceChangeRequest`: `requestingOwnershipId` → `requestingLocationId` | — | 17 |
| G9 | Fix `CoachAvailability`/`CoachLeave`: bridge `coachId` ↔ `profile_id` | — | 6 |
| G10 | Add `lms_quizzes.passing_score_pct` column | — | 13 |
| G11 | Fix LMS quiz answer model: `correctAnswer: string` → `LmsAnswerOption[]` | — | 13 |
| G12 | Add `member_planet_setup_fees` tracking table (replaces boolean on enrollment) | — | 8 |
| G13 | Add `ownership_id` to `holidays` table | — | 3 |
| G14 | Add `price`, `setup_fee` to TypeScript `LocationCourseOffering` type | — | 3, 8 |
| G15 | Expand `AttendanceStatus` to 7 values | — | 10 |
| G16 | Add `phone` to `profiles` (for coach records) | — | 6 |
