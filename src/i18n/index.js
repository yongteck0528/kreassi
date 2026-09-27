import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import { messages } from './messages'
import { SITE_URL } from '../config/site'
import { SEO, isHomePath } from '../config/seo'

const STORAGE_KEY = 'kreassi-locale'
const SUPPORTED_LOCALES = ['en', 'id']
const DEFAULT_LOCALE = 'en'

// A language prefix in the URL (e.g. /id/) always wins, so every language URL
// serves one consistent language to visitors and search engines.
const getLocaleFromPath = () => {
    const segment = window.location.pathname.split('/')[1]?.toLowerCase()
    return segment && segment !== DEFAULT_LOCALE && SUPPORTED_LOCALES.includes(segment) ? segment : null
}

const getStartingLocale = () => {
    const fromPath = getLocaleFromPath()
    if (fromPath) return fromPath

    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && SUPPORTED_LOCALES.includes(saved)) {
        return saved
    }

    const browserLocale = navigator.language?.toLowerCase().split('-')[0]
    if (browserLocale && SUPPORTED_LOCALES.includes(browserLocale)) {
        return browserLocale
    }

    return DEFAULT_LOCALE
}

export const i18n = createI18n({
    legacy: false,
    locale: getStartingLocale(),
    fallbackLocale: DEFAULT_LOCALE,
    messages,
})

const setAttr = (selector, attr, value) => {
    const el = document.head.querySelector(selector)
    if (el) el.setAttribute(attr, value)
}

// Point the homepage URL and <head> metadata at the active language.
const applyHomepageLocale = (locale) => {
    const seo = SEO[locale]
    if (!seo) return

    if (window.location.pathname !== seo.path) {
        const { search, hash } = window.location
        history.replaceState(history.state, '', seo.path + search + hash)
    }

    const url = SITE_URL + seo.path
    document.title = seo.title
    setAttr('meta[name="description"]', 'content', seo.description)
    setAttr('link[rel="canonical"]', 'href', url)
    setAttr('meta[property="og:url"]', 'content', url)
    setAttr('meta[property="og:title"]', 'content', seo.title)
    setAttr('meta[property="og:description"]', 'content', seo.ogDescription)
    setAttr('meta[property="og:locale"]', 'content', seo.ogLocale)
    setAttr('meta[property="og:locale:alternate"]', 'content', seo.ogLocaleAlternate)
    setAttr('meta[name="twitter:title"]', 'content', seo.title)
    setAttr('meta[name="twitter:description"]', 'content', seo.twitterDescription)
}

// Persist the locale and keep <html lang> in sync (SEO/accessibility)
// whenever it changes, no matter which component changed it. On the homepage
// also keep the URL (/ or /id/) and <head> metadata matched to the language.
watch(
    i18n.global.locale,
    (locale) => {
        localStorage.setItem(STORAGE_KEY, locale)
        document.documentElement.lang = locale
        if (isHomePath(window.location.pathname)) applyHomepageLocale(locale)
    },
    { immediate: true },
)

export { STORAGE_KEY, SUPPORTED_LOCALES, DEFAULT_LOCALE }
