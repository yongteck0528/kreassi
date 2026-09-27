import { supabase } from './supabase'

// Everything is reported in Pontianak time (WIB), matching the database.
export const TIMEZONE = 'Asia/Pontianak'

export const PRESETS = [
    { key: 'today', label: 'Today', days: 1 },
    { key: '7d', label: '7 days', days: 7 },
    { key: '30d', label: '30 days', days: 30 },
    { key: '90d', label: '90 days', days: 90 },
    { key: '12m', label: '12 months', days: 365 },
]

export const todayInPontianak = () => new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date())

export const shiftDate = (iso, days) => {
    const date = new Date(`${iso}T00:00:00Z`)
    date.setUTCDate(date.getUTCDate() + days)
    return date.toISOString().slice(0, 10)
}

export const rangeFor = (preset) => {
    const to = todayInPontianak()
    return { from: shiftDate(to, -(preset.days - 1)), to }
}

export async function fetchDashboard({ from, to }) {
    const { data, error } = await supabase.rpc('analytics_dashboard', { p_from: from, p_to: to })
    if (error) throw error
    return data
}

export const dashboardErrorMessage = (error) => {
    if (error?.code === 'PGRST202') return 'Analytics isn’t set up in the database yet. Run supabase/migrations/0002_analytics.sql in the Supabase SQL Editor.'
    if (error?.code === '42501') return 'Only admins can view analytics.'
    if (/fetch|network/i.test(error?.message ?? '')) return 'Could not reach the server. Check your connection and try again.'
    return 'Could not load analytics. Please try again.'
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------
const plain = new Intl.NumberFormat('en')
const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

export const formatNumber = (n) => (Math.abs(n) >= 10000 ? compact.format(n) : plain.format(n))
export const formatPercent = (x) => `${(x * 100).toFixed(x > 0 && x < 0.1 ? 1 : 0)}%`

const dayFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' })
const longDayFormat = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
export const formatDay = (iso) => dayFormat.format(new Date(`${iso}T00:00:00Z`))
export const formatLongDay = (iso) => longDayFormat.format(new Date(`${iso}T00:00:00Z`))

// ---------------------------------------------------------------------------
// Friendly labels for stored keys
// ---------------------------------------------------------------------------
export const CHANNEL_LABELS = { whatsapp: 'WhatsApp', instagram: 'Instagram', email: 'Email', phone: 'Phone' }
export const LANGUAGE_LABELS = { en: 'English  ( / )', id: 'Indonesian  ( /id/ )', unknown: 'Unknown' }
export const PAGE_LABELS = { '/': 'Homepage (English)', '/id/': 'Homepage (Indonesian)', '/blog': 'Blog (all posts)', '/blog/': 'Blog (all posts)' }
export const DEVICE_LABELS = { mobile: 'Mobile', desktop: 'Desktop', tablet: 'Tablet', unknown: 'Unknown' }

// Homepage sections in page order (ids from src/App.vue).
export const SECTIONS = [
    ['home', 'Hero video'],
    ['about', 'About us'],
    ['partners', 'Clients & partners'],
    ['comments', 'Testimonials'],
    ['howitworks', 'How it works'],
    ['collab1', 'Collaboration steps'],
    ['collab2', 'Collaboration details'],
    ['team', 'Our team'],
    ['founder', 'Meet the founder'],
    ['services', 'Services'],
    ['contact', 'Contact (footer)'],
]
