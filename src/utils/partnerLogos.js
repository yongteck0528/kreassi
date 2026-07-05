/**
 * Central access to the partner logo images in src/assets/Logos.
 * Filenames in that folder are treated as the partner names (extension and
 * stray whitespace are ignored), so dropping a new PNG in is all that's needed.
 */
const files = import.meta.glob('../assets/Logos/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
})

const normalizeName = (name) => String(name || '')
    .trim()
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

const logoByName = new Map(Object.entries(files).map(([path, url]) => {
    const filename = path.split('/').pop() || ''
    return [normalizeName(filename), url]
}))

/** All bundled logos as { url, name } sorted by filename. */
export const allLogos = Object.entries(files).map(([path, url]) => {
    const filename = (path.split('/').pop() || '').trim()
    const base = filename.replace(/\.[^.]+$/, '').trim().replace(/\s+/g, ' ')
    return { url, name: base }
})

/**
 * Resolve a logo URL from a partner name or full URL.
 * Returns '' when no bundled logo matches.
 */
export function resolveLogo(name) {
    const value = String(name || '').trim()
    if (/^https?:\/\//i.test(value)) return value
    return logoByName.get(normalizeName(value)) || ''
}
