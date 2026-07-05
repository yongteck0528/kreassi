import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import { messages } from './messages'

const STORAGE_KEY = 'kreassi-locale'
const SUPPORTED_LOCALES = ['en', 'id']
const DEFAULT_LOCALE = 'en'

const getStartingLocale = () => {
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

// Persist the locale and keep <html lang> in sync (SEO/accessibility)
// whenever it changes, no matter which component changed it.
watch(
    i18n.global.locale,
    (locale) => {
        localStorage.setItem(STORAGE_KEY, locale)
        document.documentElement.lang = locale
    },
    { immediate: true },
)

export { STORAGE_KEY, SUPPORTED_LOCALES, DEFAULT_LOCALE }
