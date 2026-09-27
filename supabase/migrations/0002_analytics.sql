-- =============================================================================
-- 0002 — First-party, cookieless analytics.
--
-- Run once in Supabase → SQL Editor (after 0001). Safe to re-run.
--
-- Privacy model: no cookies, no IP addresses stored. `visitor_id` is a one-way
-- hash of (secret salt + Pontianak date + IP + user agent) computed in the
-- Netlify function, so it changes every day and can't be traced back or used
-- to follow someone across days. Location is coarse (country / region / city).
--
-- Access: nobody reads or writes `events` directly. The Netlify function
-- inserts with the service role; the owner reads aggregates only, through
-- analytics_dashboard().
-- =============================================================================

create table if not exists public.events (
    id            bigint generated always as identity primary key,
    created_at    timestamptz not null default now(),
    name          text not null check (name in (
                      'pageview', 'contact_click', 'outbound_click', 'service_tab',
                      'section_view', 'scroll_depth', 'language_switch', 'video_unmute')),
    visitor_id    text not null check (char_length(visitor_id) <= 64),
    path          text not null check (char_length(path) <= 200),
    lang          text check (lang in ('en', 'id')),
    source        text check (char_length(source) <= 100),
    referrer_host text check (char_length(referrer_host) <= 100),
    utm_source    text check (char_length(utm_source) <= 100),
    utm_medium    text check (char_length(utm_medium) <= 100),
    utm_campaign  text check (char_length(utm_campaign) <= 100),
    device        text check (device in ('mobile', 'tablet', 'desktop')),
    country       text check (char_length(country) <= 60),
    region        text check (char_length(region) <= 100),
    city          text check (char_length(city) <= 100),
    props         jsonb not null default '{}'::jsonb check (pg_column_size(props) <= 1024)
);

create index if not exists events_created_at_idx on public.events (created_at);
create index if not exists events_name_created_at_idx on public.events (name, created_at);

alter table public.events enable row level security;
-- No policies on purpose: with RLS on and no policy, anon/authenticated get nothing.
revoke all on public.events from anon, authenticated;

-- -----------------------------------------------------------------------------
-- analytics_dashboard(from, to) — everything the dashboard shows, in one call.
-- Dates are Pontianak (WIB) calendar days, inclusive. Owner only.
-- -----------------------------------------------------------------------------
create or replace function public.analytics_dashboard(p_from date, p_to date)
returns jsonb
language plpgsql stable security definer
set search_path = ''
as $$
declare
    tz          constant text := 'Asia/Pontianak';
    home_paths  constant text[] := array['/', '/id/'];
    v_days      int := p_to - p_from + 1;
    v_from      timestamptz := p_from::timestamp at time zone tz;
    v_to        timestamptz := (p_to + 1)::timestamp at time zone tz;
    v_prev_from timestamptz := (p_from - (p_to - p_from + 1))::timestamp at time zone tz;
    result      jsonb;
begin
    if not public.is_owner() then
        raise exception 'Only the site owner can view analytics' using errcode = '42501';
    end if;
    if p_from is null or p_to is null or p_to < p_from or v_days > 400 then
        raise exception 'Invalid date range' using errcode = '22023';
    end if;

    with ev as (
        select e.*, (e.created_at at time zone tz)::date as day
        from public.events e
        where e.created_at >= v_prev_from and e.created_at < v_to
    ),
    cur  as (select * from ev where created_at >= v_from),
    prev as (select * from ev where created_at < v_from),
    home_visitors as (
        select count(distinct visitor_id) as n
        from cur where name = 'pageview' and path = any (home_paths)
    )
    select jsonb_build_object(
        'range', jsonb_build_object('from', p_from, 'to', p_to, 'days', v_days, 'timezone', tz),

        'summary', (select jsonb_build_object(
            'visitors',            count(distinct visitor_id) filter (where name = 'pageview'),
            'pageviews',           count(*) filter (where name = 'pageview'),
            'contact_clicks',      count(*) filter (where name = 'contact_click'),
            'converting_visitors', count(distinct visitor_id) filter (where name = 'contact_click')
        ) from cur),

        'previous', (select jsonb_build_object(
            'visitors',            count(distinct visitor_id) filter (where name = 'pageview'),
            'pageviews',           count(*) filter (where name = 'pageview'),
            'contact_clicks',      count(*) filter (where name = 'contact_click'),
            'converting_visitors', count(distinct visitor_id) filter (where name = 'contact_click')
        ) from prev),

        'live_visitors', (select count(distinct visitor_id) from public.events
                          where created_at > now() - interval '30 minutes'),

        'timeseries', (select coalesce(jsonb_agg(jsonb_build_object(
                'day', d.day, 'visitors', coalesce(a.visitors, 0), 'pageviews', coalesce(a.pageviews, 0),
                'contact_clicks', coalesce(a.contact_clicks, 0), 'converting_visitors', coalesce(a.converting, 0)
            ) order by d.day), '[]'::jsonb)
            from (select g::date as day from generate_series(p_from::timestamp, p_to::timestamp, interval '1 day') g) d
            left join (
                select day,
                       count(distinct visitor_id) filter (where name = 'pageview') as visitors,
                       count(*) filter (where name = 'pageview') as pageviews,
                       count(*) filter (where name = 'contact_click') as contact_clicks,
                       count(distinct visitor_id) filter (where name = 'contact_click') as converting
                from cur group by day
            ) a on a.day = d.day),

        'sources', (select coalesce(jsonb_agg(x order by x.visitors desc, x.label), '[]'::jsonb) from (
            select coalesce(source, 'Direct') as label, count(distinct visitor_id) as visitors, count(*) as pageviews
            from cur where name = 'pageview' group by 1 order by 2 desc, 1 limit 10) x),

        'pages', (select coalesce(jsonb_agg(x order by x.pageviews desc, x.label), '[]'::jsonb) from (
            select path as label, count(distinct visitor_id) as visitors, count(*) as pageviews
            from cur where name = 'pageview' group by 1 order by 3 desc, 1 limit 10) x),

        'languages', (select coalesce(jsonb_agg(x order by x.visitors desc), '[]'::jsonb) from (
            select coalesce(lang, 'unknown') as label, count(distinct visitor_id) as visitors
            from cur where name = 'pageview' group by 1) x),

        'devices', (select coalesce(jsonb_agg(x order by x.visitors desc), '[]'::jsonb) from (
            select coalesce(device, 'unknown') as label, count(distinct visitor_id) as visitors
            from cur where name = 'pageview' group by 1) x),

        'countries', (select coalesce(jsonb_agg(x order by x.visitors desc, x.label), '[]'::jsonb) from (
            select coalesce(country, 'Unknown') as label, count(distinct visitor_id) as visitors
            from cur where name = 'pageview' group by 1 order by 2 desc, 1 limit 10) x),

        'cities', (select coalesce(jsonb_agg(x order by x.visitors desc, x.label), '[]'::jsonb) from (
            select city || coalesce(', ' || country, '') as label, count(distinct visitor_id) as visitors
            from cur where name = 'pageview' and city is not null group by 1 order by 2 desc, 1 limit 10) x),

        'campaigns', (select coalesce(jsonb_agg(x order by x.visitors desc, x.label), '[]'::jsonb) from (
            select utm_campaign as label, count(distinct visitor_id) as visitors,
                   count(*) filter (where name = 'contact_click') as contact_clicks
            from cur where utm_campaign is not null group by 1 order by 2 desc, 1 limit 10) x),

        'contact_channels', (select coalesce(jsonb_agg(x order by x.clicks desc), '[]'::jsonb) from (
            select props ->> 'channel' as label, count(*) as clicks, count(distinct visitor_id) as visitors
            from cur where name = 'contact_click' group by 1) x),

        'leads_by_source', (select coalesce(jsonb_agg(x order by x.visitors desc, x.label), '[]'::jsonb) from (
            select coalesce(source, 'Direct') as label, count(distinct visitor_id) as visitors, count(*) as clicks
            from cur where name = 'contact_click' group by 1 order by 2 desc, 1 limit 10) x),

        'services', (select coalesce(jsonb_agg(x order by x.visitors desc, x.label), '[]'::jsonb) from (
            select props ->> 'tab' as label, count(distinct visitor_id) as visitors, count(*) as clicks
            from cur where name = 'service_tab' group by 1) x),

        'home_visitors', (select n from home_visitors),

        'sections', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
            select props ->> 'section' as label, count(distinct visitor_id) as visitors
            from cur where name = 'section_view' and path = any (home_paths) group by 1) x),

        'scroll', (select coalesce(jsonb_agg(x order by x.depth), '[]'::jsonb) from (
            select (props ->> 'depth')::int as depth, count(distinct visitor_id) as visitors
            from cur where name = 'scroll_depth' and path = any (home_paths) group by 1) x),

        'engagement', (select jsonb_build_object(
            'video_unmute_visitors',    count(distinct visitor_id) filter (where name = 'video_unmute'),
            'language_switch_visitors', count(distinct visitor_id) filter (where name = 'language_switch'),
            'outbound_clicks',          count(*) filter (where name = 'outbound_click')
        ) from cur)
    )
    into result;

    return result;
end;
$$;

revoke execute on function public.analytics_dashboard(date, date) from public, anon;
grant execute on function public.analytics_dashboard(date, date) to authenticated;
