# Module 6 — Coach & Staff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement full lifecycle management for Coaches, including qualifications (Planets), weekly availability, and leave management with derived status logic.

**Supabase project ID:** `nxocuhlrldrbbltiqkqh`

---

## File Map

| Task | File | Action | Purpose |
|---|---|---|---|
| 1 | `supabase/migrations/006_coaches.sql` | Create | Tables: staff_planets, staff_availability, staff_leaves + RLS |
| 2 | `scripts/seed-staff.ts` | Create | Seed 10 coaches with mixed availability/leaves |
| 3 | `lib/db/coaches.ts` | Create | DAL: `listCoaches`, `getCoach` |
| 4 | `lib/db/coaches.ts` | Modify | DAL: `updateQualifications`, `manageAvailability` |
| 5 | `lib/db/coaches.test.ts` | Create | Unit tests for status derivation and scoping |
| 6 | `app/api/coaches/route.ts` | Create | GET coaches list (scoped) |
| 7 | `app/api/coaches/[id]/route.ts` | Create | PATCH update coach profile |
| 8 | `app/api/coaches/[id]/availability/route.ts` | Create | GET/PUT recurring schedule |
| 9 | `app/api/coaches/[id]/leaves/route.ts` | Create | GET/POST/DELETE leaves |
| 10 | `app/(app)/admin/coaches/page.tsx` | Create | Server Component: fetch admin coach list |
| 11 | `app/(app)/admin/coaches/CoachesClient.tsx` | Create | Client: Coach Directory with status filters |
| 12 | `app/(app)/admin/coaches/PlanetAssignModal.tsx` | Create | Modal for managing coach qualifications |
| 13 | `app/(app)/coach/availability/page.tsx` | Create | Coach self-service availability editor |
| 14 | `app/(app)/coach/leaves/page.tsx` | Create | Coach self-service leave management |
| 15 | `lib/types.ts` | Modify | Add `CoachProfile`, `Availability`, `Leave` types |

---

## Task 1: Database Migration

- [x] **Step 1: Create `supabase/migrations/006_coaches.sql`**
- [x] **Step 2: Apply the migration**

---

## Task 2: Seed Staff Data

- [x] **Step 1: Create `scripts/seed-staff.ts`** (Seed was applied via manual SQL for auth compatibility)

---

## Task 3: DAL - Coach Retrieval

- [x] **Step 1: Implement `listCoaches` in `lib/db/coaches.ts`**

---

## Task 4: DAL - Manage Qualifications & Availability

- [x] **Step 1: Implement `updateQualifications(profileId, planetIds)`**
- [x] **Step 2: Implement `updateAvailability(profileId, slots)`**

---

## Task 5: Unit Testing

- [x] **Step 1: Create `lib/db/coaches.test.ts`**

---

## Task 6: API - Coach List

- [x] **Step 1: Create `app/api/coaches/route.ts`**

---

## Task 7: API - Coach Detail & Update

- [x] **Step 1: Create `app/api/coaches/[id]/route.ts`**

---

## Task 8: API - Availability

- [x] **Step 1: Create `app/api/coaches/[id]/availability/route.ts`**

---

## Task 9: API - Leaves

- [x] **Step 1: Create `app/api/coaches/[id]/leaves/route.ts`**

---

## Task 10: Admin UI - Server Component

- [x] **Step 1: Create `app/(app)/admin/coaches/page.tsx`**

---

## Task 11: Admin UI - Coach Directory

- [x] **Step 1: Create `app/(app)/admin/coaches/CoachesClient.tsx`**

---

## Task 12: Admin UI - Qualification Modal

- [x] **Step 1: Create `app/(app)/admin/coaches/PlanetAssignModal.tsx`**

---

## Task 13: Coach UI - Availability Editor

- [x] **Step 1: Create `app/(app)/coach/availability/page.tsx`**

---

## Task 14: Coach UI - Leave Management

- [x] **Step 1: Create `app/(app)/coach/leaves/page.tsx`**

---

## Task 15: Type Definitions

- [x] **Step 1: Update `lib/types.ts`**
