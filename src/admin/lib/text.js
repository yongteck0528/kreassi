export { slugify, SLUG_RE } from '../../utils/slug.js'

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
