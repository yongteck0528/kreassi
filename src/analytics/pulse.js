/**
 * First-party, cookieless analytics for the public site.
 *
 * Sends small batches to the Netlify function netlify/functions/pulse.mjs.
 * No cookies, no personal data: the server turns each visit into an
 * anonymous, daily-rotating visitor id and never stores the IP address.
 *
 * Everything is observed from the page with delegated listeners, so no
 * component needs tracking code:
 *   pageview · contact_click (WhatsApp / Instagram / email / phone) ·
 *   outbound_click · service_tab · section_view · scroll_depth ·
 *   language_switch · video_unmute
 */
import { messages } from '../i18n/messages'

const ENDPOINT = '/.netlify/functions/pulse'
const PRODUCTION_HOSTS = ['kreassiteam.com', 'www.kreassiteam.com']
const ADMIN_FLAG = 'kreassi-admin' // set by /admin on sign-in: the team's own visits aren't counted
const SOURCE_KEY = 'kreassi-source' // landing source, kept for this browser tab only
const MAX_QUEUE = 20
// Service names in English, whichever language the page is showing.
const SERVICE_TABS = messages.en.services.tabs.map((tab) => tab.title)

const read = (store, key) => { try { return store.getItem(key) } catch { return null } }
const write = (store, key, value) => { try { store.setItem(key, value) } catch { /* private mode etc. */ } }

// Where did this visit come from? Captured once per tab so later pages keep it.
const landingSource = () => {
    try {
        const saved = JSON.parse(read(sessionStorage, SOURCE_KEY) || 'null')
        if (saved) return saved
    } catch { /* fall through */ }
    let ref = null
    try {
        const host = new URL(document.referrer).hostname
        if (!PRODUCTION_HOSTS.includes(host)) ref = host
    } catch { /* no referrer */ }
    const params = new URLSearchParams(location.search)
    const source = { ref, us: params.get('utm_source'), um: params.get('utm_medium'), uc: params.get('utm_campaign') }
    write(sessionStorage, SOURCE_KEY, JSON.stringify(source))
    return source
}

export function initAnalytics() {
    if (!PRODUCTION_HOSTS.includes(location.hostname)) return // local dev, previews, prerender
    if (navigator.webdriver) return // automated browsers
    if (read(localStorage, ADMIN_FLAG) === '1') return

    const source = landingSource()
    const queue = []

    const send = () => {
        if (!queue.length) return
        const payload = JSON.stringify({
            p: location.pathname,
            l: document.documentElement.lang,
            s: source,
            w: window.innerWidth,
            t: navigator.maxTouchPoints > 0 ? 1 : 0,
            e: queue.splice(0),
        })
        const blob = new Blob([payload], { type: 'text/plain;charset=UTF-8' })
        if (!navigator.sendBeacon?.(ENDPOINT, blob)) {
            fetch(ENDPOINT, { method: 'POST', body: payload, keepalive: true }).catch(() => {})
        }
    }
    const track = (name, data, flushNow = false) => {
        queue.push(data ? { n: name, d: data } : { n: name })
        if (flushNow || queue.length >= MAX_QUEUE) send()
    }

    // 1. The page view itself, sent right away.
    track('pageview', null, true)

    // 2. Clicks — contact links, other external links, service tabs. Capture
    //    phase, so it still counts if a component stops the click.
    document.addEventListener('click', (event) => {
        const el = event.target instanceof Element ? event.target : null
        if (!el) return

        const tab = el.closest('#services [role="tab"][data-index]')
        if (tab) {
            const name = SERVICE_TABS[Number(tab.dataset.index)]
            if (name && tab.getAttribute('aria-selected') !== 'true') track('service_tab', { tab: name })
            return
        }

        const link = el.closest('a[href]')
        if (!link) return
        const href = link.getAttribute('href') || ''
        let channel = null
        if (href.startsWith('mailto:')) channel = 'email'
        else if (href.startsWith('tel:')) channel = 'phone'
        else {
            let url
            try { url = new URL(link.href) } catch { return }
            if (url.origin === location.origin) return // in-page anchors, own pages
            if (/(^|\.)wa\.me$|(^|\.)whatsapp\.com$/.test(url.hostname)) channel = 'whatsapp'
            else if (/(^|\.)instagram\.com$/.test(url.hostname)) channel = 'instagram'
            else return track('outbound_click', { host: url.hostname })
        }
        track('contact_click', { channel }, true) // leads matter most: send immediately
    }, true)

    // 3. Hero video unmuted. Media events don't bubble, but capture sees them.
    let unmuted = false
    document.addEventListener('volumechange', (event) => {
        const video = event.target
        if (!unmuted && video instanceof HTMLVideoElement && !video.muted && video.closest('#home')) {
            unmuted = true
            track('video_unmute')
        }
    }, true)

    // 4. Language switch (the i18n layer keeps <html lang> in sync).
    let lang = document.documentElement.lang
    new MutationObserver(() => {
        const next = document.documentElement.lang
        if (next !== lang) { lang = next; track('language_switch', { to: next }) }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })

    // 5. Homepage sections reached — counted once at least half the screen
    //    (or half of a short section) is showing it.
    const seen = new Set()
    const sectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            const id = entry.target.id
            if (!entry.isIntersecting || seen.has(id)) continue
            if (entry.intersectionRect.height >= Math.min(window.innerHeight, entry.boundingClientRect.height) * 0.5) {
                seen.add(id)
                sectionObserver.unobserve(entry.target)
                track('section_view', { section: id })
            }
        }
    }, { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] })
    document.querySelectorAll('main > section[id]').forEach((section) => sectionObserver.observe(section))

    // 6. Scroll depth milestones.
    const depths = [25, 50, 75, 100]
    let depthIndex = 0
    let ticking = false
    const checkDepth = () => {
        ticking = false
        const scrollable = document.documentElement.scrollHeight - window.innerHeight
        const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 100
        while (depthIndex < depths.length && percent >= depths[depthIndex] - 1) track('scroll_depth', { depth: depths[depthIndex++] })
        if (depthIndex >= depths.length) window.removeEventListener('scroll', onScroll)
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(checkDepth) } }
    window.addEventListener('scroll', onScroll, { passive: true })

    // 7. Send whatever is queued when the visitor leaves or switches tabs.
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') send() })
    window.addEventListener('pagehide', send)
}
