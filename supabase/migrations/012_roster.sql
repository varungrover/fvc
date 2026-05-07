-- Module 9: Roster

-- Rosters (Week-level container)
create table public.rosters (
    id uuid primary key default gen_random_uuid(),
    location_id uuid not null references public.locations(id) on delete cascade,
    ownership_id uuid not null references public.ownerships(id),
    week_starting date not null,
    status varchar(20) not null default 'draft' check (status in ('draft', 'published')),
    published_at timestamptz,
    created_by uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    unique (location_id, week_starting)
);

-- Roster Assignments (Coach assignment to slot)
create table public.roster_assignments (
    id uuid primary key default gen_random_uuid(),
    roster_id uuid not null references public.rosters(id) on delete cascade,
    batch_id uuid not null references public.batches(id),
    session_date date not null,
    coach_id uuid references public.profiles(id),
    created_at timestamptz not null default now(),
    unique (roster_id, batch_id, session_date)
);

-- RLS Policies
alter table public.rosters enable row level security;
alter table public.roster_assignments enable row level security;

create policy "franchisor_all_rosters" on public.rosters for all
  using ((auth.jwt()->'app_metadata'->>'role') in ('franchisor_admin','franchisor_mgmt'));

create policy "franchisee_own_rosters" on public.rosters for all
  using (ownership_id = ((auth.jwt()->'app_metadata'->>'ownership_id')::uuid));

create policy "coach_read_published_rosters" on public.rosters for select
  using ((auth.jwt()->'app_metadata'->>'role') = 'coach' and status = 'published');

create policy "admin_all_assignments" on public.roster_assignments for all using (true);

create policy "coach_read_own_assignments" on public.roster_assignments for select
  using (coach_id = auth.uid() and exists (select 1 from public.rosters r where r.id = roster_id and r.status = 'published'));

