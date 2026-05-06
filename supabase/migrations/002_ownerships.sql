create table public.ownerships (
  id             uuid primary key default gen_random_uuid(),
  full_name      varchar(255) not null,
  email          varchar(255) not null unique,
  ownership_type varchar(20)  not null check (ownership_type in ('corporate', 'franchisee')),
  slug           varchar(100) not null unique,
  logo_url       varchar(500),
  brand_primary  varchar(20)  not null default '#0a9b8a',
  brand_accent   varchar(20)  not null default '#e67e22',
  tagline        text,
  is_active      boolean      not null default true,
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now()
);

-- RLS
alter table public.ownerships enable row level security;

-- FA/FM: read all ownerships
create policy "franchisor staff read all ownerships"
  on public.ownerships for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('franchisor_admin', 'franchisor_mgmt')
  );

-- XA/XM/CO/CX: read own ownership only
create policy "scoped users read own ownership"
  on public.ownerships for select
  using (
    id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
  );

-- Public: read active ownerships (branding for storefront — no email exposed)
create policy "public read active ownerships"
  on public.ownerships for select
  using (is_active = true);

-- FA: insert
create policy "franchisor admin insert ownership"
  on public.ownerships for insert
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
  );

-- FA: update
create policy "franchisor admin update ownership"
  on public.ownerships for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
  );

-- Add FK from profiles.ownership_id to ownerships.id
alter table public.profiles
  add constraint profiles_ownership_id_fkey
  foreign key (ownership_id) references public.ownerships(id);
