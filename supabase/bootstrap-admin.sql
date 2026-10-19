-- Jalankan di Supabase SQL Editor. Kedua akun ini harus sudah ada di
-- Authentication > Users.
do $$
declare
  admin_email text;
  admin_user_id uuid;
begin
  foreach admin_email in array array[
    'ferdiyana622@gmail.com',
    'himaose2026@gmail.com'
  ]
  loop
    select id
      into admin_user_id
    from auth.users
    where lower(email) = lower(admin_email)
    limit 1;

    if admin_user_id is null then
      raise exception 'Akun dengan email % tidak ditemukan di Supabase Auth', admin_email;
    end if;

    insert into public.admin_users (user_id)
    values (admin_user_id)
    on conflict (user_id) do nothing;
  end loop;
end
$$;
