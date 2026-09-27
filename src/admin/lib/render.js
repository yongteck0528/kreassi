import { generateHTML } from '@tiptap/vue-3'
import DOMPurify from 'dompurify'
import { createExtensions } from '../editor/extensions'

const YOUTUBE_ID_RE = /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
const OWN_SITE_RE = /^https?:\/\/(www\.)?kreassiteam\.com(\/|$)/i

/**
 * Post content (editor JSON) → safe HTML for reading.
 * - YouTube: a click-to-load thumbnail instead of an iframe (no weight until tapped)
 * - external links open in a new tab; links to our own site don't
 * - everything is sanitised, whatever ends up in the JSON
 */
export function renderPostHtml(doc) {
    const html = generateHTML(doc?.type === 'doc' ? doc : { type: 'doc', content: [] }, createExtensions())
    const dom = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html')

    dom.querySelectorAll('div[data-youtube-video]').forEach((wrap) => {
        const id = wrap.querySelector('iframe')?.getAttribute('src')?.match(YOUTUBE_ID_RE)?.[1]
        if (!id) { wrap.remove(); return }
        const button = dom.createElement('button')
        button.type = 'button'
        button.className = 'yt-lite'
        button.setAttribute('data-youtube-id', id)
        button.setAttribute('aria-label', 'Play video')
        const thumb = dom.createElement('img')
        thumb.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
        thumb.alt = ''
        thumb.loading = 'lazy'
        const play = dom.createElement('span')
        play.className = 'yt-lite__play'
        play.setAttribute('aria-hidden', 'true')
        button.append(thumb, play)
        wrap.replaceWith(button)
    })

    dom.querySelectorAll('a[href]').forEach((a) => {
        const href = a.getAttribute('href') || ''
        if (/^https?:\/\//i.test(href) && !OWN_SITE_RE.test(href)) {
            a.setAttribute('target', '_blank')
            a.setAttribute('rel', 'noopener')
        }
    })
    dom.querySelectorAll('img').forEach((img) => { if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy') })

    return DOMPurify.sanitize(dom.body.firstElementChild.innerHTML, {
        ADD_ATTR: ['target', 'data-youtube-id', 'data-instagram-card', 'data-url', 'data-caption', 'loading'],
        FORBID_TAGS: ['style', 'iframe', 'script', 'form', 'input'],
    })
}

/** Swap a click-to-load YouTube thumbnail for the real (privacy-enhanced) player. */
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

export const readingMinutes = (words) => Math.max(1, Math.round(words / 200))
