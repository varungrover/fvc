-- 004_catalog.sql
-- Catalog: Planets, Products (Levels), Product Variants

-- planets
create table public.planets (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(100) not null unique,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.planets enable row level security;

create policy "authenticated read planets"
  on public.planets for select
  using (auth.role() = 'authenticated');

create policy "public read active planets"
  on public.planets for select
  using (is_active = true);

create policy "franchisor admin write planets"
  on public.planets for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin');

-- products (UX: levels)
create table public.products (
  id          uuid primary key default gen_random_uuid(),
  planet_id   uuid not null references public.planets(id),
  name        varchar(100) not null,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (planet_id, name)
);

alter table public.products enable row level security;

create policy "authenticated read products"
  on public.products for select
  using (auth.role() = 'authenticated');

create policy "public read active products"
  on public.products for select
  using (is_active = true);

create policy "franchisor admin write products"
  on public.products for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin');

-- product_variants (UX: course variants)
create table public.product_variants (
  id                  uuid primary key default gen_random_uuid(),
  product_id          uuid not null references public.products(id),
  frequency_per_week  smallint not null check (frequency_per_week between 1 and 7),
  base_price          numeric(10,2) not null,
  setup_fee           numeric(10,2) not null default 0,
  is_active           boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (product_id, frequency_per_week)
);

alter table public.product_variants enable row level security;

create policy "authenticated read product_variants"
  on public.product_variants for select
  using (auth.role() = 'authenticated');

create policy "public read active product_variants"
  on public.product_variants for select
  using (is_active = true);

create policy "franchisor admin write product_variants"
  on public.product_variants for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin');

create index on public.products (planet_id);
create index on public.product_variants (product_id);
