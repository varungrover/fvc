create table public.locations (
  id              uuid primary key default gen_random_uuid(),
  ownership_id    uuid not null references public.ownerships(id),
  name            varchar(255) not null,
  address_line1   varchar(255) not null,
  address_line2   varchar(255),
  city            varchar(100) not null,
  state_province  varchar(100) not null,
  country         varchar(100) not null default 'Canada',
  postal_code     varchar(20),
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.locations enable row level security;

-- FA/FM: read all locations globally
create policy "franchisor staff read all locations"
  on public.locations for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('franchisor_admin', 'franchisor_mgmt')
  );

-- Scoped roles: read only locations belonging to their ownership
create policy "scoped users read own ownership locations"
  on public.locations for select
  using (
    ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
  );

-- Public: read active locations (storefront use — intentionally grants read to all active
-- locations globally; ownership scoping happens at the API layer via /api/public/locations?ownershipId=)
create policy "public read active locations"
  on public.locations for select
  using (is_active = true);

-- FA: insert any location
create policy "franchisor admin insert location"
  on public.locations for insert
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
  );

-- XA: insert locations under their own ownership
create policy "franchisee admin insert own location"
  on public.locations for insert
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
    and ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
  );

-- FA: update any location
create policy "franchisor admin update location"
  on public.locations for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
  );

-- XA: update locations under their own ownership
create policy "franchisee admin update own location"
  on public.locations for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
    and ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
    and ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
  );

create index on public.locations (ownership_id);
