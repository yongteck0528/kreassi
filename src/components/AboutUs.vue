<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

import aboutMain from '../assets/Images/AboutUs/About_us.png'
import aboutSide from '../assets/Images/AboutUs/About_us_2.png'
import bgGradient from '../assets/Backgrounds/middle-gradient.png'

const { t, tm } = useI18n()

const features = computed(() =>
    tm('aboutUs.features').map((text, index) => ({ id: index + 1, text }))
)
</script>

<template>
    <section class="max-w-screen-xl mx-auto px-6 py-12 space-y-12">
        <div class="grid grid-cols-4 gap-x-3 sm:gap-x-4 lg:gap-x-6 items-center">
            <div class="col-span-1">
                <h2 v-reveal class="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-darkPurple leading-none md:leading-tight">
                    {{ t('aboutUs.titleLine1') }}<br />{{ t('aboutUs.titleLine2') }}
                </h2>
            </div>

            <div class="col-span-3">
                <div v-reveal class="mobile-hero rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 w-full">
                    <img
                        :src="aboutMain"
                        :alt="t('aboutUs.imageAltMain')"
                        class="w-full h-full object-cover object-center"
                        loading="lazy"
                        decoding="async"
                        @error="($event.target.style.display = 'none')"
                    />
                </div>
            </div>
        </div>

        <div
            class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(220px,300px)] lg:grid-cols-[minmax(0,1fr)_minmax(240px,340px)] gap-x-4 lg:gap-x-6 gap-y-10 items-start"
        >
            <div>
                <div v-reveal class="space-y-6">
                    <h3 class="text-lg md:text-xl lg:text-2xl text-darkPurple">
                        {{ t('aboutUs.heading') }}
                    </h3>

                    <p class="text-base md:text-lg lg:text-xl text-darkPurple leading-relaxed">
                        {{ t('aboutUs.p1') }}
                    </p>

                    <p class="text-base md:text-lg lg:text-xl text-darkPurple leading-relaxed">
                        {{ t('aboutUs.p2') }}
                    </p>
                </div>

                <div class="pt-8">
                    <div class="grid grid-cols-3 gap-2 sm:gap-4 md:gap-2">
                        <div v-for="(feature, i) in features" :key="feature.id" v-reveal="{ delay: i * 120 }" class="min-w-0">
                            <div
                                class="w-full flex items-center justify-start text-left px-2 py-2 text-xs sm:px-4 sm:py-2.5 sm:text-sm lg:px-6 lg:py-3 lg:text-base rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 bg-no-repeat bg-cover bg-center"
                                :style="{ backgroundImage: `url(${bgGradient})` }"
                            >
                                <span class="mr-2 inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow shrink-0">
                                    <Icon icon="material-symbols:task-alt" class="w-4 h-4 sm:w-5 sm:h-5 text-darkPurple" aria-hidden="true" />
                                </span>

                                <span class="text-white font-medium truncate">
                                    {{ feature.text }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- v-reveal goes on the inner div: the aside's translate-x utilities
                 would be overridden by the reveal transform. -->
            <aside class="hidden md:block md:self-start md:justify-self-end md:translate-x-2 lg:translate-x-3">
                <div v-reveal class="w-full max-w-[230px] lg:max-w-[260px] rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5" style="aspect-ratio: 3 / 5;">
                    <img :src="aboutSide" :alt="t('aboutUs.imageAltSide')" class="w-full h-full object-cover" loading="lazy" decoding="async" style="object-position: 50% 30%;" />
                </div>
            </aside>
        </div>
    </section>
</template>

<style scoped>
.mobile-hero {
    width: 100%;
    aspect-ratio: 3 / 1;
}
</style>
