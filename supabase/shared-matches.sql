-- Doparti database, stage 3: shared matches.
-- A match has a score, two teams (A = the creator's team, B = rivals) and players.
-- Each player's win/draw/loss comes from the score and their team.
-- Run once in Supabase after schema.sql and friends.sql: SQL Editor -> New query -> paste -> Run.

begin;

-- 1. New match columns.
alter table public.matches
  add column created_by uuid references public.profiles on delete cascade,
  add column format smallint not null default 5 check (format in (5, 7, 8, 11)),
  add column group_name text check (group_name is null or length(group_name) between 1 and 60),
  add column score_a int check (score_a between 0 and 99),
  add column score_b int check (score_b between 0 and 99),
  add constraint matches_score_both_or_none check ((score_a is null) = (score_b is null));

-- 2. Players of each match.
create table public.match_players (
  match_id uuid not null references public.matches on delete cascade,
  user_id uuid not null references public.profiles on delete cascade,
  team text not null check (team in ('A', 'B')),
  goals int check (goals between 0 and 99), -- null = not recorded, which is not the same as 0
  status text not null default 'pending' check (status in ('pending', 'confirmed')),
  -- Only for matches saved before scores existed: the result the user picked by hand.
  legacy_result text check (legacy_result in ('win', 'draw', 'loss')),
  created_at timestamptz not null default now(),
  primary key (match_id, user_id)
);

create index match_players_user_id_idx on public.match_players (user_id);

-- 3. Existing matches become matches without a score, with their owner as the
--    only (confirmed) player. The old "rival" becomes the group.
update public.matches set created_by = user_id, group_name = opponent;

insert into public.match_players (match_id, user_id, team, goals, status, legacy_result)
  select id, user_id, 'A', goals, 'confirmed', result from public.matches;

-- 4. Drop the old per-user columns and the policies that used them.
drop policy "Users read their own matches" on public.matches;
drop policy "Users add their own matches" on public.matches;
drop policy "Users delete their own matches" on public.matches;
drop policy "Friends read each other's matches" on public.matches;
drop index if exists public.matches_user_id_idx;

alter table public.matches
  drop column user_id,
  drop column opponent,
  drop column result,
  drop column goals;

alter table public.matches
  alter column created_by set not null,
  alter column created_by set default auth.uid();

-- 5. Who can see a match: its players (even before confirming), and friends of
--    any player who confirmed it.
create function public.can_view_match(mid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from match_players p
    where p.match_id = mid
      and (p.user_id = auth.uid() or (p.status = 'confirmed' and is_friend(p.user_id)))
  );
$$;

alter table public.match_players enable row level security;

create policy "Users see matches they can view"
  on public.matches for select to authenticated
  using (public.can_view_match(id));

create policy "Users see players of matches they can view"
  on public.match_players for select to authenticated
  using (public.can_view_match(match_id));

create policy "The creator deletes the match"
  on public.matches for delete to authenticated
  using (created_by = auth.uid());

-- A player who didn't play can leave the match (the creator deletes it instead).
create policy "Players leave a match"
  on public.match_players for delete to authenticated
  using (
    user_id = auth.uid()
    and not exists (select 1 from public.matches m where m.id = match_id and m.created_by = auth.uid())
  );

-- 6. Matches are created only through this function, so the match and its players
--    are saved together and only friends can be added.
create function public.create_match(
  match_date date,
  match_format smallint,
  match_group text,
  my_team_score int,
  rival_score int,
  my_goals int,
  players jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
  player jsonb;
begin
  if auth.uid() is null then
    raise exception 'Not logged in';
  end if;
  if my_team_score is null or rival_score is null then
    raise exception 'A new match needs a score';
  end if;

  insert into matches (created_by, date, format, group_name, score_a, score_b)
  values (auth.uid(), match_date, match_format, nullif(trim(match_group), ''), my_team_score, rival_score)
  returning id into new_id;

  -- The creator plays for team A and is confirmed right away.
  insert into match_players (match_id, user_id, team, goals, status)
  values (new_id, auth.uid(), 'A', my_goals, 'confirmed');

  -- Everyone else must be a friend and has to confirm.
  for player in select * from jsonb_array_elements(coalesce(players, '[]'::jsonb)) loop
    if not is_friend((player ->> 'user_id')::uuid) then
      raise exception 'Only friends can be added to a match';
    end if;
    insert into match_players (match_id, user_id, team, status)
    values (new_id, (player ->> 'user_id')::uuid, player ->> 'team', 'pending');
  end loop;

  return new_id;
end;
$$;

-- 7. A player confirms they played, and says how many goals they scored (null = not recorded).
create function public.confirm_match(mid uuid, my_goals int)
returns void
language sql
security definer
set search_path = public
as $$
  update match_players
  set status = 'confirmed', goals = my_goals
  where match_id = mid and user_id = auth.uid() and status = 'pending';
$$;

commit;
