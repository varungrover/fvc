-- 006_holidays.sql
-- Holidays: System-wide, Ownership-wide, or Location-specific

create table if not exists public.holidays (
  id           uuid primary key default gen_random_uuid(),
  holiday_date date not null,
  description  varchar(255) not null,
  ownership_id uuid references public.ownerships(id),
  location_id  uuid references public.locations(id),
  created_at   timestamptz not null default now(),
  -- A holiday is scoped to ownership OR location, not both simultaneously
  constraint holidays_single_scope check (
    not (ownership_id is not null and location_id is not null)
  ),
  unique (holiday_date, ownership_id, location_id)
);

alter table public.holidays enable row level security;

-- Global holidays: visible to all authenticated users
create policy "authenticated read global holidays"
  on public.holidays for select
  using (
    auth.role() = 'authenticated'
    and ownership_id is null
    and location_id is null
  );

-- Ownership-scoped holidays: visible to own ownership
create policy "authenticated read own ownership holidays"
  on public.holidays for select
  using (
    ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
  );

-- Location-scoped holidays: visible to own ownership
create policy "authenticated read own location holidays"
  on public.holidays for select
  using (
    location_id in (
      select id from public.locations
      where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
    )
  );

-- FA: write all holidays
create policy "franchisor admin write holidays"
  on public.holidays for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin');

-- XA: write own ownership/location holidays
create policy "franchisee admin write own holidays"
  on public.holidays for all
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
    and (
      ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
      or location_id in (
        select id from public.locations
        where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
      )
    )
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisee_admin'
    and (
      ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
      or location_id in (
        select id from public.locations
        where ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
      )
    )
  );
