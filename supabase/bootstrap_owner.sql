-- =============================================================================
-- One-time: make an existing Supabase user the site owner.
--
-- 1. Create the user first: Authentication → Users → Add user → Create new user
--    (tick "Auto Confirm User").
-- 2. Run this in SQL Editor. Change the email below to promote someone else.
-- =============================================================================
insert into public.admins (user_id, email, role)
select id, email, 'owner'
from auth.users
where email = 'aateck.2002@gmail.com'
on conflict (user_id) do update set role = 'owner', email = excluded.email;

-- Check: should return one row with role = owner.
select user_id, email, role from public.admins;
