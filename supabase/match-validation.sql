-- Doparti database, stage 4: goal limits and matches without a score.
-- Run once in Supabase after shared-matches.sql: SQL Editor -> New query -> paste -> Run.
--
-- 1. Nobody can have more goals than their team scored (when the score is known).
-- 2. A match can be saved without a score, with the result picked by hand. Each
--    friend gets that result from their side (a win for my team is a loss for the rivals).

begin;

-- The hand-picked result is no longer only for old matches: it's also used when
-- someone doesn't remember the exact score.
alter table public.match_players rename column legacy_result to manual_result;

drop function public.create_match(date, smallint, text, int, int, int, jsonb);

create function public.create_match(
  match_date date,
  match_format smallint,
  match_group text,
  my_team_score int,
  rival_score int,
  my_result text,
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
  player_team text;
  has_score boolean := my_team_score is not null and rival_score is not null;
begin
  if auth.uid() is null then
    raise exception 'Not logged in';
  end if;
  if (my_team_score is null) <> (rival_score is null) then
    raise exception 'Give both scores or none';
  end if;
  if not has_score and (my_result is null or my_result not in ('win', 'draw', 'loss')) then
    raise exception 'Without a score, the result is needed';
  end if;
  if has_score and my_goals is not null and my_goals > my_team_score then
    raise exception 'You cannot score more goals than your team';
  end if;

  insert into matches (created_by, date, format, group_name, score_a, score_b)
  values (auth.uid(), match_date, match_format, nullif(trim(match_group), ''), my_team_score, rival_score)
  returning id into new_id;

  -- The creator plays for team A and is confirmed right away.
  insert into match_players (match_id, user_id, team, goals, status, manual_result)
  values (new_id, auth.uid(), 'A', my_goals, 'confirmed', case when has_score then null else my_result end);

  -- Everyone else must be a friend and has to confirm. Without a score, their
  -- result is the creator's result seen from their team.
  for player in select * from jsonb_array_elements(coalesce(players, '[]'::jsonb)) loop
    if not is_friend((player ->> 'user_id')::uuid) then
      raise exception 'Only friends can be added to a match';
    end if;
    player_team := player ->> 'team';
    insert into match_players (match_id, user_id, team, status, manual_result)
    values (
      new_id,
      (player ->> 'user_id')::uuid,
      player_team,
      'pending',
      case
        when has_score then null
        when player_team = 'A' then my_result
        when my_result = 'win' then 'loss'
        when my_result = 'loss' then 'win'
        else 'draw'
      end
    );
  end loop;

  return new_id;
end;
$$;

-- Confirming also checks the goal limit against the player's own team.
create or replace function public.confirm_match(mid uuid, my_goals int)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  team_score int;
begin
  select case when p.team = 'A' then m.score_a else m.score_b end
  into team_score
  from match_players p
  join matches m on m.id = p.match_id
  where p.match_id = mid and p.user_id = auth.uid() and p.status = 'pending';

  if team_score is not null and my_goals is not null and my_goals > team_score then
    raise exception 'You cannot score more goals than your team';
  end if;

  update match_players
  set status = 'confirmed', goals = my_goals
  where match_id = mid and user_id = auth.uid() and status = 'pending';
end;
$$;

commit;
