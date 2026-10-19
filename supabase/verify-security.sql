-- Read-only verification for the HIMAOSE security setup.
-- Run this in Supabase SQL Editor; it does not change data.

-- Expected: exactly the two intended administrator email addresses.
select
  u.email,
  a.created_at
from public.admin_users as a
join auth.users as u on u.id = a.user_id
order by u.email;

-- Expected: false / true.
select
  has_function_privilege('anon', 'public.is_admin()', 'execute')
    as anon_boleh_panggil_is_admin,
  has_function_privilege('authenticated', 'public.is_admin()', 'execute')
    as authenticated_boleh_panggil_is_admin;

-- Expected: public SELECT plus authenticated INSERT, UPDATE, and DELETE
-- policies restricted by public.is_admin() for each content table.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where
  (schemaname = 'public'
   and tablename in ('Beasiswa', 'Lomba', 'Program Kerja'))
  or (schemaname = 'storage' and tablename = 'objects')
order by schemaname, tablename, policyname;
