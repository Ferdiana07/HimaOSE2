begin;

-- Daftar admin disimpan berdasarkan UUID dari Supabase Auth, bukan berdasarkan
-- data yang dapat diubah sendiri oleh pengguna.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on table public.admin_users from anon, authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.admin_users
      where user_id = (select auth.uid())
    );
$$;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

-- Hapus seluruh policy lama pada tabel konten. Policy permissive lama yang
-- tertinggal dapat membuat policy baru tetap bisa dilewati.
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array['Beasiswa', 'Lomba', 'Program Kerja'])
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

alter table public."Beasiswa" enable row level security;
alter table public."Lomba" enable row level security;
alter table public."Program Kerja" enable row level security;

revoke all on table public."Beasiswa" from anon, authenticated;
revoke all on table public."Lomba" from anon, authenticated;
revoke all on table public."Program Kerja" from anon, authenticated;

grant select on table public."Beasiswa" to anon, authenticated;
grant select on table public."Lomba" to anon, authenticated;
grant select on table public."Program Kerja" to anon, authenticated;

grant insert, update, delete on table public."Beasiswa" to authenticated;
grant insert, update, delete on table public."Lomba" to authenticated;
grant insert, update, delete on table public."Program Kerja" to authenticated;

create policy "public can read beasiswa"
on public."Beasiswa"
for select
to anon, authenticated
using (true);

create policy "admins can insert beasiswa"
on public."Beasiswa"
for insert
to authenticated
with check ((select public.is_admin()));

create policy "admins can update beasiswa"
on public."Beasiswa"
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "admins can delete beasiswa"
on public."Beasiswa"
for delete
to authenticated
using ((select public.is_admin()));

create policy "public can read lomba"
on public."Lomba"
for select
to anon, authenticated
using (true);

create policy "admins can insert lomba"
on public."Lomba"
for insert
to authenticated
with check ((select public.is_admin()));

create policy "admins can update lomba"
on public."Lomba"
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "admins can delete lomba"
on public."Lomba"
for delete
to authenticated
using ((select public.is_admin()));

create policy "public can read program kerja"
on public."Program Kerja"
for select
to anon, authenticated
using (true);

create policy "admins can insert program kerja"
on public."Program Kerja"
for insert
to authenticated
with check ((select public.is_admin()));

create policy "admins can update program kerja"
on public."Program Kerja"
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create policy "admins can delete program kerja"
on public."Program Kerja"
for delete
to authenticated
using ((select public.is_admin()));

-- Hapus policy Storage lama yang secara khusus diterapkan pada kedua bucket.
-- Ini mencakup policy bawaan bernama acak seperti "Allow auth write 1xrrikk_1".
do $$
declare
  policy_record record;
begin
  for policy_record in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        coalesce(qual, '') ilike '%beasiswa-image%'
        or coalesce(with_check, '') ilike '%beasiswa-image%'
        or coalesce(qual, '') ilike '%Lomba-gambar%'
        or coalesce(with_check, '') ilike '%Lomba-gambar%'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

-- Policy RESTRICTIVE memastikan policy Storage yang mungkin ditambahkan di
-- masa depan tidak dapat memberi akses tulis ke dua bucket ini tanpa admin.
drop policy if exists "himaose buckets require admin for insert" on storage.objects;
drop policy if exists "himaose buckets require admin for update" on storage.objects;
drop policy if exists "himaose buckets require admin for delete" on storage.objects;
drop policy if exists "himaose admins can insert objects" on storage.objects;
drop policy if exists "himaose admins can update objects" on storage.objects;
drop policy if exists "himaose admins can delete objects" on storage.objects;

create policy "himaose buckets require admin for insert"
on storage.objects
as restrictive
for insert
to public
with check (
  bucket_id not in ('beasiswa-image', 'Lomba-gambar')
  or (select public.is_admin())
);

create policy "himaose buckets require admin for update"
on storage.objects
as restrictive
for update
to public
using (
  bucket_id not in ('beasiswa-image', 'Lomba-gambar')
  or (select public.is_admin())
)
with check (
  bucket_id not in ('beasiswa-image', 'Lomba-gambar')
  or (select public.is_admin())
);

create policy "himaose buckets require admin for delete"
on storage.objects
as restrictive
for delete
to public
using (
  bucket_id not in ('beasiswa-image', 'Lomba-gambar')
  or (select public.is_admin())
);

create policy "himaose admins can insert objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id in ('beasiswa-image', 'Lomba-gambar')
  and (select public.is_admin())
);

create policy "public can read himaose images"
on storage.objects
for select
to public
using (bucket_id in ('beasiswa-image', 'Lomba-gambar'));

create policy "himaose admins can update objects"
on storage.objects
for update
to authenticated
using (
  bucket_id in ('beasiswa-image', 'Lomba-gambar')
  and (select public.is_admin())
)
with check (
  bucket_id in ('beasiswa-image', 'Lomba-gambar')
  and (select public.is_admin())
);

create policy "himaose admins can delete objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id in ('beasiswa-image', 'Lomba-gambar')
  and (select public.is_admin())
);

commit;
