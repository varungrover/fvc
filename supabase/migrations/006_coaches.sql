-- 1. Qualifications (Junction Table)
create table public.staff_planets (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  planet_id   uuid not null references public.planets(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique(profile_id, planet_id)
);

-- 2. Weekly Availability
create table public.staff_availability (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid not null references public.profiles(id) on delete cascade,
  day_of_week   varchar(20) not null check (day_of_week in ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
  start_time    time not null,
  end_time      time not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  check (start_time < end_time)
);

-- 3. Staff Leaves
create table public.staff_leaves (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  start_date  date not null,
  end_date    date not null,
  reason      text,
  status      varchar(20) not null default 'approved' check (status in ('pending', 'approved', 'rejected')),
  created_at  timestamptz not null default now(),
  check (start_date <= end_date)
);

-- Enable RLS
alter table public.staff_planets enable row level security;
alter table public.staff_availability enable row level security;
alter table public.staff_leaves enable row level security;

-- RLS: Admin access (Ownership scoped)
create policy "admins_manage_staff_planets" on public.staff_planets for all 
  using (exists (select 1 from public.profiles p where p.id = staff_planets.profile_id and (p.ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid) or (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')));

create policy "admins_manage_staff_availability" on public.staff_availability for all 
  using (exists (select 1 from public.profiles p where p.id = staff_availability.profile_id and (p.ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid) or (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')));

create policy "admins_manage_staff_leaves" on public.staff_leaves for all 
  using (exists (select 1 from public.profiles p where p.id = staff_leaves.profile_id and (p.ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid) or (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')));

-- RLS: Coach access (Self)
create policy "coaches_self_planets" on public.staff_planets for select using (auth.uid() = profile_id);
create policy "coaches_self_availability" on public.staff_availability for all using (auth.uid() = profile_id);
create policy "coaches_self_leaves" on public.staff_leaves for all using (auth.uid() = profile_id);
