-- =============================================================================
-- One-time: give an existing Supabase user admin access.
--
-- Normally you add people from /admin → Team. Use this only to bootstrap the
-- first admin (or recover access):
-- 1. Create the user: Authentication → Users → Add user → Create new user
--    (tick "Auto Confirm User").
-- 2. Run this in SQL Editor with their email.
-- =============================================================================
insert into public.admins (user_id, email, role)
select id, email, 'admin'
from auth.users
where email = 'aateck.2002@gmail.com'
on conflict (user_id) do update set role = 'admin', email = excluded.email;

-- Check: should return the admin row(s).
select user_id, email, role from public.admins;
