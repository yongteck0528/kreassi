<template>
    <section id="home" class="hero min-h-[calc(100svh-var(--header-h,4rem))] bg-base-200">
        <div class="hero-overlay bg-base-100/10"></div>

        <div class="hero-content w-full max-w-none text-center px-4 sm:px-6 lg:px-8">
            <div class="w-full">
                <!-- Video card -->
                <div class="card glass mx-auto w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl pt-8">
                    <div class="relative aspect-video overflow-hidden rounded-box">
                        <!-- Active player (YouTube) -->
                        <iframe v-if="isPlaying && isYouTube" :src="embedUrl" class="absolute inset-0 h-full w-full"
                            frameborder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowfullscreen @load="onVideoLoad" title="Hero video">
                        </iframe>

                        <!-- Active player (local file/url) -->
                        <video v-else-if="isPlaying && !isYouTube" :src="currentUrl" :poster="posterUrl || undefined"
                            class="absolute inset-0 h-full w-full object-cover" autoplay muted playsinline controls loop
                            @loadeddata="onVideoLoad">
                        </video>

                        <!-- Thumbnail / Play surface -->
                        <button v-else type="button" class="absolute inset-0 group cursor-pointer" @click="play"
                            aria-label="Play featured video">
                            <img :src="thumbUrl" alt="Video thumbnail" class="h-full w-full object-cover"
                                loading="eager" decoding="async" />
                            <div
                                class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors duration-300">
                                <span
                                    class="btn btn-circle btn-error text-white shadow-lg scale-100 group-hover:scale-110 transition-transform duration-300">
                                    <svg class="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="currentColor"
                                        aria-hidden="true">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </span>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Heading -->
                <h1 class="mt-6 md:mt-8 text-white leading-tight flex items-baseline gap-x-2 justify-center flex-wrap">
                    <span class="font-hero-title font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">Discover A
                        Difference</span>
                    <span class="font-hero-text text-base sm:text-lg md:text-2xl lg:text-3xl opacity-90">with Kreassi
                        Team</span>
                </h1>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

/* ---------- 1) Configure your source here ---------- */
// Toggle this if you want auto-start without click
const AUTOPLAY = true

// OPTION A: Local/hosted file
const localPath = new URL('../../assets/Images/Videos/HomeVideo.mp4', import.meta.url).href
// OPTION B: YouTube link example
const youtubePath = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

const src = ref(youtubePath) // Change to localPath to use local video

// Poster (used for local video + thumbnail fallback)
import heroPoster from '../assets/Images/AboutUs/AboutUs2x1.JPG'
const posterUrl = ref(heroPoster)

/* ---------- 2) YouTube detection + embed URL ---------- */
const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/i
const isYouTube = computed(() => YT_REGEX.test(src.value))

const videoId = computed(() => {
    const m = src.value.match(YT_REGEX)
    return m ? m[1] : null
})

const embedUrl = computed(() =>
    isYouTube.value && videoId.value
        ? `https://www.youtube.com/embed/${videoId.value}?autoplay=1&rel=0&playsinline=1&mute=1&controls=1&modestbranding=1`
        : ''
)

// Unified URL for local player
const currentUrl = computed(() => (isYouTube.value ? '' : src.value))

// Thumbnail (YT maxres, else poster)
const thumbUrl = computed(() => {
    if (isYouTube.value && videoId.value) {
        return `https://i.ytimg.com/vi/${videoId.value}/maxresdefault.jpg`
    }
    return posterUrl.value || 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg"/>'
})

/* ---------- 3) Playback state + handlers ---------- */
const isPlaying = ref(false)
function play() { isPlaying.value = true }
function onVideoLoad() { /* noop */ }

// Start immediately if AUTOPLAY is true
onMounted(() => {
    if (AUTOPLAY) isPlaying.value = true
})
</script>

<style scoped>
@media (max-width: 768px) {
    .container {
        padding-left: 1rem;
        padding-right: 1rem;
    }
}
</style>
