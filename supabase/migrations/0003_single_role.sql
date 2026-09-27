-- =============================================================================
-- 0003 — One role for everyone: "admin".
--
-- Run once in Supabase → SQL Editor (after 0001 and 0002). Safe to re-run.
--
-- The owner/writer split from 0001 is dropped: every admin can use the whole
-- admin area (dashboard, blog, team). The `role` column stays (always
-- 'admin') so separate roles can come back later without reshaping data.
-- =============================================================================

-- Order matters: lift the old owner/writer rule before converting the rows.
alter table public.admins drop constraint if exists admins_role_check;
update public.admins set role = 'admin' where role <> 'admin';
alter table public.admins add constraint admins_role_check check (role = 'admin');
alter table public.admins alter column role set default 'admin';

-- Every admin can see the whole team.
drop policy if exists "admins: owner reads all" on public.admins;
drop policy if exists "admins: admins read all" on public.admins;
create policy "admins: admins read all"
    on public.admins for select to authenticated
    using ((select public.is_admin()));

-- is_owner() gated "full access" in 0002 (analytics_dashboard). With a single
-- role, full access simply means being an admin.
create or replace function public.is_owner()
returns boolean
language sql stable security definer
set search_path = ''
as $$
    select public.is_admin()
$$;
