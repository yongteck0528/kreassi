/** "Ide Konten Café & F&B!" → "ide-konten-cafe-f-b" (URL-safe, max 80 chars). */
export const slugify = (text) => String(text || '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const UNITS = [['minute', 60], ['hour', 3600], ['day', 86400], ['week', 604800], ['month', 2592000], ['year', 31536000]]

/** "just now", "5 minutes ago", "yesterday", "3 weeks ago" … */
export const timeAgo = (iso) => {
    if (!iso) return ''
    const seconds = (Date.parse(iso) - Date.now()) / 1000
    const abs = Math.abs(seconds)
    if (abs < 45) return 'just now'
    let unit = UNITS[0]
    for (const u of UNITS) if (abs >= u[1]) unit = u
    return relative.format(Math.round(seconds / unit[1]), unit[0])
}

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Pontianak' })
export const formatDate = (iso) => (iso ? dateFormat.format(new Date(iso)) : '')
