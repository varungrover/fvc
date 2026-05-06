-- 005_offerings.sql
-- Offerings: Per-location course pricing overrides

create table if not exists public.location_course_offerings (
  id                  uuid primary key default gen_random_uuid(),
  location_id         uuid not null references public.locations(id),
  product_variant_id  uuid not null references public.product_variants(id),
  price               numeric(10,2) not null,
  setup_fee           numeric(10,2) not null default 0,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (location_id, product_variant_id)
);

alter table public.location_course_offerings enable row level security;

-- FA/FM: read all offerings
create policy "franchisor read all offerings"
  on public.location_course_offerings for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('franchisor_admin', 'franchisor_mgmt')
  );

-- Scoped roles: read offerings for locations in their ownership
create policy "scoped users read own offerings"
  on public.location_course_offerings for select
  using (
    location_id in (
      select id from public.locations
      where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
    )
  );

-- Public: read active offerings (for storefront)
create policy "public read active offerings"
  on public.location_course_offerings for select
  using (is_active = true);

-- FA: insert/update any offering
create policy "franchisor admin write offerings"
  on public.location_course_offerings for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin');

-- XA: insert/update offerings for their own locations
create policy "franchisee admin write own offerings"
  on public.location_course_offerings for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
    and location_id in (
      select id from public.locations
      where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
    )
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
    and location_id in (
      select id from public.locations
      where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
    )
  );

create index if not exists idx_offerings_location on public.location_course_offerings (location_id);
create index if not exists idx_offerings_variant on public.location_course_offerings (product_variant_id);
