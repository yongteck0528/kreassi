<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

import about3x1 from '../assets/Images/AboutUs/AboutUs3x1.JPG'
import about1x2 from '../assets/Images/AboutUs/AboutUs1x2.JPG'
import bgGradient from '../assets/Backgrounds/middle-gradient.png'

const features = ref([
    { id: 1, text: 'Consistency', icon: 'task_alt' },
    { id: 2, text: 'Collaboration', icon: 'task_alt' },
    { id: 3, text: 'Creative Impact', icon: 'task_alt' },
])

const iconMap = {
    task_alt: 'material-symbols:task-alt',
}

const iconify = (name) => iconMap[name] ?? name
</script>

<template>
    <section class="max-w-screen-xl mx-auto px-6 py-12 space-y-12">
        <div class="grid grid-cols-4 gap-x-3 sm:gap-x-4 lg:gap-x-6 items-center">
            <div class="col-span-1">
                <h1 class="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-primary font-bold text-darkPurple leading-none md:leading-tight">
                    About<br />Us
                </h1>
            </div>

            <div class="col-span-3">
                <div class="mobile-hero rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 w-full">
                    <img
                        :src="about3x1"
                        alt="Team highlight"
                        class="w-full h-full object-cover object-center"
                        loading="lazy"
                        decoding="async"
                        @error="($event.target.style.display = 'none')"
                    />
                </div>
            </div>
        </div>

        <div
            class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(180px,240px)] lg:grid-cols-[minmax(0,1fr)_minmax(210px,280px)] gap-x-4 lg:gap-x-6 gap-y-10 items-start"
        >
            <div>
                <div class="space-y-6">
                    <h3 class="font-paragraph-title text-base md:text-lg lg:text-xl font-primary text-darkPurple">
                        Your Creative Growth Partner
                    </h3>

                    <p class="font-paragraph-text text-sm md:text-base lg:text-lg text-darkPurple font-primary leading-relaxed">
                        Founded on August 8, 2021, Kreassi Team is built on a mission to drive digital transformation through social media.
                        We're not just content creators - we're your strategic creative partner.
                    </p>

                    <p class="font-paragraph-text text-sm md:text-base lg:text-lg text-darkPurple font-primary leading-relaxed">
                        From visual branding to digital storytelling, our passion lies in crafting scroll-stopping content and building
                        strong online communities. Whether you're launching, scaling, or rebranding, we bring structure, speed, and style
                        to your digital game.
                    </p>
                </div>

                <div class="pt-8">
                    <div class="grid grid-cols-3 gap-2 sm:gap-4 md:gap-2">
                        <div v-for="feature in features" :key="feature.id" class="min-w-0">
                            <div
                                class="w-full flex items-center justify-start text-left px-2 py-2 text-[11px] sm:px-4 sm:py-2.5 sm:text-xs lg:px-6 lg:py-3 lg:text-sm rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 bg-no-repeat bg-cover bg-center"
                                :style="{ backgroundImage: `url(${bgGradient})` }"
                            >
                                <span class="mr-2 inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow shrink-0">
                                    <Icon :icon="iconify(feature.icon)" class="w-4 h-4 sm:w-5 sm:h-5 text-darkPurple" aria-hidden="true" />
                                </span>

                                <span class="text-white font-primary font-medium truncate">
                                    {{ feature.text }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <aside class="hidden md:block md:self-start md:justify-self-end md:translate-x-2 lg:translate-x-3">
                <div class="w-full max-w-[190px] lg:max-w-[200px] rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5" style="aspect-ratio: 3 / 5;">
                    <img :src="about1x2" alt="Team portrait" class="w-full h-full object-cover" loading="lazy" decoding="async" style="object-position: 50% 30%;" />
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
