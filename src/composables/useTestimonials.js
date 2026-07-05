import { ref } from 'vue'
import { parseCsv } from '../utils/csv'
import { resolveLogo } from '../utils/partnerLogos'
import { fallbackTestimonials } from '../data/testimonials'
import { TESTIMONIALS_CSV_URL } from '../config/site'

/** Clamp a rating to an integer between 0 and 5. */
export const clampRating = (n) => {
    const v = Number(n)
    if (!Number.isFinite(v)) return 0
    return Math.max(0, Math.min(5, Math.round(v)))
}

const isVisible = (value) => {
    const normalized = String(value || '').trim().toLowerCase()
    return !['false', '0', 'no', 'n', 'hidden'].includes(normalized)
}

const numberOrNull = (value) => {
    const number = Number(value)
    return Number.isFinite(number) ? number : null
}

const firstValue = (...values) => values
    .map(value => String(value || '').trim())
    .find(Boolean) || ''

/** Map the published Google Sheet CSV into testimonial objects. */
function parseSheetTestimonials(csv) {
    const [headers = [], ...dataRows] = parseCsv(csv)
    const keys = headers.map(header => header.trim().toLowerCase())

    return dataRows
        .map((row, rowIndex) => {
            const entry = Object.fromEntries(keys.map((key, columnIndex) => [key, row[columnIndex] || '']))
            const logoFile = firstValue(entry.logo_file, entry.logo, entry.logo_url)
            const companyName = firstValue(entry.company_name, entry.company, logoFile)

            return {
                id: numberOrNull(entry.id) ?? rowIndex + 1,
                customer_name: firstValue(entry.customer_name, entry.name),
                comment: firstValue(entry.comment, entry.testimonial),
                rating: clampRating(firstValue(entry.rating, 5)),
                company: {
                    name: companyName,
                    logo: resolveLogo(logoFile),
                },
                _rowIndex: rowIndex,
                _sortOrder: numberOrNull(entry.sort_order),
                _visible: isVisible(entry.visible),
            }
        })
        .filter(comment => comment._visible)
        .filter(comment => comment.customer_name || comment.comment || comment.company.name)
        .sort((a, b) => {
            const aHasOrder = a._sortOrder !== null
            const bHasOrder = b._sortOrder !== null

            if (aHasOrder && bHasOrder) return a._sortOrder - b._sortOrder
            if (aHasOrder) return -1
            if (bHasOrder) return 1
            return a._rowIndex - b._rowIndex
        })
        .map(({ _rowIndex, _sortOrder, _visible, ...comment }) => comment)
}

/**
 * Testimonials list: starts with the bundled fallback data and swaps in the
 * live Google Sheet content once it loads. Call `load()` from onMounted.
 */
export function useTestimonials() {
    const testimonials = ref([...fallbackTestimonials])

    const load = async () => {
        try {
            const response = await fetch(TESTIMONIALS_CSV_URL, { cache: 'no-store' })
            if (!response.ok) throw new Error(`Google Sheet returned ${response.status}`)

            const sheetTestimonials = parseSheetTestimonials(await response.text())
            if (sheetTestimonials.length) testimonials.value = sheetTestimonials
            return sheetTestimonials.length > 0
        } catch (error) {
            console.warn('Could not load testimonials from Google Sheets:', error)
            return false
        }
    }

    return { testimonials, load }
}
