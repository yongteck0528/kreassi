<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import heroVideo from '../assets/Videos/HomeVideo.mp4'

const { t } = useI18n()

const sectionRef = ref(null)
const videoRef = ref(null)
const isPlaying = ref(false)

// Muted by default — browsers only allow autoplay for muted video.
const isMuted = ref(true)

function toggleMute() {
    isMuted.value = !isMuted.value
    // Keep the element in sync even before Vue flushes the attribute binding.
    if (videoRef.value) videoRef.value.muted = isMuted.value
}

function play() {
    const video = videoRef.value
    if (!video) return
    video.play().catch(error => console.warn('Hero video play failed:', error))
}

// Pause the showreel when the hero scrolls out of view, resume when it returns.
let observer = null
onMounted(() => {
    observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) play()
            else videoRef.value?.pause()
        })
    }, { threshold: 0.5 })
    if (sectionRef.value) observer.observe(sectionRef.value)
})

onUnmounted(() => {
    observer?.disconnect()
    videoRef.value?.pause()
})
</script>

<template>
    <section ref="sectionRef" class="flex flex-col items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div class="w-full max-w-none text-center">
            <!-- Video card -->
            <div class="mx-auto w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-4xl pt-8">
                <div class="relative aspect-video overflow-hidden">
                    <video ref="videoRef" :src="heroVideo" class="absolute inset-0 h-full w-full object-cover"
                        autoplay :muted="isMuted" playsinline loop preload="auto"
                        :aria-label="t('hero.videoTitle')"
                        @play="isPlaying = true" @pause="isPlaying = false">
                    </video>

                    <!-- Play overlay, shown only when playback is paused/blocked -->
                    <button v-if="!isPlaying" type="button" class="absolute inset-0 group cursor-pointer"
                        @click="play" :aria-label="t('hero.playAriaLabel')">
                        <div
                            class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors duration-300">
                            <span
                                class="text-white shadow-lg scale-100 group-hover:scale-110 transition-transform duration-300">
                                <svg class="w-8 h-8 md:w-10 md:h-10" viewBox="0 0 24 24" fill="currentColor"
                                    aria-hidden="true">
                                    <path d="M8 5v14l11-7z" />
                                </svg>
                            </span>
                        </div>
                    </button>

                    <!-- Mute / unmute toggle -->
                    <button type="button" @click="toggleMute"
                        class="absolute bottom-3 right-3 z-10 flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full
                               bg-black/45 text-white backdrop-blur-sm ring-1 ring-white/20
                               hover:bg-black/65 transition-colors duration-200
                               focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                        :aria-label="isMuted ? t('hero.unmuteAriaLabel') : t('hero.muteAriaLabel')"
                        :aria-pressed="!isMuted">
                        <!-- Volume off -->
                        <svg v-if="isMuted" class="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="currentColor"
                            aria-hidden="true">
                            <path
                                d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
                        </svg>
                        <!-- Volume on -->
                        <svg v-else class="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="currentColor"
                            aria-hidden="true">
                            <path
                                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Heading -->
            <h1
                class="lg:mb-4 mt-6 md:mt-8 text-white leading-tight flex items-baseline gap-x-2 justify-center flex-wrap">
                <span class="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl">{{ t('hero.headingPrimary') }}</span>
                <span class="text-base sm:text-lg md:text-2xl lg:text-3xl opacity-90">{{ t('hero.headingSecondary') }}</span>
            </h1>
        </div>
    </section>
</template>
