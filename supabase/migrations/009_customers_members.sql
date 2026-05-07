-- 009_customers_members.sql
-- Module 7: Customer & Member management

-- 1. Customers Table
-- Note: Every customer MUST have a row in public.profiles first.
create table public.customers (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid not null references public.profiles(id) on delete cascade unique,
  ownership_id        uuid not null references public.ownerships(id) on delete cascade,
  phone               varchar(30),
  emergency_contact   varchar(255),
  gender              varchar(20),
  cfc_id              varchar(100),
  terms_accepted      boolean not null default false,
  loyalty_points      integer not null default 0,
  stripe_customer_id  varchar(255),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- 2. Members Table
create table public.members (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.customers(id) on delete cascade,
  full_name        varchar(100) not null,
  dob              date not null,
  gender           varchar(20),
  grade            varchar(50),
  t_shirt_size     varchar(20),
  preferred_color  varchar(50),
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Enable RLS
alter table public.customers enable row level security;
alter table public.members enable row level security;

-- ==========================================
-- RLS Policies for Customers
-- ==========================================

-- 1. Self access: Customers can see/edit their own data
create policy "customers_self_access" on public.customers
  for all using (auth.uid() = profile_id);

-- 2. Admin access: Franchisor admins can see all customers
create policy "franchisor_admin_all_customers" on public.customers
  for all using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
  );

-- 3. Franchisee access: Franchisee admins can see customers in their ownership
create policy "franchisee_admin_own_customers" on public.customers
  for all using (
    ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
  );

-- ==========================================
-- RLS Policies for Members
-- ==========================================

-- 1. Self access: Customers can manage their own members
create policy "customers_manage_own_members" on public.members
  for all using (
    exists (
      select 1 from public.customers c
      where c.id = members.customer_id
      and c.profile_id = auth.uid()
    )
  );

-- 2. Admin access: Franchisor admins can see all members
create policy "franchisor_admin_all_members" on public.members
  for all using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin'
  );

-- 3. Franchisee access: Franchisee admins can see members in their ownership
create policy "franchisee_admin_own_members" on public.members
  for all using (
    exists (
      select 1 from public.customers c
      where c.id = members.customer_id
      and c.ownership_id = ((auth.jwt() -> 'app_metadata' ->> 'ownership_id')::uuid)
    )
  );

-- 4. Coach access: Coaches can see members (for attendance)
-- Note: Further restricted in application layer to only enrolled members
create policy "coaches_read_members" on public.members
  for select using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'coach'
  );

-- Trigger for updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_customer_updated
  before update on public.customers
  for each row execute function public.handle_updated_at();

create trigger on_member_updated
  before update on public.members
  for each row execute function public.handle_updated_at();
