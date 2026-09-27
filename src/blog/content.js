/**
 * Post content (the editor's JSON) → HTML, without a browser.
 *
 * One renderer for the site build (Node) and the admin preview, so a preview
 * always matches the live page. It writes every tag itself — text and
 * attributes are escaped, links/images only keep safe URLs, unknown node
 * types output nothing of their own — so whatever ends up in the JSON, the
 * result is safe to put on the page.
 *
 * Plain JS with explicit .js imports: the build script imports it directly.
 */
import { slugify } from '../utils/slug.js'

export const INSTAGRAM_URL_RE = /^https:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[A-Za-z0-9_-]+\/?(\?[^\s]*)?$/
const YOUTUBE_ID_RE = /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
const OWN_SITE_RE = /^https?:\/\/(www\.)?kreassiteam\.com(\/|$)/i

const LABELS = {
    id: { playVideo: 'Putar video', instagram: 'Lihat postingan ini di Instagram' },
    en: { playVideo: 'Play video', instagram: 'View this post on Instagram' },
}

const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
export const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ENTITIES[c])

/** Links: web, email, phone, or a path on this site. Anything else is dropped. */
const safeHref = (href) => {
    const h = String(href || '').trim()
    if (/^(https?:\/\/|mailto:|tel:)/i.test(h)) return h
    if (/^\/(?!\/)|^#/.test(h)) return h
    return null
}
const safeImageSrc = (src) => (/^https:\/\//i.test(String(src || '').trim()) ? String(src).trim() : null)
const isExternal = (href) => /^https?:\/\//i.test(href) && !OWN_SITE_RE.test(href)

// Link outermost, so one link spans differently formatted words.
const MARKS = {
    link: (attrs) => {
        const href = safeHref(attrs?.href)
        if (!href) return null
        const extra = isExternal(href) ? ' target="_blank" rel="noopener"' : ''
        return { key: `a ${href}`, open: `<a href="${escapeHtml(href)}"${extra}>`, close: '</a>' }
    },
    bold: () => ({ key: 'strong', open: '<strong>', close: '</strong>' }),
    italic: () => ({ key: 'em', open: '<em>', close: '</em>' }),
}
const MARK_ORDER = Object.keys(MARKS)

const tagsFor = (marks = []) => marks
    .filter((m) => MARKS[m?.type])
    .sort((a, b) => MARK_ORDER.indexOf(a.type) - MARK_ORDER.indexOf(b.type))
    .map((m) => MARKS[m.type](m.attrs))
    .filter(Boolean)

/** Inline content, merging marks across neighbours (one <a> per link, not per word). */
function renderInline(nodes = []) {
    let out = ''
    const open = []
    for (const node of nodes) {
        const tags = tagsFor(node.marks)
        let keep = 0
        while (keep < open.length && keep < tags.length && open[keep].key === tags[keep].key) keep += 1
        while (open.length > keep) out += open.pop().close
        for (const tag of tags.slice(keep)) { out += tag.open; open.push(tag) }
        if (node.type === 'text') out += escapeHtml(node.text)
        else if (node.type === 'hardBreak') out += '<br>'
    }
    while (open.length) out += open.pop().close
    return out
}

const hasText = (node) => (node.content ?? []).some((n) => n.type === 'text' && n.text?.trim())

function renderBlock(node, ctx) {
    const children = () => renderBlocks(node.content, ctx)
    switch (node.type) {
        case 'paragraph':
            return hasText(node) ? `<p>${renderInline(node.content)}</p>` : ''
        case 'heading': {
            if (!hasText(node)) return ''
            const level = node.attrs?.level === 3 ? 3 : 2
            let id = slugify(docText(node)) || 'bagian'
            for (let n = 2; ctx.ids.has(id); n += 1) id = `${slugify(docText(node)) || 'bagian'}-${n}`
            ctx.ids.add(id)
            return `<h${level} id="${id}">${renderInline(node.content)}</h${level}>`
        }
        case 'bulletList':
            return `<ul>${children()}</ul>`
        case 'orderedList': {
            const start = Number.parseInt(node.attrs?.start, 10)
            return `<ol${start > 1 ? ` start="${start}"` : ''}>${children()}</ol>`
        }
        case 'listItem':
            return `<li>${children()}</li>`
        case 'blockquote':
            return `<blockquote>${children()}</blockquote>`
        case 'horizontalRule':
            return '<hr>'
        case 'image': {
            const src = safeImageSrc(node.attrs?.src)
            return src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(node.attrs?.alt)}" loading="lazy" decoding="async">` : ''
        }
        case 'youtube': {
            const id = String(node.attrs?.src || '').match(YOUTUBE_ID_RE)?.[1]
            if (!id) return ''
            return `<button type="button" class="yt-lite" data-youtube-id="${id}" aria-label="${escapeHtml(ctx.labels.playVideo)}">`
                + `<img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" decoding="async"><span class="yt-lite__play" aria-hidden="true"></span></button>`
        }
        case 'instagramCard': {
            const url = String(node.attrs?.url || '')
            if (!INSTAGRAM_URL_RE.test(url)) return ''
            const clean = url.split('?')[0] // drop share-tracking parameters
            return `<div class="ig-card"><span class="ig-card__label">Instagram</span>`
                + `<a class="ig-card__link" href="${escapeHtml(clean)}" target="_blank" rel="noopener">${escapeHtml(node.attrs?.caption?.trim() || ctx.labels.instagram)}</a></div>`
        }
        default:
            return children()
    }
}

function renderBlocks(nodes = [], ctx) {
    return nodes.map((node) => renderBlock(node, ctx)).join('')
}

/** Editor JSON → safe HTML. `lang` picks the language of built-in labels. */
export function renderDoc(doc, { lang = 'id' } = {}) {
    const ctx = { ids: new Set(), labels: LABELS[lang] ?? LABELS.id }
    return renderBlocks(doc?.type === 'doc' ? doc.content : [], ctx)
}

/** Readable text of a document or node (blocks separated by new lines). */
export function docText(node) {
    if (!node) return ''
    if (node.type === 'text') return node.text ?? ''
    const inner = (node.content ?? []).map(docText).join('')
    return ['paragraph', 'heading', 'listItem', 'blockquote'].includes(node.type) ? `${inner}\n` : inner
}

export const countWords = (doc) => docText(doc).split(/\s+/).filter(Boolean).length
export const readingMinutes = (words) => Math.max(1, Math.round(words / 200))

/** Swap a click-to-load YouTube thumbnail for the real (privacy-enhanced) player. Browser only. */
export function activateYoutube(button) {
    const id = button?.getAttribute('data-youtube-id')
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return
    const iframe = document.createElement('iframe')
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`
    iframe.title = 'YouTube video'
    iframe.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture'
    iframe.allowFullscreen = true
    iframe.className = 'yt-frame'
    button.replaceWith(iframe)
}
