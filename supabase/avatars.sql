-- Doparti database, stage 5: profile photos.
-- Run once in Supabase after match-validation.sql: SQL Editor -> New query -> paste -> Run.
--
-- Photos live in a public Storage bucket, one folder per user: avatars/<user id>/...
-- Anyone can see them (like any profile picture), but each user can only add,
-- change or delete files in their own folder.

begin;

-- Public link to the user's current photo (null = show their initial).
alter table public.profiles add column avatar_url text;

-- Public bucket, images only, up to 2 MB each (the app sends ~512x512 JPEGs).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

create policy "Avatars are visible to signed-in users"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars');

create policy "Users upload to their own avatar folder"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users update their own avatar files"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete their own avatar files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

commit;
