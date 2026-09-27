-- =============================================================================
-- 0005 — Public blog: keep old addresses of posts working.
--
-- Run once in Supabase → SQL Editor (after 0004). Safe to re-run.
--
-- When the URL of a post that has ever been published changes, the old one is
-- remembered in `old_slugs`; the site build turns each into a permanent
-- redirect, so links people already shared (and Google's index) keep working.
-- The list is maintained here only — whatever a client sends is ignored.
-- =============================================================================

alter table public.posts add column if not exists old_slugs text[] not null default '{}';

create or replace function public.posts_bookkeeping()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
begin
    new.updated_at := now();
    new.updated_by := coalesce(auth.uid(), new.updated_by);
    if tg_op = 'INSERT' then
        new.created_at := now();
        new.author_id  := coalesce(auth.uid(), new.author_id);
        new.old_slugs  := '{}';
    else
        new.created_at := old.created_at;
        new.author_id  := old.author_id; -- who created it never changes
        new.old_slugs  := old.old_slugs;
        -- A post that has been public keeps answering at its earlier addresses.
        if old.published_at is not null and old.slug is not null and new.slug is distinct from old.slug then
            new.old_slugs := array_append(array_remove(new.old_slugs, old.slug), old.slug);
        end if;
        new.old_slugs := array_remove(new.old_slugs, new.slug); -- moved back to an earlier address
    end if;
    if new.status = 'published' then
        -- Keep the original publish date when a post is unpublished and published again.
        new.published_at := coalesce(case when tg_op = 'UPDATE' then old.published_at end, new.published_at, now());
    else
        new.pending := null; -- drafts are edited directly; nothing is pending
    end if;
    return new;
end;
$$;

-- The site build (anon key) reads it, for published posts only (existing policy).
grant select (old_slugs) on public.posts to anon;
