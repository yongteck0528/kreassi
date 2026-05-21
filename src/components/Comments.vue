<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1si6NiseBOoa5k9u4UALdJDH9QGmr_yODgCFhx-wmGj0/gviz/tq?tqx=out:csv'

const logoFiles = import.meta.glob('../assets/Logos/*.png', {
    eager: true,
    query: '?url',
    import: 'default',
})

const normalizeLogoName = (name) => String(name || '')
    .trim()
    .replace(/\.[^.]+$/, '')
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

const logoByName = new Map(Object.entries(logoFiles).map(([path, url]) => {
    const filename = path.split('/').pop() || ''
    return [normalizeLogoName(filename), url]
}))

const LOGO = (name) => {
    const value = String(name || '').trim()
    if (/^https?:\/\//i.test(value)) return value
    return logoByName.get(normalizeLogoName(value)) || ''
}

const failedLogoKeys = ref(new Set())
const logoErrorKey = (comment, index) => `${comment?.id ?? index}:${comment?.company?.logo || ''}`
const hasLogoError = (comment, index) => failedLogoKeys.value.has(logoErrorKey(comment, index))
const markLogoError = (comment, index) => {
    failedLogoKeys.value = new Set([...failedLogoKeys.value, logoErrorKey(comment, index)])
}

const clampInt = (n) => {
    const v = Number(n)
    if (!Number.isFinite(v)) return 0
    return Math.max(0, Math.min(5, Math.round(v)))
}

const fallbackComments = [
    {
        id: 1,
        customer_name: 'Andrew',
        comment: 'Hasil yang diberikan sudah sangat baik terutama dari segi design, kecepatan respon, dan waktu pengerjaannya yang terbilang cepat',
        rating: 5,
        company: { name: 'Mahasiswa', logo: "" }
    },
    {
        id: 2,
        customer_name: 'Miranda',
        comment: 'Thank you Kreassi tim udah do their best untuk bantu kami mulai dari segi sosmed, design web, hingga design packaging. Semuanya dilakukan secara komunikatif dan kooperatif. All the best for Kreassi Team!',
        rating: 5,
        company: { name: 'Natrindo', logo: LOGO('Natrindo USrya Prima ') }
    },
    {
        id: 3,
        customer_name: 'Hansen',
        comment: 'Semuanya sangat baikk, memberikan solusi dan inisiatif kepada client. ',
        rating: 5,
        company: { name: 'Otopia', logo: LOGO('Otopia Coating & Detailing ') }
    },
    {
        id: 4,
        customer_name: 'Marco',
        comment: 'Fast response, product photography yang menarik',
        rating: 5,
        company: { name: '2 Points Coffee', logo: LOGO('2 Points Coffee ') }
    },
    {
        id: 5,
        customer_name: 'Klemens',
        comment: 'Terima kasih Kreassi Team yang sudah membantu kami selama beberapa bulan terakhir. Semua design request dikerjakan dengan baik dan sangat membantu kebutuhan brand kami. Prosesnya juga lancar dan responsif. Sukses selalu untuk Kreassi Team!',
        rating: 5,
        company: { name: 'Pesona Pack', logo: LOGO('Pesona Pack ') }
    },
    {
        id: 6,
        customer_name: 'Bangun Gesang',
        comment: 'Pekerjaan dilakukan dengan sangat cepat dan respon tim yang sangat kooperatif',
        rating: 5,
        company: { name: 'Lamtara', logo: LOGO('Lamtara ') }
    },
]

const comments = ref([...fallbackComments])

const parseCsv = (csv) => {
    const rows = []
    let row = []
    let cell = ''
    let inQuotes = false

    for (let i = 0; i < csv.length; i++) {
        const char = csv[i]
        const next = csv[i + 1]

        if (char === '"') {
            if (inQuotes && next === '"') {
                cell += '"'
                i++
            } else {
                inQuotes = !inQuotes
            }
        } else if (char === ',' && !inQuotes) {
            row.push(cell)
            cell = ''
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
            if (char === '\r' && next === '\n') i++
            row.push(cell)
            if (row.some(value => value.trim())) rows.push(row)
            row = []
            cell = ''
        } else {
            cell += char
        }
    }

    row.push(cell)
    if (row.some(value => value.trim())) rows.push(row)

    return rows
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

const parseSheetComments = (csv) => {
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
                rating: clampInt(firstValue(entry.rating, 5)),
                company: {
                    name: companyName,
                    logo: LOGO(logoFile),
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

const wrapEl = ref(null)
const viewportEl = ref(null)

const currentIndex = ref(0)
const visibleSlots = ref(3)
const gap = ref(20)
const spacerWidth = 32

const cardWidth = ref(350)
const cardHeight = ref(260)

const itemCount = computed(() => comments.value.length)
const maxIndex = computed(() => Math.max(itemCount.value - 1, 0))

watch([maxIndex, itemCount], () => {
    if (currentIndex.value > maxIndex.value) currentIndex.value = maxIndex.value
    if (itemCount.value <= 0) currentIndex.value = 0
})

const scrollLeft = () => { if (currentIndex.value > 0) currentIndex.value-- }
const scrollRight = () => { if (currentIndex.value < maxIndex.value) currentIndex.value++ }

const baseCard = 360
const fontScale = computed(() => {
    const s = cardWidth.value / baseCard
    return Math.max(0.85, Math.min(1.05, s))
})

const getViewportMetrics = () => {
    const el = viewportEl.value
    if (!el) return { inner: 0, pl: 0, pr: 0 }
    const w = el.clientWidth
    const cs = getComputedStyle(el)
    const pl = parseFloat(cs.paddingLeft) || 0
    const pr = parseFloat(cs.paddingRight) || 0
    return { inner: Math.max(w - pl - pr, 0), pl, pr }
}

let ro = null
let rafId = null
const recalc = () => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
        const { inner } = getViewportMetrics()

        if (inner < 425) {
            visibleSlots.value = 1
            gap.value = 12
            const totalGap = gap.value * Math.floor(visibleSlots.value)
            cardWidth.value = Math.floor((inner - totalGap) / visibleSlots.value)
            cardWidth.value = Math.max(Math.min(cardWidth.value, 420), 280)
            cardHeight.value = 200
        } else if (inner < 768) {
            visibleSlots.value = 1.6
            gap.value = 16
            const totalGap = gap.value * Math.floor(visibleSlots.value)
            cardWidth.value = Math.floor((inner - totalGap) / visibleSlots.value)
            cardWidth.value = Math.max(Math.min(cardWidth.value, 480), 300)
            cardHeight.value = 230
        } else {
            visibleSlots.value = 3
            gap.value = 20
            const totalGap = gap.value * Math.floor(visibleSlots.value)
            cardWidth.value = Math.floor((inner - totalGap) / visibleSlots.value)
            cardWidth.value = Math.max(Math.min(cardWidth.value, 520), 320)
            cardHeight.value = 260
        }

        if (currentIndex.value > maxIndex.value) currentIndex.value = maxIndex.value
    })
}

const loadCommentsFromSheet = async () => {
    try {
        const response = await fetch(SHEET_CSV_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`Google Sheet returned ${response.status}`)

        const sheetComments = parseSheetComments(await response.text())
        if (!sheetComments.length) return

        comments.value = sheetComments
        currentIndex.value = 0
        recalc()
    } catch (error) {
        console.warn('Could not load testimonials from Google Sheets:', error)
    }
}

onMounted(() => {
    recalc()
    loadCommentsFromSheet()
    ro = new ResizeObserver(recalc)
    if (viewportEl.value) ro.observe(viewportEl.value)
    window.addEventListener('orientationchange', recalc)
    window.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
    if (ro && viewportEl.value) ro.unobserve(viewportEl.value)
    ro = null
    if (rafId) cancelAnimationFrame(rafId)
    window.removeEventListener('orientationchange', recalc)
    window.removeEventListener('keydown', onKeydown)
})

function onKeydown(e) {
    if (!wrapEl.value) return
    const rect = wrapEl.value.getBoundingClientRect()
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0
    if (!inViewport) return
    if (e.key === 'ArrowLeft') scrollLeft()
    if (e.key === 'ArrowRight') scrollRight()
}

let startX = 0
let deltaX = 0
const threshold = 40
function onTouchStart(e) { startX = e.touches[0].clientX; deltaX = 0 }
function onTouchMove(e) { deltaX = e.touches[0].clientX - startX }
function onTouchEnd() {
    if (Math.abs(deltaX) > threshold) { deltaX < 0 ? scrollRight() : scrollLeft() }
    startX = 0
    deltaX = 0
}

const starsFor = (n) => {
    const r = clampInt(n)
    return Array.from({ length: 5 }, (_, i) => i < r)
}

const trailingSpacerPx = computed(() =>
    Math.max((visibleSlots.value - 1) * (cardWidth.value + gap.value) + spacerWidth, spacerWidth)
)
</script>

<template>
    <section class="p-8">
        <div ref="wrapEl" class="relative max-w-9xl mx-auto" aria-label="Client testimonials carousel">
            <div ref="viewportEl" class="rounded-xl overflow-x-hidden overflow-y-visible h-80 flex items-center"
                @touchstart.passive="onTouchStart" @touchmove.passive="onTouchMove" @touchend.passive="onTouchEnd">
                <div v-if="!itemCount" class="text-sm text-gray-500 px-4">
                    No testimonials yet. Check back soon.
                </div>

                <div v-else class="flex transition-transform duration-300 ease-in-out w-max"
                    :style="{ transform: `translateX(-${currentIndex * (cardWidth + gap)}px)`, gap: `${gap}px` }">
                    <div v-for="(comment, index) in comments" :key="comment.id ?? index"
                        class="rounded-xl p-4 sm:p-6 text-white flex flex-col shadow-lg bg-middle-gradient relative overflow-y-visible"
                        :style="{
                            flex: `0 0 ${cardWidth}px`,
                            height: cardHeight + 'px',
                            overflow: 'visible',
                            '--fs-title': `calc(${fontScale} * 1rem)`,
                            '--fs-body': `calc(${fontScale} * 0.875rem)`,
                            '--fs-meta': `calc(${fontScale} * 0.75rem)`
                        }">
                        <div class="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 flex-shrink-0">
                            <div
                                class="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white border-2 border-white/30 flex items-center justify-center">
                                <img v-if="comment?.company?.logo && !hasLogoError(comment, index)" :src="comment.company.logo"
                                    :alt="comment?.company?.name ? `${comment.company.name} logo` : 'Company logo'"
                                    class="w-full h-full object-cover" loading="lazy" @error="markLogoError(comment, index)" />

                                <Icon v-else icon="mdi:account-circle"
                                    class="w-8 h-8 sm:w-9 sm:h-9 text-darkPurple"
                                    aria-hidden="true"
                                />
                            </div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-bold mb-1 truncate" :style="{ fontSize: 'var(--fs-title)' }">
                                    {{ comment?.customer_name || 'Anonymous' }}
                                </h3>
                                <p class="opacity-80 truncate" :style="{ fontSize: 'var(--fs-meta)' }">
                                    {{ comment?.company?.name || '-' }}
                                </p>
                            </div>
                        </div>

                        <div class="flex-1">
                            <p class="leading-relaxed opacity-95 line-clamp-5" :style="{ fontSize: 'var(--fs-body)' }">
                                {{ comment?.comment || '' }}
                            </p>
                        </div>

                        <div class="absolute bottom-0 left-1/4 -translate-x-1/2 translate-y-1/2 bg-white rounded-full px-3 sm:px-4 py-0.5 sm:py-1 shadow-md flex items-center gap-1 border border-gray-200 z-10"
                            :aria-label="`Rating ${clampInt(comment?.rating)} out of 5`">
                            <svg v-for="(filled, i) in starsFor(comment?.rating)" :key="i"
                                class="w-4 h-4 sm:w-5 sm:h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    :class="filled ? 'fill-yellow-400 stroke-yellow-400' : 'fill-transparent stroke-gray-300'"
                                    stroke-width="2"
                                    d="M12 17.27l-5.18 3.04 1.4-5.98L3 9.76l6.09-.52L12 3.5l2.91 5.74 6.09.52-5.22 4.57 1.4 5.98z" />
                            </svg>
                        </div>
                    </div>

                    <div :style="{ flex: `0 0 ${trailingSpacerPx}px` }"></div>
                </div>
            </div>

            <button v-if="itemCount > 1" class="absolute -left-3 sm:-left-3 md:-left-4 lg:-left-6 top-1/2 -translate-y-1/2
               h-9 w-9 md:h-12 md:w-12 rounded-full bg-white/90 text-purple-500
               flex items-center justify-center shadow-lg ring-1 ring-black/10
               hover:bg-purple-500 hover:text-white transition
               focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400
               disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-purple-500
               z-20 pointer-events-auto" @click="scrollLeft" :disabled="currentIndex === 0"
                aria-label="Previous testimonials" style="backdrop-filter: blur(6px);">
                <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5 md:w-6 md:h-6">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>

            <button v-if="itemCount > 1" class="absolute -right-3 sm:-right-3 md:-right-4 lg:-right-6 top-1/2 -translate-y-1/2
               h-9 w-9 md:h-12 md:w-12 rounded-full bg-white/90 text-purple-500
               flex items-center justify-center shadow-lg ring-1 ring-black/10
               hover:bg-purple-500 hover:text-white transition
               focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400
               disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-purple-500
               z-20 pointer-events-auto" @click="scrollRight" :disabled="currentIndex >= maxIndex"
                aria-label="Next testimonials" style="backdrop-filter: blur(6px);">
                <svg viewBox="0 0 24 24" fill="none" class="w-5 h-5 md:w-6 md:h-6">
                    <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </section>
</template>

<style scoped>
.line-clamp-5 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;
    line-clamp: 5;
    overflow: hidden;
}
</style>
