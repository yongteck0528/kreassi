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

export { STORAGE_KEY }
