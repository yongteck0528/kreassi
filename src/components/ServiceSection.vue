<script setup>
import { ref, computed, defineAsyncComponent, nextTick, h, watch } from 'vue'
import SlideBase from './Services/SlideBase.vue'

const BG_URL = new URL('../assets/Backgrounds/3.jpeg', import.meta.url).href

/* Buttons */
const btnBase =
    "relative shrink-0 lg:shrink w-auto lg:w-full rounded-full px-4 py-2.5 lg:py-3 " +
    "text-[clamp(12px,2.4vw,15px)] lg:text-[15px] font-medium tracking-tight " +
    "transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-white/70 " +
    "backdrop-blur-md"
const btnIdle =
    "text-white/90 bg-white/10 border border-white/15 " +
    "hover:bg-white/14 hover:border-white/25 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,.45)] " +
    "before:absolute before:inset-0 before:rounded-full before:pointer-events-none " +
    "before:bg-[linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,0))] before:opacity-40"
const btnActive =
    "text-[#5E2A8A] bg-white border border-white shadow-[0_12px_28px_-12px_rgba(124,61,176,.55)] " +
    "ring-1 ring-[#B76EFA]/40 " +
    "before:absolute before:inset-0 before:rounded-full before:pointer-events-none " +
    "before:bg-[radial-gradient(120%_180%_at_10%_-20%,rgba(183,110,250,.25),rgba(255,255,255,0))] " +
    "hover:before:opacity-100"

/* Async loaders */
const LoadingView = { template: `<div class="h-full grid place-items-center text-white/80 text-sm md:text-base">Loading…</div>` }
const ErrorView = {
    props: { error: Object },
    template: `<div class="h-full grid place-items-center text-red-300 text-sm md:text-base px-4 text-center">
    <div>
      <p class="font-semibold">Failed to load slide.</p>
      <p class="opacity-80 mt-1">Check file path / name & rebuild.</p>
      <pre class="opacity-60 mt-2 text-xs" v-if="error">{{ error.message }}</pre>
    </div>
  </div>`
}
const ErrorBoundary = {
    name: 'ErrorBoundary',
    data: () => ({ err: null }),
    errorCaptured(err) { this.err = err; return false },
    render() {
        if (this.err) {
            return h('div', { class: 'h-full grid place-items-center text-red-300 text-sm md:text-base px-4 text-center' },
                [h('div', [
                    h('p', { class: 'font-semibold' }, 'This slide crashed while rendering.'),
                    h('p', { class: 'opacity-80 mt-1' }, 'Open the console for details.')
                ])])
        }
        return this.$slots.default?.()
    }
}
const load = (fn) => defineAsyncComponent({ loader: fn, loadingComponent: LoadingView, errorComponent: ErrorView, delay: 150, timeout: 30000 })

/* Slides map */
const componentsMap = {
    SlideSocialMedia: load(() => import('./Services/SlideSocialMedia.vue')),
    SlideContentCreation: load(() => import('./Services/SlideContentCreation.vue')),
    SlideMarketingCampaign: load(() => import('./Services/SlideMarketingCampaign.vue')),
    SlideBranding: load(() => import('./Services/SlideBranding.vue')),
    SlidePhotography: load(() => import('./Services/SlidePhotography.vue')),
    SlideVideography: load(() => import('./Services/SlideVideography.vue')),
    SlideGraphicDesign: load(() => import('./Services/SlideGraphicDesign.vue')),
    SlideMotionGraphic: load(() => import('./Services/SlideMotionGraphic.vue')),
    SlideLogoDesign: load(() => import('./Services/SlideLogoDesign.vue')),
    SlideWebsiteDesign: load(() => import('./Services/SlideWebsiteDesign.vue')),
}

/* Tabs */
const tabs = [
    { key: 'social', label: 'Social Media', comp: 'SlideSocialMedia', title: 'Social Media Management', subtitle: 'Grow your brand on social platforms' },
    { key: 'content', label: 'Content Creation', comp: 'SlideContentCreation', title: 'Content Creation', subtitle: 'Engaging content tailored for you' },
    { key: 'campaign', label: 'Marketing Campaign', comp: 'SlideMarketingCampaign', title: 'Marketing Campaign', subtitle: 'Strategic campaigns that convert' },
    { key: 'branding', label: 'Branding', comp: 'SlideBranding', title: 'Branding', subtitle: 'Build a strong brand identity' },
    { key: 'photo', label: 'Photography', comp: 'SlidePhotography', title: 'Photography', subtitle: 'Capture moments professionally' },
    { key: 'video', label: 'Videography', comp: 'SlideVideography', title: 'Videography', subtitle: 'Visual storytelling through video' },
    { key: 'graphic', label: 'Graphic Design', comp: 'SlideGraphicDesign', title: 'Graphic Design', subtitle: 'Creative designs that stand out' },
    { key: 'motion', label: 'Motion Graphic', comp: 'SlideMotionGraphic', title: 'Motion Graphic', subtitle: 'Dynamic animations and visuals' },
    { key: 'logo', label: 'Logo Design', comp: 'SlideLogoDesign', title: 'Logo Design', subtitle: 'Unique logos for your brand' },
    { key: 'web', label: 'Website Design', comp: 'SlideWebsiteDesign', title: 'Website Design', subtitle: 'Modern and responsive websites' },
]

const activeIndex = ref(0)
const activeTab = computed(() => tabs[activeIndex.value])
const ActiveComponent = computed(() => componentsMap[activeTab.value.comp])

/* Mobile scroll-to-selected */
const navTrack = ref(null)
function setActive(index) {
    if (index === activeIndex.value) return
    activeIndex.value = index
    nextTick(() => {
        const track = navTrack.value
        const btn = track?.querySelector(`[data-index="${index}"]`)
        if (!track || !btn) return
        const left = btn.offsetLeft - 16
        const right = left + btn.offsetWidth + 32
        if (left < track.scrollLeft) track.scrollTo({ left, behavior: 'smooth' })
        else if (right > track.scrollLeft + track.clientWidth)
            track.scrollTo({ left: right - track.clientWidth, behavior: 'smooth' })
    })
}
</script>

<template>
    <!-- Height locks per breakpoint -->
    <section class="relative w-full max-w-full isolate overflow-x-hidden
           h-[408px] md:h-[598.03px] lg:h-screen" aria-label="Services">
        <!-- Background -->
        <div class="absolute inset-0 -z-10">
            <img :src="BG_URL" alt=""
                class="h-full w-full object-cover object-center select-none pointer-events-none" />
            <div class="absolute inset-0 bg-black/25"></div>
        </div>

        <!-- Layout: nav + slide; no width bleed -->
        <div class="grid h-full grid-rows-[auto,1fr] min-w-0 max-w-full">
            <!-- NAV -->
            <nav class="w-full py-4 min-w-0" role="tablist" aria-label="Service tabs">
                <div class="w-full min-w-0 px-3 sm:px-6 md:px-8 pt-3">
                    <div ref="navTrack" class="min-w-0 flex flex-nowrap overflow-x-auto no-scrollbar scroll-px-4 gap-2
                   lg:grid lg:grid-cols-5 lg:gap-3 lg:overflow-visible">
                        <button v-for="(tab, index) in tabs" :key="tab.key" :data-index="index" type="button" role="tab"
                            :aria-selected="index === activeIndex" :tabindex="index === activeIndex ? 0 : -1"
                            @click="setActive(index)" :class="[btnBase, index === activeIndex ? btnActive : btnIdle]">
                            <span class="px-1">{{ tab.label }}</span>
                        </button>
                    </div>
                </div>
            </nav>

            <!-- Slide area fills the locked height -->
            <div class="min-h-0 h-full pt-4 md:pt-6 px-0 min-w-0 max-w-full">
                <ErrorBoundary>
                    <Suspense>
                        <template #default>
                            <transition name="fade" mode="out-in">
                                <SlideBase :key="activeTab.key" :title="activeTab.title" :subtitle="activeTab.subtitle"
                                    class="h-full w-full min-w-0">
                                    <component :is="ActiveComponent" />
                                </SlideBase>
                            </transition>
                        </template>
                        <template #fallback>
                            <div class="h-full grid place-items-center text-white/80 text-sm md:text-base">Loading…
                            </div>
                        </template>
                    </Suspense>
                </ErrorBoundary>
            </div>
        </div>
    </section>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity .25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
