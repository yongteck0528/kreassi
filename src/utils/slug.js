/** "Ide Konten Café & F&B!" → "ide-konten-cafe-f-b" (URL-safe, max 80 chars). */
export const slugify = (text) => String(text || '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '') // strip accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/, '')

export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/
