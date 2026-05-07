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
