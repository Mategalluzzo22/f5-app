-- F5 app database schema (stage 1: accounts + own matches).
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.

-- One profile per user, with the public username friends will search by.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null check (username ~ '^[a-z0-9_]{3,20}$'),
  created_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  date date not null,
  opponent text not null check (length(opponent) between 1 and 60),
  result text not null check (result in ('win', 'draw', 'loss')),
  goals int not null check (goals between 0 and 99),
  created_at timestamptz not null default now()
);

create index matches_user_id_idx on public.matches (user_id);

-- Row Level Security: the app's public key can only do what these policies allow.
alter table public.profiles enable row level security;
alter table public.matches enable row level security;

-- Signed-in users can see usernames (needed to find friends later).
create policy "Signed-in users can read profiles"
  on public.profiles for select to authenticated
  using (true);

create policy "Users create their own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid());

-- For now each user only sees and changes their own matches.
create policy "Users read their own matches"
  on public.matches for select to authenticated
  using (user_id = auth.uid());

create policy "Users add their own matches"
  on public.matches for insert to authenticated
  with check (user_id = auth.uid());

create policy "Users delete their own matches"
  on public.matches for delete to authenticated
  using (user_id = auth.uid());
