/**
 * Turn an eager `import.meta.glob(..., { query: '?url', import: 'default' })`
 * result into an array of URLs sorted by the number in the filename
 * (1.png, 2.png, 10.png…). Files without a number sort after numbered ones.
 */
export function sortedImageUrls(globResult) {
    const numberOf = (path) => {
        const match = path.match(/(\d+)\.\w+$/)
        return match ? Number(match[1]) : Infinity
    }

    return Object.entries(globResult)
        .sort(([a], [b]) => numberOf(a) - numberOf(b) || a.localeCompare(b))
        .map(([, url]) => url)
}
