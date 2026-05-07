-- Module 10: Attendance, Sessions & Trials

-- Attendance
create table public.attendance (
    id uuid primary key default gen_random_uuid(),
    roster_assignment_id uuid not null references public.roster_assignments(id) on delete cascade,
    member_id uuid not null references public.members(id) on delete cascade,
    enrollment_id uuid references public.enrollments(id) on delete set null,
    status varchar(30) not null check (status in (
        'expected', 'present', 'absent', 'makeup booked', 
        'trial booked', 'makeup attended', 'trial attended'
    )),
    marked_at timestamptz not null default now(),
    marked_by uuid not null references public.profiles(id),
    unique (roster_assignment_id, member_id)
);

-- Session Notes
create table public.session_notes (
    id uuid primary key default gen_random_uuid(),
    roster_assignment_id uuid not null references public.roster_assignments(id) on delete cascade,
    coach_id uuid not null references public.profiles(id),
    topic_covered text,
    homework_notes text,
    general_notes text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (roster_assignment_id)
);

-- Trials
create table public.trials (
    id uuid primary key default gen_random_uuid(),
    member_id uuid not null references public.members(id) on delete cascade,
    location_id uuid not null references public.locations(id),
    batch_id uuid not null references public.batches(id),
    roster_assignment_id uuid references public.roster_assignments(id),
    status varchar(20) not null default 'scheduled' 
        check (status in ('scheduled', 'completed', 'no_show', 'converted')),
    created_at timestamptz not null default now()
);

-- Trial Assessments
create table public.trial_assessments (
    id uuid primary key default gen_random_uuid(),
    trial_id uuid not null references public.trials(id) on delete cascade,
    coach_id uuid not null references public.profiles(id),
    assessment_text text not null,
    attachment_url text,
    recommended_batch_ids uuid[],
    created_at timestamptz not null default now(),
    unique (trial_id)
  );

-- RLS
alter table public.attendance enable row level security;
alter table public.session_notes enable row level security;
alter table public.trials enable row level security;
alter table public.trial_assessments enable row level security;

create policy "coach_manage_attendance" on public.attendance for all
  using (exists (select 1 from roster_assignments ra where ra.id = roster_assignment_id and ra.coach_id = auth.uid()));

create policy "admin_all_attendance" on public.attendance for all using (true);

create policy "customer_read_member_attendance" on public.attendance for select
  using (member_id in (select id from members where customer_id = auth.uid()));

create policy "coach_manage_notes" on public.session_notes for all
  using (exists (select 1 from roster_assignments ra where ra.id = roster_assignment_id and ra.coach_id = auth.uid()));

create policy "admin_all_notes" on public.session_notes for all using (true);

create policy "admin_all_trials" on public.trials for all using (true);
create policy "admin_all_assessments" on public.trial_assessments for all using (true);

create policy "customer_own_trials" on public.trials for all
  using (member_id in (select id from members where customer_id = auth.uid()));

