-- profiles extends auth.users with app-specific identity fields
create table public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  role                 text not null,
  ownership_id         text,
  full_name            text not null default '',
  must_change_password boolean not null default false,
  created_at           timestamptz not null default now()
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
begin
  insert into public.profiles (id, role, ownership_id, full_name, must_change_password)
  values (
    new.id,
    new.raw_app_meta_data->>'role',
    new.raw_app_meta_data->>'ownership_id',
    coalesce(new.raw_app_meta_data->>'full_name', new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_app_meta_data->>'must_change_password')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
