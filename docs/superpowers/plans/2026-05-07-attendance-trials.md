# Module 10 — Attendance, Sessions & Trials Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement session tracking (attendance, notes) and trial management. Connect roster assignments to member participation and coach feedback.

**Spec:** `docs/superpowers/specs/2026-05-07-attendance-trials-design.md`

**Supabase project ID:** `nxocuhlrldrbbltiqkqh`

---

## File Map

| Task | File | Action | Status | Purpose |
|---|---|---|---|---|
| 1 | `supabase/migrations/012_attendance_trials.sql` | Create | ⬜ Pending | attendance, session_notes, member_session_notes, trials, trial_assessments |
| 2 | `lib/types.ts` | Modify | ⬜ Pending | Update AttendanceStatus union and Attendance/Trial interfaces |
| 3 | `lib/db/attendance.ts` | Create | ⬜ Pending | listAttendance, bulkUpdateAttendance, saveSessionNotes |
| 4 | `lib/db/trials.ts` | Create | ⬜ Pending | listTrials, createTrial, saveTrialAssessment |
| 5 | `app/api/sessions/route.ts` | Create | ⬜ Pending | GET (list assignments for coach/batch) |
| 6 | `app/api/sessions/[id]/attendance/route.ts` | Create | ⬜ Pending | GET (student list) + PATCH (bulk update) |
| 7 | `app/api/sessions/[id]/notes/route.ts` | Create | ⬜ Pending | GET + POST (public/internal notes) |
| 8 | `app/api/trials/route.ts` | Create | ⬜ Pending | GET + POST (book trial) |
| 9 | `app/api/trials/[id]/assessment/route.ts` | Create | ⬜ Pending | GET + POST (assessment feedback) |
| 10 | `app/(app)/coach/sessions/page.tsx` | Modify | ⬜ Pending | Refactor to use real API and show trial/makeup badges |
| 11 | `app/(app)/coach/students/page.tsx` | Create | ⬜ Pending | New page: Coach's student list with attendance stats |
| 12 | `app/(app)/customer/members/MemberAttendance.tsx` | Create | ⬜ Pending | Component for member attendance history view |
| 13 | `scripts/seed-attendance.ts` | Create | ⬜ Pending | Seed historical attendance and trial data |

---

## Task 1: Database Migration

**Files:** Create `supabase/migrations/012_attendance_trials.sql`

- [ ] **Step 1: Create `attendance` table**
  
  ```sql
  create table public.attendance (
    id                    uuid primary key default gen_random_uuid(),
    roster_assignment_id  uuid not null references public.roster_assignments(id) on delete cascade,
    member_id             uuid not null references public.members(id) on delete cascade,
    enrollment_id         uuid references public.enrollments(id) on delete set null,
    status                varchar(30) not null check (status in (
                            'expected', 'present', 'absent', 'makeup booked', 
                            'trial booked', 'makeup attended', 'trial attended'
                          )),
    marked_at             timestamptz not null default now(),
    marked_by             uuid not null references public.profiles(id),
    unique (roster_assignment_id, member_id)
  );
  alter table public.attendance enable row level security;
  ```

- [ ] **Step 2: Create `session_notes` table**

  ```sql
  create table public.session_notes (
    id                    uuid primary key default gen_random_uuid(),
    roster_assignment_id  uuid not null references public.roster_assignments(id) on delete cascade,
    coach_id              uuid not null references public.profiles(id),
    topic_covered         text,
    homework_notes        text,
    general_notes         text,
    created_at            timestamptz not null default now(),
    updated_at            timestamptz not null default now(),
    unique (roster_assignment_id)
  );
  alter table public.session_notes enable row level security;
  ```

- [ ] **Step 3: Create `member_session_notes` table**

  ```sql
  create table public.member_session_notes (
    id                    uuid primary key default gen_random_uuid(),
    roster_assignment_id  uuid not null references public.roster_assignments(id) on delete cascade,
    member_id             uuid not null references public.members(id) on delete cascade,
    coach_id              uuid not null references public.profiles(id),
    private_notes         text not null,
    created_at            timestamptz not null default now(),
    unique (roster_assignment_id, member_id)
  );
  alter table public.member_session_notes enable row level security;
  ```

- [ ] **Step 4: Create `trials` and `trial_assessments` tables**

  ```sql
  create table public.trials (
    id                    uuid primary key default gen_random_uuid(),
    member_id             uuid not null references public.members(id) on delete cascade,
    location_id           uuid not null references public.locations(id),
    batch_id              uuid not null references public.batches(id),
    roster_assignment_id  uuid references public.roster_assignments(id),
    status                varchar(20) not null default 'scheduled' 
                            check (status in ('scheduled', 'completed', 'no_show', 'converted')),
    created_at            timestamptz not null default now()
  );
  
  create table public.trial_assessments (
    id                      uuid primary key default gen_random_uuid(),
    trial_id                uuid not null references public.trials(id) on delete cascade,
    coach_id                uuid not null references public.profiles(id),
    assessment_text         text not null,
    attachment_url          text,
    recommended_batch_ids   uuid[],
    created_at              timestamptz not null default now(),
    unique (trial_id)
  );
  alter table public.trials enable row level security;
  alter table public.trial_assessments enable row level security;
  ```

- [ ] **Step 5: Apply RLS policies** (as per design spec).
- [ ] **Step 6: Fix index bug from gaps.md §1 S7** (ensure `idx_attendance_session` uses `roster_assignment_id`).

---

## Task 2: TypeScript Type Fixes

**Files:** Modify `lib/types.ts`

- [ ] **Step 1: Expand `AttendanceStatus` union**.
- [ ] **Step 2: Update `Attendance` interface** to include `rosterAssignmentId`.
- [ ] **Step 3: Update `Trial` and `TrialAssessment` interfaces**.

---

## Task 3: DAL — Attendance & Sessions

**Files:** Create `lib/db/attendance.ts`

- [ ] **Step 1: `listSessionAttendance(supabase, assignmentId)`** — returns members + their status + enrollment type.
- [ ] **Step 2: `markAttendance(supabase, data, session)`** — bulk upsert attendance rows.
- [ ] **Step 3: `saveSessionNotes(supabase, data, session)`** — upsert into `session_notes`.
- [ ] **Step 4: `saveMemberPrivateNote(supabase, data, session)`** — upsert into `member_session_notes`.

---

## Task 4: DAL — Trials

**Files:** Create `lib/db/trials.ts`

- [ ] **Step 1: `listTrials(supabase, filters)`** — filter by member, location, status.
- [ ] **Step 2: `createTrial(supabase, data)`** — inserts trial record (ensure `roster_assignment` exists).
- [ ] **Step 3: `submitAssessment(supabase, data, session)`** — saves assessment and updates trial status to 'completed'.

---

## Task 5: API Routes

**Files:** Implement routes in `app/api/sessions/...` and `app/api/trials/...`

- [ ] **Step 1: `GET /api/sessions`** — fetch assignments for coach/batch.
- [ ] **Step 2: `PATCH /api/sessions/[id]/attendance`** — bulk update.
- [ ] **Step 3: `POST /api/sessions/[id]/notes`** — save topic/homework.
- [ ] **Step 4: `POST /api/trials`** — booking logic.
- [ ] **Step 5: `POST /api/trials/[id]/assessment`** — completion logic.

---

## Task 6: UI Refactor — Coach Portal

**Files:** Modify `app/(app)/coach/sessions/page.tsx`; create `app/(app)/coach/students/page.tsx`

- [ ] **Step 1: Refactor `SessionsPage`** to fetch real data from `/api/sessions`.
- [ ] **Step 2: Update Attendance Modal** — handle "Trial" and "Makeup" student badges.
- [ ] **Step 3: Implement Trial Assessment button** — logic to open assessment form for trial students.
- [ ] **Step 4: Implement Student List** — show attendance % and last session notes per member.

---

## Task 7: UI Refactor — Customer Portal

**Files:** Create `app/(app)/customer/members/MemberAttendance.tsx`

- [ ] **Step 1: Build Attendance History Component** — table/list of previous sessions + public notes.
- [ ] **Step 2: Integrate into Member Detail View**.

---

## Task 8: Seed Data

**Files:** Create `scripts/seed-attendance.ts`

- [ ] **Step 1: Seed 5-10 historical attendance records**.
- [ ] **Step 2: Seed 2 upcoming trials**.
- [ ] **Step 3: Seed 1 completed trial assessment**.
