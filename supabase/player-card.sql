-- Doparti database: player card (position, foot, shirt number, favorite team).
-- Run once in Supabase after avatars.sql: SQL Editor -> New query -> paste -> Run.
--
-- Everything is optional (null = not set). Friends can read it through the
-- existing "Signed-in users can read profiles" policy, and each user can only
-- change their own through "Users update their own profile".

begin;

alter table public.profiles
  add column position text check (position in ('goalkeeper', 'defender', 'midfielder', 'forward')),
  add column foot text check (foot in ('right', 'left', 'both')),
  add column shirt_number smallint check (shirt_number between 0 and 99),
  add column favorite_team text check (length(favorite_team) between 1 and 40);

commit;
