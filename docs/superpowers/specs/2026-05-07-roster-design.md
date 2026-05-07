# Module 9 — Roster: Design Spec

_Date: 2026-05-07_
_Status: Approved — ready for planning_

---

## Overview

The Roster module generates and manages the **weekly staff schedule** per location: which coach is assigned to which batch session on which date. It bridges Module 5 (Batches define the recurring schedule) and Module 6 (Coaches have availability and leaves) into a concrete, date-stamped assignment grid that coaches can view and admins can publish.

Two sub-domains:
1. **Rosters** — one roster record per location per week (`draft` → `published`).
2. **Roster Assignments** — individual coach-to-batch-session slot rows within a roster.

**Stack:** Next.js 16.2.2 App Router · Supabase Postgres · `@supabase/ssr` · TypeScript 5

**Supabase Project ID:** `nxocuhlrldrbbltiqkqh`

---

## Chosen Approach: Location-keyed rosters with server-side eligibility suggestions

Rosters are keyed by `(location_id, week_start_date)` — one roster per location per week. When an admin creates a roster for a given week, the API generates candidate `roster_assignment` rows (one per batch session that falls in that week for that location), with `coach_id = null` (unassigned). Admins then fill in coach assignments manually or accept the suggested eligible coaches returned by `GET /api/rosters/:id/assignments`.

### Schema fix required first (gaps.md §3c)

The original SQL schema keys `rosters` by `ownership_id`, which is too coarse — one ownership can span multiple locations. The correct key is `location_id`. **This fix must be applied in the migration before any roster data is written.**

### Why this approach

- **Location-level rosters** match the real operational workflow: a studio manager at Surrey Central creates the roster for their location independently of Abbotsford.
- **Draft → Published state machine** lets admins review and correct assignments before coaches see them. Coaches only read `published` rosters.
- **Server-side eligibility** (available + not on leave + assigned to the planet) surfaces the right coaches without forcing the admin to mentally cross-reference three tables. Manual override is always allowed.

### Alternatives Considered

**Option B — Ownership-level rosters (original schema)**
- Pro: Fewer roster records; one "master view" per ownership.
- Con: Mixed-location rosters are confusing to navigate — a Surrey assignment and a Langley assignment on the same row. Admin UI would need heavy filtering anyway. Doesn't match how studios actually operate.
- Not chosen.

**Option C — Auto-generate assignments and auto-assign coaches**
- Pro: Reduces manual work.
- Con: Coach preferences, known conflicts, and fairness logic are complex. Auto-assignment risks putting a coach on back-to-back slots they can't physically reach. Suggestion (not auto-assign) is the correct UX.
- Not chosen for v1: suggestion API is provided; auto-assign is a future enhancement.

---

## Database

### `rosters` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `location_id` | uuid | NOT NULL, FK → `locations(id) ON DELETE CASCADE` | Fixes gaps.md §3c — was `ownership_id` |
| `ownership_id` | uuid | NOT NULL, FK → `ownerships(id)` | Denormalized for RLS scoping |
| `week_start_date` | date | NOT NULL | Always a Monday |
| `status` | varchar(20) | NOT NULL, default `'draft'`, CHECK IN (`draft`, `published`) | |
| `published_at` | timestamptz | nullable | Set when published |
| `created_by` | uuid | NOT NULL, FK → `profiles(id)` | Who created this roster |
| `created_at` | timestamptz | NOT NULL, default now() | |

UNIQUE constraint: `(location_id, week_start_date)` — one roster per location per week.

**Validation rule:** Roster must be created at least 7 days in advance (`week_start_date >= CURRENT_DATE + 7`). Enforced at the API layer.

### `roster_assignments` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `roster_id` | uuid | NOT NULL, FK → `rosters(id) ON DELETE CASCADE` | |
| `batch_id` | uuid | NOT NULL, FK → `batches(id)` | The batch this session slot belongs to |
| `session_date` | date | NOT NULL | Concrete date of this session (e.g. 2026-05-11) |
| `coach_id` | uuid | nullable, FK → `profiles(id)` | null = unassigned |
| `created_at` | timestamptz | NOT NULL, default now() | |

UNIQUE constraint: `(roster_id, batch_id, session_date)` — one assignment slot per batch per day per roster.

**Shared with Module 10:** `roster_assignments` is the anchor for attendance records. Module 10 adds attendance rows referencing `roster_assignment_id`. No schema changes are required to `roster_assignments` for Module 10.

---

## RLS Policies

### `rosters`

| Policy | Operation | Condition |
|---|---|---|
| `franchisor_all_rosters` | ALL | `jwt role IN ('franchisor_admin', 'franchisor_mgmt')` |
| `franchisee_own_rosters` | ALL | `ownership_id = jwt ownership_id::uuid` |
| `coach_read_published_rosters` | SELECT | `jwt role = 'coach' AND status = 'published'` |

### `roster_assignments`

| Policy | Operation | Condition |
|---|---|---|
| `franchisor_all_assignments` | ALL | `jwt role IN ('franchisor_admin', 'franchisor_mgmt')` |
| `franchisee_own_assignments` | ALL | `roster_id IN (SELECT id FROM rosters WHERE ownership_id = jwt ownership_id::uuid)` |
| `coach_read_own_assignments` | SELECT | `coach_id = auth.uid() AND roster_id IN (SELECT id FROM rosters WHERE status = 'published')` |

Coaches only see their own published assignments — not assignments for other coaches, not draft rosters.

---

## TypeScript Type Fixes Required (from gaps.md)

### `Roster` — add `status`, `ownershipId`, `createdBy`

```typescript
// BEFORE
interface Roster {
  id: ID;
  locationId: ID;
  weekStartDate: ISODate;
  publishedAt?: ISODateTime;
}

// AFTER
type RosterStatus = "draft" | "published";

interface Roster {
  id: ID;
  locationId: ID;
  ownershipId: ID;
  weekStartDate: ISODate;
  status: RosterStatus;
  publishedAt?: ISODateTime;
  createdBy: ID;
  createdAt: ISODateTime;
}
```

### `RosterAssignment` — `coachId` is a `profile_id` (gaps.md §3d)

The TypeScript `RosterAssignment.coachId` maps to `roster_assignments.coach_id` which is a `profiles.id` (UUID). The existing `Coach` type in mock data uses a different `id` format. The fix: when listing assignments, join `profiles` for the coach's name directly — don't go through a `Coach` lookup by a separate ID.

```typescript
// RosterAssignment stays the same structurally, but coachId = profiles.id
interface RosterAssignment {
  id: ID;
  rosterId: ID;
  batchId: ID;
  sessionDate: ISODate;
  coachId?: ID;   // profiles.id — not a separate Coach.id
  coachName?: string; // joined from profiles.full_name
}
```

---

## Eligibility Logic (Server-side)

When the API generates or suggests coaches for a `roster_assignment` slot, eligibility is determined by:

1. **Role**: `profiles.role_id` must resolve to `'coach'`.
2. **Ownership**: Coach's `profiles.ownership_id` must match the roster's `ownership_id`.
3. **Planet qualification**: `staff_planets` must contain a row for `(profile_id, planet_id)` matching the batch's level's planet.
4. **Availability**: `staff_availability` must have a row for the batch's `day_of_week` where `start_time <= batch.start_time` and `end_time >= batch.end_time`.
5. **Not on approved leave**: No `staff_leaves` row where `status = 'approved'` AND `start_date <= session_date` AND `end_date >= session_date`.

This query runs at assignment-suggestion time, not at publish time. The roster can be published with unassigned slots (produces a warning, not a block).

---

## API Design

### `GET /api/rosters?locationId=&weekStartDate=`

FA/XA/CO (published only for CO). Returns roster(s) for a location, optionally filtered by week. Joins `location.name`, `ownership.name`. Returns `[]` if no roster exists for that week (not 404).

**Response:**
```json
[{
  "id": "uuid",
  "locationId": "uuid",
  "locationName": "Surrey Central",
  "ownershipId": "uuid",
  "weekStartDate": "2026-05-11",
  "status": "draft",
  "publishedAt": null,
  "assignmentCount": 14,
  "unassignedCount": 3
}]
```

### `POST /api/rosters`

FA/XA only. Creates the roster record and auto-generates unassigned `roster_assignment` rows for all batches at that location whose `day_of_week` falls within the specified week.

**Request body:**
```json
{
  "locationId": "uuid",
  "weekStartDate": "2026-05-11"
}
```

**Validation:**
- `weekStartDate` must be a Monday.
- `weekStartDate >= CURRENT_DATE + 7` (at least 1 week in advance).
- No existing roster for `(locationId, weekStartDate)` — 409 if duplicate.
- XA: `locationId` must belong to their `ownership_id`.

**Auto-generation:** For each batch at the location, for each day-of-week that falls within Mon–Sun of `weekStartDate`, insert one `roster_assignment` row with `coach_id = null`.

**Response:** `201` with created `RosterRow` + count of generated assignment slots.

### `POST /api/rosters/:id/publish`

FA/XA only. Sets `status = 'published'`, `published_at = now()`. Returns `422` if any required batch slot is unassigned (warning, not hard block — returns the count of unassigned slots for the admin to acknowledge). In Module 15, publishing triggers coach notifications.

### `GET /api/rosters/:id/assignments`

FA/XA: all assignments. CO: own assignments only (where `coach_id = auth.uid()`).

Joins: batch (day_of_week, start_time, end_time), product (level name), planet (name), coach profile (full_name). Also returns `suggestedCoaches` per assignment — eligible coaches (applying eligibility logic above) returned as `[{ profileId, fullName }]`.

### `POST /api/rosters/:id/assignments`

FA/XA only. Manually add an additional assignment slot (e.g. makeup session not in the recurring batch schedule).

**Request body:**
```json
{
  "batchId": "uuid",
  "sessionDate": "2026-05-13",
  "coachId": "uuid | null"
}
```

### `PATCH /api/rosters/:id/assignments/:assignmentId`

FA/XA only. Update `coach_id` on an existing assignment. This is the primary "assign a coach" operation.

**Request body:** `{ "coachId": "uuid | null" }`

Validates: if `coachId` is provided, check coach eligibility (availability + not on leave + planet-qualified). Returns a `warning` field (not an error) if assigning a coach who is on leave or unavailable — manual override is allowed.

### `DELETE /api/rosters/:id/assignments/:assignmentId`

FA/XA only. Removes an additional assignment. Cannot delete auto-generated slots (only manually-added ones). Returns `403` with explanation if attempting to delete an auto-generated slot.

---

## Data Access Layer

### `lib/db/rosters.ts`

```typescript
listRosters(supabase, filters, session)             // RosterRow[] — filters: locationId, weekStartDate
getRoster(supabase, id, session)                    // RosterRow | null
createRoster(supabase, input, session)              // RosterRow (also generates assignment slots)
publishRoster(supabase, id, session)               // RosterRow | null
generateAssignmentSlots(supabase, roster, batches) // RosterAssignmentRow[] (internal)
```

### `lib/db/rosterAssignments.ts`

```typescript
listAssignments(supabase, rosterId, session)        // RosterAssignmentRow[] with joins
getEligibleCoaches(supabase, assignment)            // EligibleCoach[] — applies full eligibility logic
createAssignment(supabase, input)                   // RosterAssignmentRow
updateAssignment(supabase, id, patch, session)      // RosterAssignmentRow | null
deleteAssignment(supabase, id, session)             // void (only manually-added)
```

---

## Page Architecture

### Admin → Roster (`/admin/roster`) — REFACTOR

The existing 526-line `"use client"` page imports exclusively from mock data. Full refactor required:

**Server Component (`page.tsx`):**
- Fetches user session; validates FA or FM role.
- Fetches all locations for this ownership via `listLocations`.
- Passes `locations` to `RosterClient` as initial prop (for the location filter dropdown).

**Client Component (`RosterClient.tsx`):**
- Owns `selectedLocationId`, `currentWeek`, `activeView` state.
- On location/week change, fetches via `GET /api/rosters?locationId=&weekStartDate=` and `GET /api/rosters/:id/assignments`.
- Three view tabs: **List**, **Calendar**, **By Coach**.

**List View:**
- Table: Date | Batch (planet + level) | Location | Coach (dropdown if unassigned) | Time.
- Unassigned rows highlighted in amber.
- Coach dropdown → `PATCH /api/rosters/:id/assignments/:id` with selected `coachId`.

**Calendar View:**
- 7-column week grid (Mon–Sun). Each day cell shows assignment cards.
- Card: planet badge + level name + time + coach name (or "Unassigned" in amber).
- Prev/Next week navigation changes `currentWeek`.

**By Coach View:**
- Unassigned sessions panel at top (amber border, list of slots).
- Per-coach cards: avatar + name + session count. Expandable session list per coach.

**Create Roster flow:**
- "Create Roster" button → modal: location select + week date picker (Monday-only).
- Submit → `POST /api/rosters`. On success, reload assignments.

**Publish Roster button:**
- `POST /api/rosters/:id/publish`. If unassigned slots remain, show confirmation dialog: "X sessions are unassigned. Publish anyway?"

### Franchisee Admin → Roster (`/franchisee-admin/roster`) — REFACTOR

Identical structure. Key difference:
- Server Component validates `franchisee_admin` role.
- Locations dropdown is scoped to their `ownership_id`.
- RLS on `rosters` automatically restricts to their ownership — no additional filter needed.

### Coach — My Schedule (existing page, enhancement)

Coach's schedule page at `/coach/availability` already exists. The roster module adds a **My Sessions** section sourced from `GET /api/rosters/:id/assignments` (filtered to `coach_id = auth.uid()`, published only). This is a read-only view — coaches cannot modify assignments.

---

## Role Access Summary

| Action | FA | FM | XA | XM | CO |
|---|---|---|---|---|---|
| Create roster | ✅ | ❌ | ✅ own | ❌ | ❌ |
| View draft roster | ✅ | ✅ | ✅ own | ❌ | ❌ |
| Assign coach | ✅ | ❌ | ✅ own | ❌ | ❌ |
| Publish roster | ✅ | ❌ | ✅ own | ❌ | ❌ |
| View published roster | ✅ | ✅ | ✅ own | ✅ own | ✅ self only |
| View unassigned slots | ✅ | ✅ | ✅ own | ❌ | ❌ |

---

## Key Flows

### Admin creates a roster for a week

1. Admin selects location + week (Monday date) → clicks "Create Roster".
2. `POST /api/rosters` validates week is ≥ 7 days out and no duplicate exists.
3. API fetches all active batches for that location.
4. For each batch, for each day of the week that matches `batch.day_of_week`, inserts one `roster_assignment` with `coach_id = null`.
5. Returns created roster + count of auto-generated slots.
6. UI loads the assignment grid; all slots show "Unassigned" in amber.

### Admin assigns a coach

1. Admin clicks a coach dropdown on an unassigned slot.
2. Dropdown options are populated from `suggestedCoaches` in the assignment response — eligible coaches for that slot.
3. On select, client calls `PATCH /api/rosters/:id/assignments/:id` with `{ coachId }`.
4. If the coach is on leave that day, API returns `200` with `warning: "Coach is on approved leave on this date"`.
5. UI shows the warning inline but saves the assignment.

### Admin publishes the roster

1. Admin clicks "Publish Roster".
2. If unassigned slots exist, confirmation modal: "3 sessions are unassigned. Publish anyway?"
3. On confirm, `POST /api/rosters/:id/publish` → sets `status = 'published'`.
4. (Module 15) Notification sent to all assigned coaches.
5. Coach portal now shows these sessions in "My Sessions".

---

## Demo / Seed Data

- 1 published roster for Surrey Central, week of 2026-05-11, with all Chess PP and Chess RR batch slots filled.
- 1 draft roster for Abbotsford, same week, with 2 unassigned slots.

Seeded via `scripts/seed-roster.ts`. Idempotent — skips by `(location_id, week_start_date)` uniqueness.

---

## What This Module Does NOT Cover

- **Attendance tracking** — `roster_assignments` is the anchor for attendance; `Module 10` adds the `attendance` table referencing `roster_assignment_id`.
- **Auto-assign coaches** — suggestion API returns eligible coaches; auto-assignment is a future enhancement.
- **Coach notifications on publish** — `POST /api/rosters/:id/publish` triggers notifications in Module 15. The publish endpoint is built here; the notification dispatch is wired in Module 15.
- **Multi-week roster creation** — admin creates one week at a time. Bulk creation (e.g. "create next 4 weeks") is a future enhancement.
- **Roster copy / duplicate** — copying last week's coach assignments to this week is a common UX pattern, deferred to polish.
- **Makeup session slots** — `POST /api/rosters/:id/assignments` supports manual slot addition (used for makeups); the full makeup booking flow is Module 10.
