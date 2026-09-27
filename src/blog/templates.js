/**
 * Public blog pages as plain HTML — built once per deploy by
 * scripts/build-blog.mjs, so readers and search engines get finished pages
 * with no framework to download. The admin preview renders articleHtml()
 * too, so a preview always matches the live page.
 *
 * Header and footer mirror the homepage (src/components/Header.vue, Footer.vue).
 * Plain JS with explicit .js imports: the build script imports it directly.
 */
import { CONTACT, SITE_URL } from '../config/site.js'
import { SUPABASE_URL } from '../config/supabase.js'
import { messages } from '../i18n/messages.js'
import { countWords, docText, escapeHtml as esc, readingMinutes, renderDoc } from './content.js'

export const BLOG_PATH = '/blog/'
export const postPath = (slug) => `${BLOG_PATH}${slug}/`
export const coverUrl = (path) => (path ? `${SUPABASE_URL}/storage/v1/object/public/blog-images/${path}` : '')
const WHATSAPP_NUMBER = CONTACT.inquiries[0].number.replace(/\D/g, '')

const COPY = {
    id: {
        htmlLang: 'id',
        ogLocale: 'id_ID',
        schemaLang: 'id-ID',
        dateLocale: 'id-ID',
        home: 'Beranda',
        homePath: '/id/',
        services: 'Layanan',
        contact: 'Kontak',
        skip: 'Langsung ke konten',
        blogTitle: 'Tips Media Sosial, Konten & Branding untuk Bisnis',
        blogIntro: 'Ide konten, strategi media sosial, dan branding untuk cafe, F&B, dan UMKM di Pontianak — dari tim Kreassi.',
        docTitle: 'Blog: Tips Media Sosial, Konten & Branding | Kreassi Team',
        docDescription: 'Tips media sosial, ide konten, dan strategi branding untuk cafe, F&B, dan UMKM di Pontianak dari Kreassi Team.',
        latest: 'Artikel terbaru',
        more: 'Artikel lainnya',
        minRead: (n) => `${n} menit baca`,
        updated: 'Diperbarui',
        share: 'Bagikan',
        copyLink: 'Salin tautan',
        copied: 'Tautan disalin',
        related: 'Baca juga',
        allPosts: 'Semua artikel',
        emptyTitle: 'Artikel pertama segera hadir',
        emptyText: 'Kami sedang menyiapkan tips dan cerita seputar media sosial, konten, dan branding. Sementara itu, ngobrol langsung dengan kami yuk.',
        ctaTitle: 'Butuh bantuan konten untuk bisnis Anda?',
        ctaText: 'Kreassi Team membantu cafe, F&B, dan UMKM di Pontianak tumbuh lewat media sosial, konten, dan branding.',
        ctaButton: 'Konsultasi gratis via WhatsApp',
        ctaMessage: (title) => (title ? `Halo Kreassi, saya baru baca artikel "${title}" dan ingin konsultasi.` : 'Halo Kreassi, saya ingin konsultasi.'),
        notFoundTitle: 'Artikel tidak ditemukan',
        notFoundText: 'Artikel ini mungkin sudah dipindahkan atau dihapus. Coba lihat artikel lain di bawah ini.',
        breadcrumb: 'Navigasi',
    },
    en: {
        htmlLang: 'en',
        ogLocale: 'en_US',
        schemaLang: 'en',
        dateLocale: 'en-GB',
        home: 'Home',
        homePath: '/',
        services: 'Services',
        contact: 'Contact',
        skip: 'Skip to content',
        minRead: (n) => `${n} min read`,
        updated: 'Updated',
        share: 'Share',
        copyLink: 'Copy link',
        copied: 'Link copied',
        related: 'Read next',
        allPosts: 'All articles',
        ctaTitle: 'Need help with content for your business?',
        ctaText: 'Kreassi Team helps cafes, F&B and small businesses in Pontianak grow through social media, content and branding.',
        ctaButton: 'Free consultation on WhatsApp',
        ctaMessage: (title) => (title ? `Hi Kreassi, I just read "${title}" and would like a consultation.` : 'Hi Kreassi, I would like a consultation.'),
        breadcrumb: 'Breadcrumb',
    },
}
const copyFor = (lang) => COPY[lang] ?? COPY.id

// Icons (Material Design Icons / Heroicons), inlined — no icon runtime on static pages.
const ICONS = {
    whatsapp: '<path fill="currentColor" d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23c-1.48 0-2.93-.39-4.19-1.15l-.3-.17l-3.12.82l.83-3.04l-.2-.32a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31c-.22.25-.87.86-.87 2.07c0 1.22.89 2.39 1 2.56c.14.17 1.76 2.67 4.25 3.73c.59.27 1.05.42 1.41.53c.59.19 1.13.16 1.56.1c.48-.07 1.46-.6 1.67-1.18s.21-1.07.15-1.18c-.07-.1-.23-.16-.48-.27c-.25-.14-1.47-.74-1.69-.82c-.23-.08-.37-.12-.56.12c-.16.25-.64.81-.78.97c-.15.17-.29.19-.53.07c-.26-.13-1.06-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.12-.24-.01-.39.11-.5c.11-.11.27-.29.37-.44c.13-.14.17-.25.25-.41c.08-.17.04-.31-.02-.43c-.06-.11-.56-1.35-.77-1.84c-.2-.48-.4-.42-.56-.43c-.14 0-.3-.01-.47-.01"/>',
    instagram: '<path fill="currentColor" d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3"/>',
    envelope: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"/>',
    facebook: '<path fill="currentColor" d="M12 2.04c-5.5 0-10 4.49-10 10.02c0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89c1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02"/>',
    link: '<path fill="currentColor" d="M10.59 13.41c.41.39.41 1.03 0 1.42c-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0a5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.98 2.98 0 0 0 0-4.24a2.98 2.98 0 0 0-4.24 0l-3.53 3.53a2.98 2.98 0 0 0 0 4.24m2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0a5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.98 2.98 0 0 0 0 4.24a2.98 2.98 0 0 0 4.24 0l3.53-3.53a2.98 2.98 0 0 0 0-4.24a.973.973 0 0 1 0-1.42"/>',
    arrowLeft: '<path fill="currentColor" d="M20 11v2H8l5.5 5.5l-1.42 1.42L4.16 12l7.92-7.92L13.5 5.5L8 11z"/>',
}
const icon = (name, cls) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`

const formatDate = (iso, lang) => new Intl.DateTimeFormat(copyFor(lang).dateLocale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Pontianak' }).format(new Date(iso))
const isoDate = (iso) => new Date(iso).toISOString()
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`
const whatsappLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`

/** Google description: the excerpt, or the opening of the post cut at a word. */
const describe = (post) => {
    if (post.excerpt?.trim()) return post.excerpt.trim()
    const text = docText(post.content).replace(/\s+/g, ' ').trim()
    return text.length <= 155 ? text : `${text.slice(0, 155).replace(/\s+\S*$/, '')}…`
}

/** Everything a template needs about a post, worked out once. */
export function postView(post, categories = new Map()) {
    const lang = post.lang === 'en' ? 'en' : 'id'
    const words = countWords(post.content)
    const published = post.published_at || post.updated_at || new Date().toISOString()
    const modified = post.updated_at || published
    return {
        ...post,
        lang,
        path: postPath(post.slug),
        url: SITE_URL + postPath(post.slug),
        description: describe(post),
        words,
        minutes: readingMinutes(words),
        cover: coverUrl(post.cover_path),
        category: categories.get(post.category_id)?.name ?? '',
        published,
        modified,
        // Show "Updated …" only for real revisions, not same-day fixes.
        showUpdated: Date.parse(modified) - Date.parse(published) > 2 * 86400000,
    }
}

// ---------------------------------------------------------------------------
// Shared pieces
// ---------------------------------------------------------------------------
function header(lang, logo) {
    const c = copyFor(lang)
    const link = 'flex h-16 items-center px-2 text-sm text-darkPurple transition-colors duration-100 nav-hover sm:px-3 lg:px-4 lg:text-base'
    return `<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-darkPurple focus:shadow">${c.skip}</a>
<header class="sticky top-0 z-50 bg-white text-black">
  <nav class="bg-white shadow-md">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <a href="${c.homePath}" class="flex-shrink-0" aria-label="Kreassi Team — ${c.home}">
          <img src="${logo.src}" width="${logo.width}" height="${logo.height}" alt="Kreassi Team logo" class="h-10 w-auto" />
        </a>
        <div class="ml-auto flex items-center">
          <a href="${c.homePath}" class="${link}">${c.home}</a>
          <a href="${c.homePath}#services" class="${link} hidden md:flex">${c.services}</a>
          <a href="${BLOG_PATH}" class="flex h-16 items-center bg-purple-5 px-3 text-sm font-bold text-white lg:px-4 lg:text-base">Blog</a>
          <a href="${c.homePath}#contact" class="${link} hidden md:flex">${c.contact}</a>
        </div>
      </div>
    </div>
  </nav>
</header>`
}

// Same layout and copy as the homepage footer (src/components/Footer.vue).
function footer(lang, logoWhite) {
    const f = messages[lang]?.footer ?? messages.en.footer
    const socials = [
        ['Instagram', 'https://instagram.com/kreassiteam', 'instagram'],
        ['WhatsApp', `https://wa.me/${WHATSAPP_NUMBER}`, 'whatsapp'],
        ['Email', `mailto:${CONTACT.email}`, 'envelope'],
    ]
    return `<footer class="bg-[#35164F] text-white">
  <div class="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
    <div class="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div class="space-y-6">
        <img src="${logoWhite.src}" width="${logoWhite.width}" height="${logoWhite.height}" alt="${esc(f.logoAlt)}" class="h-10 w-auto" loading="lazy" decoding="async" />
        <div>
          <p class="font-normal tracking-tight text-[clamp(22px,4vw,40px)]">${esc(f.heading)}</p>
          <p class="mt-1 font-thin text-white text-[clamp(14px,2.2vw,18px)]"><span class="font-bold">${esc(f.taglineHighlight)}</span> ${esc(f.taglineRest)}</p>
        </div>
        <nav aria-label="${esc(f.socialAriaLabel)}" class="flex items-center gap-4">
${socials.map(([name, href, ico]) => `          <a href="${esc(href)}" class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#35164F] transition hover:bg-[#35164F] hover:text-white md:h-10 md:w-10" aria-label="${name}" target="_blank" rel="noopener">${icon(ico, 'h-[clamp(18px,2.4vw,24px)] w-[clamp(18px,2.4vw,24px)]')}</a>`).join('\n')}
        </nav>
      </div>
      <div class="grid grid-cols-1 gap-8 md:gap-10 lg:grid-cols-2">
        <div>
          <p class="uppercase tracking-wider text-white/80 text-[clamp(12px,1.6vw,14px)]">${esc(f.inquiriesTitle)}</p>
          <ul class="mt-2 space-y-2">
${CONTACT.inquiries.map((c) => `            <li class="flex items-center gap-2">${icon('whatsapp', 'h-5 w-5 text-white')}<a href="https://wa.me/${c.number.replace(/\D/g, '')}" target="_blank" rel="noopener" class="font-semibold transition hover:text-gray-300 text-[clamp(14px,2vw,18px)] md:text-sm">${esc(c.number)}</a><span class="text-sm text-white/70">(${esc(c.label)})</span></li>`).join('\n')}
          </ul>
        </div>
        <div>
          <p class="uppercase tracking-wider text-white/80 text-[clamp(12px,1.6vw,14px)]">${esc(f.emailTitle)}</p>
          <p class="mt-2"><a href="mailto:${CONTACT.email}" class="font-semibold transition hover:text-gray-300 text-[clamp(14px,2vw,18px)]">${CONTACT.email}</a></p>
        </div>
      </div>
    </div>
    <div class="mt-10 border-t border-white/10 pt-6 text-center text-white/60 text-[clamp(11px,1.8vw,14px)] md:text-left">${esc(f.copyright)}</div>
  </div>
</footer>`
}

function metaLine(view, { withAuthor = true } = {}) {
    const c = copyFor(view.lang)
    const parts = [
        ...(withAuthor ? ['Kreassi Team'] : []),
        `<time datetime="${isoDate(view.published)}">${formatDate(view.published, view.lang)}</time>`,
        c.minRead(view.minutes),
    ]
    return parts.join('<span aria-hidden="true"> · </span>')
}

const categoryChip = (name) => (name
    ? `<span class="inline-block rounded-full bg-purple-5/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-5">${esc(name)}</span>`
    : '')

const coverOrPlaceholder = (view, cls, { eager = false } = {}) => (view.cover
    ? `<img src="${esc(view.cover)}" alt="${esc(view.cover_alt)}" class="${cls} object-cover" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" />`
    : `<div class="${cls} bg-gradient-to-br from-darkPurple to-purple-5" aria-hidden="true"></div>`)

/** A post in a list. The title link covers the whole card. */
function card(view, { headingTag = 'h3', featured = false } = {}) {
    const title = `<a href="${view.path}" class="after:absolute after:inset-0 after:content-[''] focus:outline-none focus-visible:underline">${esc(view.title)}</a>`
    if (featured) {
        return `<article class="group relative grid items-center gap-6 md:grid-cols-2 md:gap-10">
  <div class="overflow-hidden rounded-2xl">${coverOrPlaceholder(view, 'aspect-[1.91/1] w-full transition duration-300 group-hover:scale-[1.03]', { eager: true })}</div>
  <div>
    ${categoryChip(view.category)}
    <${headingTag} class="mt-4 text-2xl font-bold leading-tight text-darkPurple group-hover:text-purple-5 sm:text-3xl">${title}</${headingTag}>
    <p class="mt-3 text-base leading-relaxed text-gray-600">${esc(view.description)}</p>
    <p class="mt-4 text-sm text-gray-500">${metaLine(view, { withAuthor: false })}</p>
  </div>
</article>`
    }
    return `<article class="group relative flex flex-col">
  <div class="overflow-hidden rounded-2xl">${coverOrPlaceholder(view, 'aspect-[1.91/1] w-full transition duration-300 group-hover:scale-[1.03]')}</div>
  <div class="mt-4">${categoryChip(view.category)}</div>
  <${headingTag} class="mt-3 text-lg font-bold leading-snug text-darkPurple group-hover:text-purple-5">${title}</${headingTag}>
  <p class="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">${esc(view.description)}</p>
  <p class="mt-3 text-xs text-gray-500">${metaLine(view, { withAuthor: false })}</p>
</article>`
}

function ctaBox(lang, title) {
    const c = copyFor(lang)
    return `<aside class="rounded-2xl bg-darkPurple p-6 text-white sm:p-8">
  <p class="text-xl font-bold">${esc(c.ctaTitle)}</p>
  <p class="mt-2 text-sm leading-relaxed text-white/80">${esc(c.ctaText)}</p>
  <a href="${esc(whatsappLink(c.ctaMessage(title)))}" target="_blank" rel="noopener" class="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-darkPurple transition hover:bg-gray-100">${icon('whatsapp', 'h-5 w-5')}${esc(c.ctaButton)}</a>
</aside>`
}

function shareRow(view) {
    const c = copyFor(view.lang)
    const btn = 'inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 px-4 text-sm font-medium text-gray-700 transition hover:border-purple-5 hover:text-purple-5'
    return `<div class="mt-12 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-6" data-share>
  <p class="mr-1 text-sm font-semibold text-gray-700">${c.share}</p>
  <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(`${view.title} ${view.url}`)}" target="_blank" rel="noopener" class="${btn}">${icon('whatsapp', 'h-5 w-5')}WhatsApp</a>
  <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(view.url)}" target="_blank" rel="noopener" class="${btn}">${icon('facebook', 'h-5 w-5')}Facebook</a>
  <button type="button" class="${btn}" data-copy-link="${esc(view.url)}" data-copied-label="${c.copied}">${icon('link', 'h-5 w-5')}<span>${c.copyLink}</span></button>
</div>`
}

/** The article itself — shared by the live page and the admin preview. */
export function articleHtml(view) {
    const c = copyFor(view.lang)
    const crumbs = `<nav aria-label="${c.breadcrumb}" class="text-sm text-gray-500">
    <ol class="flex flex-wrap items-center gap-1.5">
      <li><a href="${BLOG_PATH}" class="font-medium text-purple-5 hover:underline">Blog</a></li>
      ${view.category ? `<li aria-hidden="true">›</li><li>${esc(view.category)}</li>` : ''}
    </ol>
  </nav>`
    const updated = view.showUpdated
        ? `<span aria-hidden="true"> · </span>${c.updated} <time datetime="${isoDate(view.modified)}">${formatDate(view.modified, view.lang)}</time>`
        : ''
    return `<article lang="${view.lang}" class="mx-auto max-w-3xl px-5 pb-16 pt-8 sm:pt-12">
  ${crumbs}
  <h1 class="mt-4 text-3xl font-bold leading-tight text-darkPurple sm:text-[2.6rem] sm:leading-[1.15]">${esc(view.title)}</h1>
  <p class="mt-4 text-sm text-gray-500">${metaLine(view)}${updated}</p>
  ${view.cover ? `<img src="${esc(view.cover)}" alt="${esc(view.cover_alt)}" class="mt-8 aspect-[1.91/1] w-full rounded-2xl object-cover" fetchpriority="high" decoding="async" />` : ''}
  <div class="kb-prose mt-10">${renderDoc(view.content, { lang: view.lang })}</div>
  ${shareRow(view)}
  <div class="mt-10">${ctaBox(view.lang, view.title)}</div>
</article>`
}

function headTags({ title, description, url, image, imageAlt, type = 'website', lang, robots = 'index, follow, max-image-preview:large', extra = [], data }) {
    const c = copyFor(lang)
    const img = image || `${SITE_URL}/og-image.png`
    return [
        `<title>${esc(title)}</title>`,
        `<meta name="description" content="${esc(description)}" />`,
        `<meta name="robots" content="${robots}" />`,
        url && `<link rel="canonical" href="${esc(url)}" />`,
        `<meta property="og:type" content="${type}" />`,
        '<meta property="og:site_name" content="Kreassi Team" />',
        `<meta property="og:locale" content="${c.ogLocale}" />`,
        `<meta property="og:title" content="${esc(title)}" />`,
        `<meta property="og:description" content="${esc(description)}" />`,
        url && `<meta property="og:url" content="${esc(url)}" />`,
        `<meta property="og:image" content="${esc(img)}" />`,
        ...(image ? [] : ['<meta property="og:image:width" content="1200" />', '<meta property="og:image:height" content="630" />']),
        `<meta property="og:image:alt" content="${esc(imageAlt || 'Kreassi Team')}" />`,
        ...extra,
        '<meta name="twitter:card" content="summary_large_image" />',
        `<meta name="twitter:title" content="${esc(title)}" />`,
        `<meta name="twitter:description" content="${esc(description)}" />`,
        `<meta name="twitter:image" content="${esc(img)}" />`,
        `<link rel="preconnect" href="${SUPABASE_URL}" />`,
        data && jsonLd(data),
    ].filter(Boolean).join('\n    ')
}

const publisher = { '@type': 'Organization', '@id': `${SITE_URL}/#business`, name: 'Kreassi Team', url: `${SITE_URL}/`, logo: { '@type': 'ImageObject', url: `${SITE_URL}/Kreassi-logo.png` } }
const crumbList = (items) => ({
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
})

const layout = ({ lang, head, main, assets }) => ({
    lang: copyFor(lang).htmlLang,
    head,
    body: `${header(lang, assets.logo)}
<main id="main">
${main}
</main>
${footer(lang, assets.logoWhite)}`,
})

// ---------------------------------------------------------------------------
// Pages
// ---------------------------------------------------------------------------
/** /blog/<slug>/ */
export function postPage(view, { related = [], assets }) {
    const c = copyFor(view.lang)
    const relatedHtml = related.length
        ? `<section class="border-t border-gray-100 bg-gray-50" aria-labelledby="related-heading">
  <div class="mx-auto max-w-6xl px-5 py-12 sm:py-16">
    <div class="flex items-end justify-between gap-4">
      <h2 id="related-heading" class="text-2xl font-bold text-darkPurple">${c.related}</h2>
      <a href="${BLOG_PATH}" class="text-sm font-semibold text-purple-5 hover:underline">${c.allPosts} →</a>
    </div>
    <div class="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
${related.map((r) => card(r)).join('\n')}
    </div>
  </div>
</section>`
        : ''
    const head = headTags({
        title: `${view.title} | Kreassi Team`,
        description: view.description,
        url: view.url,
        image: view.cover,
        imageAlt: view.cover_alt,
        type: 'article',
        lang: view.lang,
        extra: [
            `<meta property="article:published_time" content="${isoDate(view.published)}" />`,
            `<meta property="article:modified_time" content="${isoDate(view.modified)}" />`,
            view.category && `<meta property="article:section" content="${esc(view.category)}" />`,
        ].filter(Boolean),
        data: {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'BlogPosting',
                    '@id': `${view.url}#article`,
                    headline: view.title.slice(0, 110),
                    description: view.description,
                    ...(view.cover ? { image: [view.cover] } : {}),
                    datePublished: isoDate(view.published),
                    dateModified: isoDate(view.modified),
                    inLanguage: c.schemaLang,
                    ...(view.category ? { articleSection: view.category } : {}),
                    wordCount: view.words,
                    author: { '@type': 'Organization', name: 'Kreassi Team', url: `${SITE_URL}/` },
                    publisher,
                    mainEntityOfPage: view.url,
                    isPartOf: { '@id': `${SITE_URL}${BLOG_PATH}#blog` },
                },
                crumbList([['Kreassi Team', `${SITE_URL}/`], ['Blog', SITE_URL + BLOG_PATH], [view.title, view.url]]),
            ],
        },
    })
    return layout({ lang: view.lang, head, assets, main: `${articleHtml(view)}\n${relatedHtml}` })
}

/** /blog/ — newest first. Indonesian, like most of the audience. */
export function indexPage(views, { assets }) {
    const c = copyFor('id')
    const [first, ...rest] = views
    const hero = `<section class="bg-darkPurple text-white">
  <div class="mx-auto max-w-6xl px-5 py-14 sm:py-20">
    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Blog Kreassi</p>
    <h1 class="mt-3 max-w-3xl text-3xl font-bold leading-tight sm:text-5xl sm:leading-[1.1]">${esc(c.blogTitle)}</h1>
    <p class="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">${esc(c.blogIntro)}</p>
  </div>
</section>`
    const list = first
        ? `<section class="mx-auto max-w-6xl px-5 py-12 sm:py-16" aria-labelledby="latest-heading">
  <h2 id="latest-heading" class="sr-only">${c.latest}</h2>
${card(first, { headingTag: 'h3', featured: true })}
${rest.length ? `  <div class="mt-14 border-t border-gray-100 pt-12">
    <p class="text-sm font-semibold uppercase tracking-wider text-gray-500">${c.more}</p>
    <div class="mt-8 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
${rest.map((v) => card(v)).join('\n')}
    </div>
  </div>` : ''}
</section>`
        : `<section class="mx-auto max-w-2xl px-5 py-20 text-center">
  <h2 class="text-2xl font-bold text-darkPurple">${esc(c.emptyTitle)}</h2>
  <p class="mt-3 text-gray-600">${esc(c.emptyText)}</p>
</section>`
    const cta = `<section class="mx-auto max-w-6xl px-5 pb-16">${ctaBox('id')}</section>`
    const url = SITE_URL + BLOG_PATH
    const head = headTags({
        title: c.docTitle,
        description: c.docDescription,
        url,
        lang: 'id',
        // Nothing to index until there's something to read.
        robots: views.length ? 'index, follow, max-image-preview:large' : 'noindex, follow',
        data: {
            '@context': 'https://schema.org',
            '@graph': [
                {
                    '@type': 'Blog',
                    '@id': `${url}#blog`,
                    name: 'Blog Kreassi',
                    description: c.docDescription,
                    url,
                    inLanguage: c.schemaLang,
                    publisher,
                    blogPost: views.map((v) => ({
                        '@type': 'BlogPosting',
                        headline: v.title.slice(0, 110),
                        url: v.url,
                        datePublished: isoDate(v.published),
                        ...(v.cover ? { image: v.cover } : {}),
                    })),
                },
                crumbList([['Kreassi Team', `${SITE_URL}/`], ['Blog', url]]),
            ],
        },
    })
    return layout({ lang: 'id', head, assets, main: `${hero}\n${list}\n${cta}` })
}

/** Served (with a 404 status) for any /blog/… address that doesn't exist. */
export function notFoundPage(views, { assets }) {
    const c = copyFor('id')
    const main = `<section class="mx-auto max-w-6xl px-5 py-16 sm:py-20">
  <div class="mx-auto max-w-2xl text-center">
    <p class="text-sm font-semibold uppercase tracking-[0.2em] text-purple-5">404</p>
    <h1 class="mt-3 text-3xl font-bold text-darkPurple sm:text-4xl">${esc(c.notFoundTitle)}</h1>
    <p class="mt-4 text-gray-600">${esc(c.notFoundText)}</p>
    <a href="${BLOG_PATH}" class="mt-6 inline-flex items-center gap-2 rounded-lg bg-darkPurple px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-5">${icon('arrowLeft', 'h-4 w-4')}${c.allPosts}</a>
  </div>
${views.length ? `  <div class="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
${views.slice(0, 3).map((v) => card(v, { headingTag: 'h2' })).join('\n')}
  </div>` : ''}
</section>`
    const head = headTags({ title: `${c.notFoundTitle} | Kreassi Team`, description: c.docDescription, lang: 'id', robots: 'noindex, follow' })
    return layout({ lang: 'id', head, assets, main })
}

/** Up to three other posts: same category first, then the newest. */
export function relatedFor(view, views, count = 3) {
    const others = views.filter((v) => v.id !== view.id)
    const same = others.filter((v) => view.category_id && v.category_id === view.category_id)
    return [...same, ...others.filter((v) => !same.includes(v))].slice(0, count)
}
