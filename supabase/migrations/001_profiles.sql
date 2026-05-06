-- Lookup table for user roles
create table public.roles (
  id    serial primary key,
  name  varchar(50) not null unique
);

insert into public.roles (name) values
  ('franchisor_admin'),
  ('franchisor_mgmt'),
  ('franchisee_admin'),
  ('franchisee_mgmt'),
  ('coach'),
  ('customer');

-- profiles extends auth.users with app-specific identity fields
create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  email            varchar(255) not null,
  full_name        varchar(100) not null default '',
  role_id          integer not null references public.roles(id),
  ownership_id     uuid,                             -- FK to ownerships added in later migration
  is_active        boolean not null default true,
  must_reset_pw    boolean not null default false,
  two_fa_phone     varchar(30),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Auto-create profile row on auth.users insert; reads fields from app_metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role_id integer;
begin
  select id into v_role_id
    from public.roles
   where name = new.raw_app_meta_data->>'role';

  insert into public.profiles (id, email, full_name, role_id, ownership_id, must_reset_pw)
  values (
    new.id,
    new.email,
    coalesce(new.raw_app_meta_data->>'full_name', new.raw_user_meta_data->>'full_name', ''),
    v_role_id,
    (new.raw_app_meta_data->>'ownership_id')::uuid,
    coalesce((new.raw_app_meta_data->>'must_change_password')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
