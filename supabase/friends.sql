-- Doparti database, stage 2: friends.
-- Run once in Supabase after schema.sql: SQL Editor -> New query -> paste -> Run.

-- A friend request from requester to addressee. 'pending' until the addressee accepts.
create table public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null default auth.uid() references public.profiles on delete cascade,
  addressee_id uuid not null references public.profiles on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  check (requester_id <> addressee_id)
);

-- Only one friendship per pair of users, whoever sent it.
create unique index friendships_pair_idx
  on public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

alter table public.friendships enable row level security;

create policy "Users see their own friendships"
  on public.friendships for select to authenticated
  using (auth.uid() in (requester_id, addressee_id));

create policy "Users send friend requests"
  on public.friendships for insert to authenticated
  with check (requester_id = auth.uid() and status = 'pending');

-- Rejecting a request or removing a friend: either side can delete it.
create policy "Either side removes a friendship"
  on public.friendships for delete to authenticated
  using (auth.uid() in (requester_id, addressee_id));

-- Accepting goes through this function instead of an update policy, so the
-- addressee can only flip the status and never change who the friendship is with.
create function public.accept_friend_request(request_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update friendships
  set status = 'accepted'
  where id = request_id and addressee_id = auth.uid() and status = 'pending';
$$;

-- True when `other` is an accepted friend of the logged-in user.
create function public.is_friend(other uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from friendships
    where status = 'accepted'
      and ((requester_id = auth.uid() and addressee_id = other)
        or (addressee_id = auth.uid() and requester_id = other))
  );
$$;

-- Friends can see each other's matches (read only).
create policy "Friends read each other's matches"
  on public.matches for select to authenticated
  using (public.is_friend(user_id));
