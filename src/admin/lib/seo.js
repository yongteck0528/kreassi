import { slugify } from './text'

/** Walk the editor JSON once and collect what the SEO checklist needs. */
export function analyzeDoc(doc) {
    const stats = { words: 0, h2: 0, images: 0, imagesMissingAlt: 0, links: [], firstParagraph: '', text: '' }
    const walk = (node) => {
        if (!node) return
        if (node.type === 'heading' && node.attrs?.level === 2) stats.h2 += 1
        if (node.type === 'image') {
            stats.images += 1
            if (!node.attrs?.alt?.trim()) stats.imagesMissingAlt += 1
        }
        if (node.type === 'instagramCard' && node.attrs?.url) stats.links.push(node.attrs.url)
        if (node.type === 'text') {
            stats.text += `${node.text} `
            for (const mark of node.marks ?? []) if (mark.type === 'link' && mark.attrs?.href) stats.links.push(mark.attrs.href)
        }
        if (node.type === 'paragraph' && !stats.firstParagraph) {
            const text = (node.content ?? []).map((c) => c.text ?? '').join('').trim()
            if (text) stats.firstParagraph = text
        }
        ;(node.content ?? []).forEach(walk)
        if (['paragraph', 'heading', 'listItem', 'blockquote'].includes(node.type)) stats.text += '\n'
    }
    walk(doc)
    stats.words = stats.text.split(/\s+/).filter(Boolean).length
    return stats
}

const norm = (s) => String(s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
const includesWord = (haystack, needle) => !!needle && norm(haystack).includes(norm(needle))
const OWN_LINK_RE = /^(\/|https?:\/\/(www\.)?kreassiteam\.com|https?:\/\/(wa\.me|api\.whatsapp\.com)|mailto:)/i

/**
 * Plain-language SEO checks for a post. Each: { id, ok, label, hint }.
 * `ok: null` means "not applicable yet" (e.g. no focus keyword set).
 */
export function seoChecks(post, stats) {
    const title = post.title?.trim() ?? ''
    const excerpt = post.excerpt?.trim() ?? ''
    const keyword = post.focus_keyword?.trim() ?? ''
    const checks = [
        {
            id: 'title',
            ok: title.length >= 30 && title.length <= 60,
            label: `Title length (${title.length} characters)`,
            hint: 'Aim for 30–60 characters so Google shows the whole title.',
        },
        {
            id: 'description',
            ok: excerpt.length >= 70 && excerpt.length <= 160,
            label: excerpt ? `Description length (${excerpt.length} characters)` : 'Add a description',
            hint: 'Shown under your title in Google. Aim for 70–160 characters.',
        },
        {
            id: 'length',
            ok: stats.words >= 300,
            label: `Length (${stats.words} words)`,
            hint: 'Posts of 300+ words give Google more to understand and rank.',
        },
        {
            id: 'headings',
            ok: stats.h2 > 0 ? true : stats.words < 300 ? null : false,
            label: 'Uses subheadings',
            hint: 'Break longer posts into sections with Heading 2.',
        },
        {
            id: 'image-alt',
            ok: stats.images === 0 ? null : stats.imagesMissingAlt === 0,
            label: stats.imagesMissingAlt ? `${stats.imagesMissingAlt} image(s) missing alt text` : 'Images have alt text',
            hint: 'Describe each image — for Google Images and screen readers.',
        },
        {
            id: 'cover',
            ok: !!post.cover_path && !!post.cover_alt?.trim(),
            label: post.cover_path ? (post.cover_alt?.trim() ? 'Cover image with alt text' : 'Cover image needs alt text') : 'Add a cover image',
            hint: 'Used at the top of the post and when it’s shared on WhatsApp or social media.',
        },
        {
            id: 'category',
            ok: !!post.category_id,
            label: 'Category chosen',
            hint: 'Helps readers (and Google) find related posts.',
        },
        {
            id: 'own-link',
            ok: stats.links.some((href) => OWN_LINK_RE.test(href)),
            label: 'Links to Kreassi (website or WhatsApp)',
            hint: 'Give readers a way to contact you — e.g. link “hubungi kami” to your WhatsApp.',
        },
    ]
    const keywordChecks = keyword
        ? [
            { id: 'kw-title', ok: includesWord(title, keyword), label: 'Focus keyword in the title', hint: `Include “${keyword}” in the title.` },
            { id: 'kw-url', ok: slugify(post.slug || '').includes(slugify(keyword)), label: 'Focus keyword in the URL', hint: `Include “${keyword}” in the URL.` },
            { id: 'kw-description', ok: includesWord(excerpt, keyword), label: 'Focus keyword in the description', hint: `Mention “${keyword}” in the description.` },
            { id: 'kw-intro', ok: includesWord(stats.firstParagraph, keyword), label: 'Focus keyword in the first paragraph', hint: `Mention “${keyword}” early in the post.` },
        ]
        : [{ id: 'kw', ok: null, label: 'Set a focus keyword', hint: 'The search phrase this post should rank for, e.g. “ide konten cafe”.' }]
    return [...checks, ...keywordChecks]
}
