/**
 * Analytics ingest — first-party and cookieless.
 *
 * Receives batched events from src/analytics/pulse.js (navigator.sendBeacon)
 * and stores them in Supabase `public.events` (see supabase/migrations/0002).
 *
 * Privacy: the visitor's IP is used only to build `visitor_id`, a one-way hash
 * of (secret salt + Pontianak date + IP + user agent). The hash changes every
 * day and the IP itself is never stored. Location is Netlify's coarse geo.
 *
 * Needs the SUPABASE_SERVICE_ROLE_KEY environment variable (Functions scope).
 * Optional ANALYTICS_SALT; defaults to the service key, which is secret anyway.
 */
import { createHash } from 'node:crypto'
import { SUPABASE_URL } from '../../src/config/supabase.js'

const ALLOWED_ORIGINS = new Set(['https://kreassiteam.com', 'https://www.kreassiteam.com'])
const MAX_BODY = 16 * 1024
const MAX_EVENTS = 30

const BOT_RE = /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom|uptime|facebookexternalhit|embedly|whatsapp\/|telegram|discord|skype|curl|wget|python|axios|node-fetch|undici|go-http|java\/|okhttp|scrapy|phantom|selenium|puppeteer|playwright/i

const text = (value, max = 100) => (typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : null)
const HOST_RE = /^[a-z0-9.-]{1,100}$/i

// Allowed events and the only props each may carry.
const EVENT_PROPS = {
    pageview: () => ({}),
    video_unmute: () => ({}),
    contact_click: (d) => (['whatsapp', 'email', 'phone', 'instagram'].includes(d?.channel) ? { channel: d.channel } : null),
    outbound_click: (d) => (HOST_RE.test(d?.host ?? '') ? { host: d.host.toLowerCase() } : null),
    service_tab: (d) => (text(d?.tab, 60) ? { tab: text(d.tab, 60) } : null),
    section_view: (d) => (/^[a-z0-9-]{1,40}$/.test(d?.section ?? '') ? { section: d.section } : null),
    scroll_depth: (d) => ([25, 50, 75, 100].includes(d?.depth) ? { depth: d.depth } : null),
    language_switch: (d) => (['en', 'id'].includes(d?.to) ? { to: d.to } : null),
}

// Referrer host → friendly source name. Order matters (Gemini before Google).
const REFERRER_SOURCES = [
    [/(^|\.)gemini\.google\.com$/, 'Gemini'],
    [/(^|\.)google\.[a-z.]+$/, 'Google'],
    [/(^|\.)bing\.com$/, 'Bing'],
    [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo'],
    [/(^|\.)yahoo\.[a-z.]+$/, 'Yahoo'],
    [/(^|\.)instagram\.com$/, 'Instagram'],
    [/(^|\.)facebook\.com$|(^|\.)fb\.me$/, 'Facebook'],
    [/(^|\.)wa\.me$|(^|\.)whatsapp\.com$/, 'WhatsApp'],
    [/(^|\.)tiktok\.com$/, 'TikTok'],
    [/(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/, 'LinkedIn'],
    [/(^|\.)t\.co$|(^|\.)twitter\.com$|(^|\.)x\.com$/, 'X'],
    [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'YouTube'],
    [/(^|\.)chatgpt\.com$|(^|\.)openai\.com$/, 'ChatGPT'],
    [/(^|\.)perplexity\.ai$/, 'Perplexity'],
    [/(^|\.)claude\.ai$/, 'Claude'],
]
// In-app browsers often send no referrer, but say who they are in the UA.
const IN_APP_SOURCES = [[/Instagram/, 'Instagram'], [/FBAN|FBAV|FB_IAB/, 'Facebook'], [/musical_ly|BytedanceWebview/i, 'TikTok'], [/LinkedInApp/, 'LinkedIn']]
const UTM_SOURCES = { ig: 'Instagram', instagram: 'Instagram', fb: 'Facebook', facebook: 'Facebook', wa: 'WhatsApp', whatsapp: 'WhatsApp', google: 'Google', tiktok: 'TikTok', linkedin: 'LinkedIn', youtube: 'YouTube' }

export const sourceFor = ({ ref, utmSource }, ua) => {
    if (utmSource) return UTM_SOURCES[utmSource.toLowerCase()] ?? utmSource
    if (ref) return REFERRER_SOURCES.find(([re]) => re.test(ref))?.[1] ?? ref
    return IN_APP_SOURCES.find(([re]) => re.test(ua))?.[1] ?? null // null = Direct
}

export const deviceFor = (ua, touch, width) => {
    if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(ua)) return 'tablet'
    if (/Mobi|iPhone|iPod|Android|Opera Mini|IEMobile/i.test(ua)) return 'mobile'
    if (touch && width > 0 && width <= 1366 && /Macintosh/.test(ua)) return 'tablet' // iPadOS reports as a Mac
    return 'desktop'
}

const pontianakDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Pontianak' }).format(new Date())

const noContent = () => new Response(null, { status: 204 })

export default async (req, context) => {
    if (req.method !== 'POST') return new Response(null, { status: 405 })

    // Only accept beacons sent by the site itself.
    const origin = req.headers.get('origin')
    const fetchSite = req.headers.get('sec-fetch-site')
    if ((origin && !ALLOWED_ORIGINS.has(origin)) || (fetchSite && !['same-origin', 'same-site'].includes(fetchSite))) {
        return new Response(null, { status: 403 })
    }

    const ua = req.headers.get('user-agent') || ''
    if (!ua || BOT_RE.test(ua)) return noContent()

    let body
    try {
        const raw = await req.text()
        if (raw.length > MAX_BODY) return noContent()
        body = JSON.parse(raw)
    } catch {
        return noContent()
    }

    const path = typeof body?.p === 'string' ? body.p.split(/[?#]/)[0] : ''
    if (!/^\/[\w\-./%]{0,199}$/.test(path)) return noContent()

    const src = body.s ?? {}
    const ref = HOST_RE.test(src.ref ?? '') ? src.ref.toLowerCase().replace(/^www\./, '') : null
    const selfRef = ref && (ref === 'kreassiteam.com')
    const utmSource = text(src.us)

    const events = (Array.isArray(body.e) ? body.e : []).slice(0, MAX_EVENTS)
        .map((e) => {
            const props = EVENT_PROPS[e?.n]?.(e.d)
            return props ? { name: e.n, props } : null
        })
        .filter(Boolean)
    if (!events.length) return noContent()

    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!key) {
        console.error('[pulse] SUPABASE_SERVICE_ROLE_KEY is not set')
        return noContent()
    }

    const salt = process.env.ANALYTICS_SALT || key
    const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || ''
    const visitorId = createHash('sha256').update(`${salt}|${pontianakDate()}|${ip}|${ua}`).digest('base64url').slice(0, 22)
    const geo = context?.geo ?? {}

    const shared = {
        visitor_id: visitorId,
        path,
        lang: ['en', 'id'].includes(body.l) ? body.l : null,
        source: sourceFor({ ref: selfRef ? null : ref, utmSource }, ua),
        referrer_host: selfRef ? null : ref,
        utm_source: utmSource,
        utm_medium: text(src.um),
        utm_campaign: text(src.uc),
        device: deviceFor(ua, body.t === 1, Number(body.w) || 0),
        country: text(geo.country?.name, 60),
        region: text(geo.subdivision?.name),
        city: text(geo.city),
    }
    const rows = events.map((e) => ({ ...shared, ...e }))

    const headers = { apikey: key, 'content-type': 'application/json', prefer: 'return=minimal' }
    if (!key.startsWith('sb_')) headers.authorization = `Bearer ${key}` // legacy JWT keys
    try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/events`, { method: 'POST', headers, body: JSON.stringify(rows) })
        if (!res.ok) console.error('[pulse] insert failed', res.status, (await res.text()).slice(0, 300))
    } catch (err) {
        console.error('[pulse] insert error', err?.message)
    }
    return noContent()
}
