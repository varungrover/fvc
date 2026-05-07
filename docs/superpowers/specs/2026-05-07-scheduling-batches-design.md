# Module 5 — Scheduling & Batches: Design Spec

_Date: 2026-05-07_
_Status: Draft — Ready for review_

---

## Overview

Module 5 implements the recurring scheduling layer for Mentora. A **Batch** is a weekly recurring time slot (e.g., "Mondays 4:00 PM – 5:00 PM") assigned to a specific **Location** and **Level** (Product). This module establishes the "inventory" of available seats that students fill during enrollment.

**Stack:** Next.js 16.2.2 App Router · Supabase Postgres · `@supabase/ssr` · TypeScript 5

---

## Chosen Approach: `batches` table with Location/Product FKs

Batches are the bridge between the **Catalog** (what is being taught) and **Locations** (where it is being taught). Each batch record defines a single weekly occurrence. 

### Why this approach

- **Relational Integrity:** By linking directly to `locations` and `products` (Levels), we ensure that batches cannot exist for deleted levels or non-existent locations.
- **Granular Capacity:** Capacity is managed at the batch level, allowing different slots to have different caps (e.g., a smaller room on Tuesdays).
- **Multi-Frequency Support:** For variants that meet multiple times per week (2x/week), the system allows enrolling a student in $N$ distinct batches. This provides maximum flexibility for parents to pick slots that fit their schedule (e.g., Monday 4pm AND Wednesday 5pm).

---

## Database Design

### `batches` table

| Column | Type | Constraints | Notes |
|---|---|---|---|
| `id` | uuid | PK, default `gen_random_uuid()` | |
| `location_id` | uuid | NOT NULL, FK → `locations(id)` | Scoping anchor |
| `product_id` | uuid | NOT NULL, FK → `products(id)` | Link to "Level" |
| `day_of_week` | varchar(10) | NOT NULL, CHECK (day IN 'Monday'...'Sunday') | |
| `start_time` | time | NOT NULL | e.g. '16:00:00' |
| `end_time` | time | NOT NULL | e.g. '17:00:00' |
| `max_capacity` | integer | NOT NULL, default 8 | |
| `is_active` | boolean | NOT NULL, default true | |
| `created_at` | timestamptz | NOT NULL, default now() | |
| `updated_at` | timestamptz | NOT NULL, default now() | |

### RLS Policies

| Policy | Roles | Condition |
|---|---|---|
| Read batches | All | `true` (Public/Customer visibility needed for enrollment) |
| Manage batches (Global) | FA, FM | `role IN ('franchisor_admin', 'franchisor_mgmt')` |
| Manage batches (Local) | XA | `EXISTS (SELECT 1 FROM locations l WHERE l.id = batches.location_id AND l.ownership_id = jwt.ownership_id)` |

---

## API Design

### `GET /api/batches`
Query parameters: `locationId`, `levelId`. Returns all matching active batches.

### `POST /api/batches`
Creates a new batch slot. 
**Payload:**
```json
{
  "locationId": "uuid",
  "levelId": "uuid",
  "dayOfWeek": "Monday",
  "startTime": "16:00",
  "endTime": "17:00",
  "maxCapacity": 8
}
```

---

## UI/UX Strategy

The Batch Management interface will be integrated into the **Location Drill-down** view:
1.  **Admin/Franchisee Locations Page**: When a location is expanded, a "Batches" tab or section will appear under each Level.
2.  **Batch Grid**: Displays slots by Day/Time with current enrollment count vs. Max capacity.
3.  **Add Batch Modal**: A simple form to define new recurring slots.

---

## Security Considerations

- **Time Validation**: Database-level check ensures `start_time < end_time`.
- **Ownership Gating**: Franchisee Admins can only create batches for locations they own. This is enforced via the RLS policy checking the `ownership_id` on the parent location record.
- **Capacity Integrity**: While `max_capacity` is stored here, the `enrolled_count` is a derived value from the `enrollment_batches` table (Module 8/9).
