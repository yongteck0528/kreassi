/**
 * Per-language <head> metadata for the homepage.
 *
 * Each language has its own URL (en → "/", id → "/id/") so search engines can
 * index both. src/i18n/index.js applies these values whenever the locale
 * changes; the prerender step captures them into the static HTML.
 *
 * The `en` values mirror the static tags in index.html — keep them in sync.
 */
export const SEO = {
    en: {
        path: '/',
        title: 'Social Media & Content Agency in Pontianak | Kreassi Team',
        description: 'Pontianak-based social media & content agency. We help cafes, F&B and small businesses grow online with content creation, branding, photo, video & web design.',
        ogDescription: 'We help cafes, F&B and small businesses in Pontianak grow online — social media management, content creation, branding, photography, videography & website design.',
        twitterDescription: 'We help cafes, F&B and small businesses in Pontianak grow online — social media, content, branding & design.',
        ogLocale: 'en_US',
        ogLocaleAlternate: 'id_ID',
    },
    id: {
        path: '/id/',
        title: 'Jasa Social Media & Konten di Pontianak | Kreassi Team',
        description: 'Agensi social media & konten di Pontianak. Kami bantu cafe, F&B, dan UMKM berkembang online lewat pembuatan konten, branding, foto, video & desain website.',
        ogDescription: 'Kami bantu cafe, F&B, dan UMKM di Pontianak berkembang online — kelola media sosial, pembuatan konten, branding, fotografi, videografi & desain website.',
        twitterDescription: 'Kami bantu cafe, F&B, dan UMKM di Pontianak berkembang online — social media, konten, branding & desain.',
        ogLocale: 'id_ID',
        ogLocaleAlternate: 'en_US',
    },
}

/** Homepage paths the language URLs apply to (the blog has its own page). */
const HOME_PATHS = ['/', '/index.html', '/id', '/id/', '/id/index.html']
export const isHomePath = (pathname) => HOME_PATHS.includes(pathname)
