-- Design Library: jalankan sekali di Supabase Dashboard > SQL Editor.
-- Aman dijalankan ulang (idempotent).

create table if not exists public.designs (
  id          bigint generated always as identity primary key,
  source_no   integer not null unique check (source_no > 0),
  nama        text not null check (length(trim(nama)) > 0),
  category    text not null,
  sub_category text not null,
  tipe        text not null,
  link        text not null default '',
  keywords    text[] not null default '{}',
  preview     text not null default '',
  note        text not null default '',
  w           integer not null default 16 check (w > 0),
  h           integer not null default 9 check (h > 0),
  image       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists designs_set_updated_at on public.designs;
create trigger designs_set_updated_at before update on public.designs
  for each row execute function public.set_updated_at();

-- Admin = user dengan app_metadata.role = 'admin'.
-- app_metadata hanya bisa diubah lewat service role / SQL, tidak oleh user sendiri.
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
$$;

alter table public.designs enable row level security;

drop policy if exists "designs_read_all" on public.designs;
create policy "designs_read_all" on public.designs
  for select to anon, authenticated using (true);

drop policy if exists "designs_admin_insert" on public.designs;
create policy "designs_admin_insert" on public.designs
  for insert to authenticated with check (public.is_admin());

drop policy if exists "designs_admin_update" on public.designs;
create policy "designs_admin_update" on public.designs
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "designs_admin_delete" on public.designs;
create policy "designs_admin_delete" on public.designs
  for delete to authenticated using (public.is_admin());

-- Storage: bucket publik untuk gambar preview (baca publik, tulis admin).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('design-previews', 'design-previews', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "previews_admin_insert" on storage.objects;
create policy "previews_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'design-previews' and public.is_admin());

drop policy if exists "previews_admin_update" on storage.objects;
create policy "previews_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'design-previews' and public.is_admin())
  with check (bucket_id = 'design-previews' and public.is_admin());

drop policy if exists "previews_admin_delete" on storage.objects;
create policy "previews_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'design-previews' and public.is_admin());
