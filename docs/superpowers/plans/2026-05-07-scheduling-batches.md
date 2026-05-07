# Module 5 — Scheduling & Batches Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the recurring scheduling system by replacing mock batch data with a production-ready database layer. This includes the `batches` table, CRUD APIs, and management UI within the location view.

**Architecture:** Batches belong to a `location_id` and a `product_id` (Level). Franchisee admins manage batches for their own locations; Franchisor admins have global visibility.

**Tech Stack:** Next.js 16.2.2 App Router · Supabase Postgres · `@supabase/ssr` · Vitest 3.x · TypeScript 5

**Supabase project ID:** `nxocuhlrldrbbltiqkqh`

---

## File Map

| File | Action | Status | Purpose |
|---|---|---|---|
| `supabase/migrations/007_batches.sql` | Create | ⬜ Pending | batches table, RLS, location/product FKs |
| `scripts/seed-batches.ts` | Create | ⬜ Pending | Seed demo batches for existing locations |
| `lib/db/batches.ts` | Create | ⬜ Pending | listBatches, createBatch, deleteBatch fns |
| `lib/db/batches.test.ts` | Create | ⬜ Pending | Unit tests for batch management |
| `app/api/batches/route.ts` | Create | ⬜ Pending | GET list + POST create |
| `app/api/batches/[id]/route.ts` | Create | ⬜ Pending | PATCH update + DELETE batch |
| `app/(app)/admin/locations/BatchList.tsx` | Create | ⬜ Pending | Component for viewing/managing batches |
| `lib/types.ts` | Modify | ⬜ Pending | Update Batch type to match DB schema |

---

## Task 1: Database Migration

**Files:**
- Create: `supabase/migrations/007_batches.sql`

- [ ] **Step 1: Create the migration file**

  ```sql
  -- Create batches table
  create table public.batches (
    id              uuid primary key default gen_random_uuid(),
    location_id     uuid not null references public.locations(id) on delete cascade,
    product_id      uuid not null references public.products(id) on delete cascade,
    day_of_week     varchar(10) not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    start_time      time not null,
    end_time        time not null,
    max_capacity    integer not null default 8,
    is_active       boolean not null default true,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    
    constraint start_before_end check (start_time < end_time)
  );

  -- Indexes for performance
  create index idx_batches_location on public.batches(location_id);
  create index idx_batches_product on public.batches(product_id);

  -- Enable RLS
  alter table public.batches enable row level security;

  -- 1. Read access: Everyone can see batches (needed for enrollment storefront)
  create policy "anyone can read batches"
    on public.batches for select
    using (true);

  -- 2. FA/FM: full access
  create policy "franchisor staff manage all batches"
    on public.batches for all
    using (
      (auth.jwt() -> 'app_metadata' ->> 'role') in ('franchisor_admin', 'franchisor_mgmt')
    );

  -- 3. XA: manage batches for their own locations
  create policy "franchisee admin manage own location batches"
    on public.batches for all
    using (
      exists (
        select 1 from public.locations l
        where l.id = batches.location_id
        and l.ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
      )
    )
    with check (
      exists (
        select 1 from public.locations l
        where l.id = batches.location_id
        and l.ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
      )
    );
  ```

- [ ] **Step 2: Apply migration**
  Apply using `mcp__supabase__apply_migration`.

---

## Task 2: Seed Batches

**Files:**
- Create: `scripts/seed-batches.ts`

- [ ] **Step 1: Create `scripts/seed-batches.ts`**

  ```typescript
  import { createClient } from '@supabase/supabase-js'
  import { config } from 'dotenv'
  import { existsSync } from 'fs'
  import { resolve } from 'path'

  const envPaths = ['.env.local', '../.env.local'].map((p) => resolve(process.cwd(), p))
  const envPath = envPaths.find(existsSync)
  if (envPath) config({ path: envPath })
  else config({ path: '.env.local' })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const admin = createClient(supabaseUrl, serviceRoleKey)

  async function seed() {
    console.log('Seeding batches...')

    // 1. Get all locations and products (levels)
    const { data: locations } = await admin.from('locations').select('id')
    const { data: levels } = await admin.from('products').select('id')

    if (!locations || !levels) return

    const batches = []
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const times = [
      { start: '16:00', end: '17:00' },
      { start: '17:15', end: '18:15' },
    ]

    for (const loc of locations) {
      for (const level of levels) {
        // Create 2 batches per level per location
        for (let i = 0; i < 2; i++) {
          batches.push({
            location_id: loc.id,
            product_id: level.id,
            day_of_week: days[Math.floor(Math.random() * days.length)],
            start_time: times[i].start,
            end_time: times[i].end,
            max_capacity: 8,
            is_active: true
          })
        }
      }
    }

    const { error } = await admin.from('batches').insert(batches)
    if (error) console.error('Seed error:', error)
    else console.log(`Seeded ${batches.length} batches.`)
  }

  seed()
  ```

---

## Task 3: Data Access Layer (DAL)

**Files:**
- Create: `lib/db/batches.ts`
- Modify: `lib/types.ts`

- [ ] **Step 1: Update `lib/types.ts`**
  ```typescript
  export interface Batch {
    id: string;
    locationId: string;
    levelId: string;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    maxCapacity: number;
    isActive: boolean;
    createdAt?: string;
  }
  ```

- [ ] **Step 2: Implement `lib/db/batches.ts`**
  ```typescript
  import { createClient } from "@/lib/supabase/server";
  import type { Batch } from "@/lib/types";

  export async function listBatches(locationId?: string, levelId?: string) {
    const supabase = await createClient();
    let query = supabase.from('batches').select('*');
    
    if (locationId) query = query.eq('location_id', locationId);
    if (levelId) query = query.eq('product_id', levelId);
    
    const { data, error } = await query.order('day_of_week').order('start_time');
    if (error) throw error;
    
    return data.map(b => ({
      id: b.id,
      locationId: b.location_id,
      levelId: b.product_id,
      dayOfWeek: b.day_of_week,
      startTime: b.start_time,
      endTime: b.end_time,
      maxCapacity: b.max_capacity,
      isActive: b.is_active,
      createdAt: b.created_at
    })) as Batch[];
  }

  export async function createBatch(batch: Omit<Batch, 'id' | 'createdAt'>) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('batches').insert({
      location_id: batch.locationId,
      product_id: batch.levelId,
      day_of_week: batch.dayOfWeek,
      start_time: batch.startTime,
      end_time: batch.endTime,
      max_capacity: batch.maxCapacity,
      is_active: true
    }).select().single();
    
    if (error) throw error;
    return data;
  }
  ```

---

## Task 4: API Routes

**Files:**
- Create: `app/api/batches/route.ts`

- [ ] **Step 1: Create `app/api/batches/route.ts`**
  ```typescript
  import { NextResponse } from "next/server";
  import { listBatches, createBatch } from "@/lib/db/batches";
  import { getSession } from "@/lib/auth/session";

  export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId");
    const levelId = searchParams.get("levelId");
    
    try {
      const batches = await listBatches(locationId || undefined, levelId || undefined);
      return NextResponse.json(batches);
    } catch (err) {
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
  }

  export async function POST(req: Request) {
    const session = await getSession();
    if (!session || !['FA', 'XA'].includes(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await req.json();
    try {
      const newBatch = await createBatch(body);
      return NextResponse.json(newBatch, { status: 201 });
    } catch (err) {
      return NextResponse.json({ error: "Failed to create" }, { status: 500 });
    }
  }
  ```

---

## Task 5: UI Components

**Files:**
- Create: `app/(app)/admin/locations/BatchList.tsx`

- [ ] **Step 1: Implement `BatchList.tsx`**
  Create a component that renders a table of batches with "Edit" and "Delete" actions. It should take `locationId` and `levelId` as props.

- [ ] **Step 2: Integrate into Location Cards**
  Update the level list inside `LocationsClient.tsx` to include a "Show Batches" toggle that lazy-loads the `BatchList` component.
