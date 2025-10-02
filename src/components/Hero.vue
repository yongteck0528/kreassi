<template>
    <section ref="sectionRef" id="home"
        class="hero flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div class="hero-overlay"></div>

        <div class="hero-content w-full max-w-none text-center">
            <div class="w-full">
                <!-- Video card -->
                <div class="card glass mx-auto w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl pt-8">
                    <div class="relative aspect-video overflow-hidden rounded-box">
                        <!-- Active player (YouTube) -->
                        <iframe v-if="isPlaying && isYouTube" :src="embedUrl"
                            class="absolute inset-0 h-full w-full rounded-lg" frameborder="0"
                            allow="autoplay; encrypted-media; gyroscope; picture-in-picture" @load="onVideoLoad"
                            title="Hero video">
                        </iframe>

                        <!-- Active player (local file/url) -->
                        <video ref="videoRef" v-else-if="isPlaying && !isYouTube" :src="currentUrl"
                            :poster="posterUrl || undefined" class="absolute inset-0 h-full w-full object-cover"
                            :autoplay="isVisible" playsinline loop @loadeddata="onVideoLoad"
                            @play="handleVideoPlay" @pause="handleVideoPause">
                        </video>

                        <!-- Thumbnail / Play surface (shown when not playing) -->
                        <button v-if="!isPlaying" type="button" class="absolute inset-0 group cursor-pointer"
                            @click="play" aria-label="Play featured video">
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

                        <!-- Overlay for local video when paused but visible (to hide video while paused) -->
                        <div v-if="!isYouTube && !isPlaying && isVisible"
                            class="absolute inset-0 bg-black pointer-events-none"></div>
                    </div>
                </div>

                <!-- Heading -->
                <h1
                    class="lg:mb-4 mt-6 md:mt-8 text-white leading-tight flex items-baseline gap-x-2 justify-center flex-wrap">
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

/* ---------- 1) Configure your source here ---------- */
// Toggle this if you want auto-start without click
const AUTOPLAY = true

// OPTION A: Local/hosted file
import localPath from '../assets/Videos/HomeVideo.mp4'
// OPTION B: YouTube link example
const youtubePath = 'https://youtu.be/HLemPV3M7IE'

const src = ref(localPath) // Change to localPath to use local video

// Poster (used for local video + thumbnail fallback)
// import heroPoster from '../assets/Images/AboutUs/AboutUs2x1.JPG'
const posterUrl = ref(null)

/* ---------- 2) YouTube detection + embed URL ---------- */
const YT_REGEX = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#]+)/i
const isYouTube = computed(() => YT_REGEX.test(src.value))

const videoId = computed(() => {
    const m = src.value.match(YT_REGEX)
    return m ? m[1] : null
})

const embedUrl = computed(() =>
    isYouTube.value && videoId.value
        ? `https://www.youtube.com/embed/${videoId.value}?autoplay=1&rel=0&playsinline=1&controls=0&modestbranding=1&showinfo=0&fs=0`
        : ''
)

// Unified URL for local player
const currentUrl = computed(() => (isYouTube.value ? '' : src.value))

//Thumbnail (YT maxres, else poster)
const thumbUrl = computed(() => {
    if (isYouTube.value && videoId.value) {
        return `https://i.ytimg.com/vi/${videoId.value}/maxresdefault.jpg`
    }
    return posterUrl.value || 'data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg"/>'
})

/* ---------- 3) Playback state + handlers ---------- */
const isPlaying = ref(false)
const wasPlaying = ref(false)
const isVisible = ref(true)
const sectionRef = ref(null)
const videoRef = ref(null)

function play() {
    isPlaying.value = true
    wasPlaying.value = true
    if (!isYouTube.value && videoRef.value) {
        videoRef.value.play().catch(e => console.warn('Play failed:', e))
    }
}

function handleVideoPlay() {
    isPlaying.value = true
    wasPlaying.value = true
}

function handleVideoPause() {
    isPlaying.value = false
}

function onVideoLoad() {
    // noop - can add loading state if needed
}

// Intersection Observer for visibility detection
let observer = null
onMounted(async () => {
    await nextTick()
    if (sectionRef.value) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                isVisible.value = entry.isIntersecting
                if (entry.isIntersecting) {
                    // Resume if previously playing
                    if (!isPlaying.value && wasPlaying.value) {
                        play()
                    }
                } else {
                    // Stop/pause when scrolled away
                    if (isPlaying.value) {
                        if (isYouTube.value) {
                            // For YouTube, hide iframe to stop (will restart on resume)
                            isPlaying.value = false
                        } else if (videoRef.value) {
                            // For local, pause but keep mounted to preserve time
                            videoRef.value.pause()
                            isPlaying.value = false
                        }
                    }
                }
            })
        }, { threshold: 0.5 }) // Trigger when 50% of section is visible

        observer.observe(sectionRef.value)
    }

    // Start immediately if AUTOPLAY is true and visible
    if (AUTOPLAY && isVisible.value) {
        play()
    }
})

onUnmounted(() => {
    if (observer) {
        observer.disconnect()
    }
    if (videoRef.value) {
        videoRef.value.pause()
    }
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