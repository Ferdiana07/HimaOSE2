# Pengamanan Supabase HIMAOSE

File di folder ini mengunci operasi tambah, edit, dan hapus agar hanya UUID
yang terdaftar di `public.admin_users` yang dapat melakukannya.

## Urutan penerapan

1. Pastikan akun admin sudah ada di **Authentication > Users**.
2. Jalankan `migrations/202610190001_lock_content_writes.sql` di SQL Editor.
3. Jalankan `migrations/202610190002_revoke_anon_is_admin.sql` di SQL Editor.
4. Periksa dua alamat email di `bootstrap-admin.sql`, lalu jalankan file tersebut
   di SQL Editor.
5. Di **Authentication > Providers > Email**, matikan **Allow new users to
   sign up**. RLS tetap menjadi pengaman utama, tetapi signup publik tidak
   diperlukan untuk situs ini.
6. Jalankan `verify-security.sql` di SQL Editor dan lakukan uji akun non-admin
   melalui jendela incognito.

Jangan pernah menaruh `service_role` key di HTML atau JavaScript. Kunci `anon`
memang boleh berada di frontend karena hak aksesnya dibatasi oleh RLS.

`202610190002_revoke_anon_is_admin.sql` aman dijalankan meskipun migration
pertama telah diterapkan. File ini diperlukan untuk proyek yang menjalankan
versi awal migration pertama sebelum izin fungsi untuk role `anon` diperketat.

## Menambah atau mencabut admin

Tambahkan admin berdasarkan UUID:

```sql
insert into public.admin_users (user_id)
select id from auth.users where lower(email) = lower('admin@example.com')
on conflict (user_id) do nothing;
```

Cabut akses admin:

```sql
delete from public.admin_users
where user_id = (
  select id from auth.users where lower(email) = lower('admin@example.com')
);
```
