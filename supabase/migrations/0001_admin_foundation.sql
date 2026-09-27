-- =============================================================================
-- 0001 — Admin foundation: roles + helper functions + row-level security.
--
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- Roles:
--   owner  — analytics dashboard, all posts, publishing, team management
--   writer — creates/edits blog posts and submits them for review
--
-- Nobody can sign up: accounts are created/invited by the owner. The admins
-- table is the single source of truth for who may use /admin and as what.
-- Rows are written only by the service role (SQL editor or server functions),
-- so there are deliberately no insert/update/delete policies.
-- =============================================================================

create table if not exists public.admins (
    user_id    uuid primary key references auth.users (id) on delete cascade,
    email      text not null,
    role       text not null check (role in ('owner', 'writer')),
    created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Defence in depth: anonymous visitors get no table privileges at all.
revoke all on public.admins from anon;
grant select on public.admins to authenticated;

-- -----------------------------------------------------------------------------
-- Helpers used by policies (this table's and future ones: posts, analytics).
-- SECURITY DEFINER so they can read public.admins without tripping its own RLS;
-- they only ever answer questions about the calling user (auth.uid()).
-- -----------------------------------------------------------------------------
create or replace function public.admin_role()
returns text
language sql stable security definer
set search_path = ''
as $$
    select role from public.admins where user_id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
    select exists (select 1 from public.admins where user_id = auth.uid())
$$;

create or replace function public.is_owner()
returns boolean
language sql stable security definer
set search_path = ''
as $$
    select exists (select 1 from public.admins where user_id = auth.uid() and role = 'owner')
$$;

revoke execute on function public.admin_role(), public.is_admin(), public.is_owner() from public, anon;
grant execute on function public.admin_role(), public.is_admin(), public.is_owner() to authenticated;

-- -----------------------------------------------------------------------------
-- Policies
-- -----------------------------------------------------------------------------
drop policy if exists "admins: read own row" on public.admins;
create policy "admins: read own row"
    on public.admins for select to authenticated
    using (user_id = (select auth.uid()));

drop policy if exists "admins: owner reads all" on public.admins;
create policy "admins: owner reads all"
    on public.admins for select to authenticated
    using ((select public.is_owner()));
