<!-- src/components/Comments.vue -->
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { Icon } from '@iconify/vue'

const LOGO = (name) => new URL(`../assets/Logos/${name}.png`, import.meta.url).href
const logoError = ref(false)

/* ---------------------------
   1) Local data (edit freely)
   Put logo files in: src/assets/logos/
   Use just the filename in each item (e.g., "acme.png")
--------------------------- */
const comments = ref([
    {
        id: 1,
        customer_name: 'Jane Doe',
        comment: 'Clear value and smooth delivery. Our KPIs improved within the first month.',
        rating: 5,
        company: { name: 'Bakso Chuanki Kang Gelo', logo: LOGO('Bakso Cuanki Kang Gelo ') }
    },
    {
        id: 2,
        customer_name: 'Ryan P.',
        comment: 'Creative that actually performs. Solid iteration tempo and good communication.',
        rating: 4,
        company: { name: 'Hotel Q', logo: LOGO('Hotel Q ') }
    },
    {
        id: 3,
        customer_name: 'Maya L.',
        comment: 'Loved the motion graphics and the brand system refresh. Highly recommended.',
        rating: 5,
        company: { name: 'Kreasi Motor', logo: LOGO('Kreasi Motor') }
    }
    ,
    {
        id: 4,
        customer_name: 'Alex T.',
        comment: 'Professional team with great attention to detail. Our social media presence has never been better.',
        rating: 5,
        company: { name: 'Incredibowl', logo: LOGO('Incredibowl ') }
    },
    {
        id: 5,
        customer_name: 'Samantha R.',
        comment: 'The content creation services provided were top-notch and really helped boost our engagement.',
        rating: 4,
        company: { name: 'JAM', logo: LOGO('JAM ') }
    },
    {
        id: 6,
        customer_name: 'David K.',
        comment: 'Excellent service and results. Our brand visibility has significantly increased.',
        rating: 5,
        company: { name: 'Up 2 U Food & Life Junction', logo: LOGO('UP 2 U Food & Life Junction ') }
    },
    {
        id: 7,
        customer_name: 'Linda M.',
        comment: 'Creative concepts that truly resonate with our audience. The team was a pleasure to work with.',
        rating: 5,
        company: { name: 'Mahasiswa', logo: "" }
    }
])

/* Optional: auto-resolve logo URLs from /src/assets/logos/* */
const logoFiles = import.meta.glob('./assets/logos/*.{png,svg,jpg,jpeg,webp}', {
    eager: true, as: 'url'
})
function logoUrlByName(fileName) {
    if (!fileName) return null
    // Find a file that ends with /<fileName>
    const entry = Object.entries(logoFiles).find(([p]) => p.endsWith('/' + fileName))
    return entry ? entry[1] : null
}

/* ---------------------------
   2) Carousel state & logic
--------------------------- */
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

// Nav
const scrollLeft = () => { if (currentIndex.value > 0) currentIndex.value-- }
const scrollRight = () => { if (currentIndex.value < maxIndex.value) currentIndex.value++ }

// Font scale
const baseCard = 360
const fontScale = computed(() => {
    const s = cardWidth.value / baseCard
    return Math.max(0.85, Math.min(1.05, s))
})

// Viewport metrics
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
            cardHeight.value = 220
        } else if (inner < 768) {
            visibleSlots.value = 1.6
            gap.value = 16
            const totalGap = gap.value * Math.floor(visibleSlots.value)
            cardWidth.value = Math.floor((inner - totalGap) / visibleSlots.value)
            cardWidth.value = Math.max(Math.min(cardWidth.value, 480), 300)
            cardHeight.value = 250
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

onMounted(() => {
    recalc()
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

// Keyboard nav when in viewport
function onKeydown(e) {
    if (!wrapEl.value) return
    const rect = wrapEl.value.getBoundingClientRect()
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0
    if (!inViewport) return
    if (e.key === 'ArrowLeft') scrollLeft()
    if (e.key === 'ArrowRight') scrollRight()
}

// Touch swipe
let startX = 0, deltaX = 0
const threshold = 40
function onTouchStart(e) { startX = e.touches[0].clientX; deltaX = 0 }
function onTouchMove(e) { deltaX = e.touches[0].clientX - startX }
function onTouchEnd() {
    if (Math.abs(deltaX) > threshold) { deltaX < 0 ? scrollRight() : scrollLeft() }
    startX = 0; deltaX = 0
}

// Ratings
const clampInt = (n) => {
    const v = Number(n)
    if (!Number.isFinite(v)) return 0
    return Math.max(0, Math.min(5, Math.round(v)))
}
const starsFor = (n) => {
    const r = clampInt(n)
    return Array.from({ length: 5 }, (_, i) => i < r)
}

// Trailing spacer
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
                    <!-- Cards -->
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
                        <!-- Header -->
                        <div class="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 flex-shrink-0">
                            <div
                                class="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white border-2 border-white/30 flex items-center justify-center">
                                <!-- Logo image -->
                                <img v-if="comment?.company?.logo && !logoError" :src="comment.company.logo"
                                    :alt="comment?.company?.name ? `${comment.company.name} logo` : 'Company logo'"
                                    class="w-full h-full object-cover" loading="lazy" @error="logoError = true" />

                                <!-- Iconify fallback -->
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
                                    {{ comment?.company?.name || '—' }}
                                </p>
                            </div>
                        </div>

                        <!-- Body -->
                        <div class="flex-1">
                            <p class="leading-relaxed opacity-95 line-clamp-4" :style="{ fontSize: 'var(--fs-body)' }">
                                {{ comment?.comment || '' }}
                            </p>
                        </div>

                        <!-- Rating -->
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

                    <!-- Trailing spacer -->
                    <div :style="{ flex: `0 0 ${trailingSpacerPx}px` }"></div>
                </div>
            </div>

            <!-- Arrows -->
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
.line-clamp-4 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 4;
    line-clamp: 4;
    overflow: hidden;
}
</style>
