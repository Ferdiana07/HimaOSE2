-- Jalankan migration ini jika 202610190001_lock_content_writes.sql sudah
-- pernah diterapkan sebelum baris REVOKE untuk role anon ditambahkan.
begin;

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;

commit;
