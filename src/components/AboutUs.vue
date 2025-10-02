<script setup>
import { ref } from 'vue'
import { Icon } from '@iconify/vue'

import about1x1 from '../assets/Images/AboutUs/AboutUs1x1.JPG'
import about2x1 from '../assets/Images/AboutUs/AboutUs2x1.JPG'
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
        <!-- Block A: Title + 3x1 hero -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-6 items-center">
            <!-- Title + mobile image -->
            <div class="md:col-span-1">
                <div class="flex items-center gap-4 md:block">
                    <h1
                        class="text-5xl md:text-6xl lg:text-7xl font-primary font-bold text-darkPurple leading-none md:leading-tight">
                        About<br />Us
                    </h1>

                    <!-- MOBILE image (1x1 ≤360px, 2x1 361–639px) -->
                    <picture class="mobile-hero md:hidden rounded-xl overflow-hidden shrink-0">
                        <source :srcset="about2x1" media="(min-width: 361px) and (max-width: 639px)" />
                        <source :srcset="about1x1" media="(max-width: 360px)" />
                        <img :src="about1x1" alt="About us" class="w-full h-full object-cover" loading="lazy"
                            decoding="async" />
                    </picture>
                </div>
            </div>

            <!-- 3x1 hero (tablet/desktop) -->
            <div class="hidden md:block md:col-span-3 justify-self-end">
                <div class="rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5 mx-2
                 md:max-w-[620px] lg:max-w-[620px] xl:max-w-[720px]" style="aspect-ratio: 3 / 1;">
                    <img :src="about3x1" alt="Team highlight" class="w-full h-full object-cover" loading="lazy"
                        decoding="async" @error="($event.target.style.display = 'none')" />
                </div>
            </div>
        </div>

        <!-- Block B: Paragraphs + badges (left 3) | 1x2 photo (right 1) -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-x-8 gap-y-10 items-start">
            <!-- Left: paragraphs + badges -->
            <div class="md:col-span-3">
                <div class="space-y-6">
                    <h3 class="font-paragraph-title text-base md:text-lg lg:text-xl font-primary text-darkPurple">
                        Your Creative Growth Partner
                    </h3>

                    <p class="font-paragraph-text text-sm md:text-base text-darkPurple font-primary leading-relaxed">
                        Founded on August 8, 2021, Kreassi Team is built on a mission to drive digital
                        transformation through social media. We're not just content creators – we're your
                        strategic creative partner.
                    </p>

                    <p class="font-paragraph-text text-sm md:text-base text-darkPurple font-primary leading-relaxed">
                        From visual branding to digital storytelling, our passion lies in crafting scroll-stopping
                        content and building strong online communities. Whether you're launching, scaling, or
                        rebranding, we bring structure, speed, and style to your digital game.
                    </p>
                </div>

                <!-- Badges -->
                <div class="pt-8">
                    <div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-4">
                        <div v-for="feature in features" :key="feature.id" class="min-w-0">
                            <div class="w-full flex items-center justify-left
               px-2 py-2 text-[11px]
               sm:px-4 sm:py-2.5 sm:text-xs
               lg:px-6 lg:py-3 lg:text-sm
               rounded-full shadow-md hover:shadow-lg transition-shadow duration-200
               bg-no-repeat bg-cover bg-center" :style="{
                backgroundImage: `url(${bgGradient})`
            }">
                                <!-- white circular chip around icon -->
                                <span class="mr-2 inline-flex items-center justify-center
                     w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white shadow
                     shrink-0">
                                    <Icon :icon="iconify(feature.icon)" class="w-4 h-4 sm:w-5 sm:h-5 text-darkPurple"
                                        aria-hidden="true" />
                                </span>

                                <!-- white text -->
                                <span class="text-white font-primary font-medium truncate">
                                    {{ feature.text }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            <!-- Right: 1×2 photo (hidden on mobile) -->
            <aside class="hidden md:block md:col-span-1 md:self-start">
                <div class="ml-auto w-full
           md:w-[160px] lg:max-w-[220px] xl:w-[160px]
           rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5" style="aspect-ratio: 1 / 2;">
                    <img :src="about1x2" alt="Team portrait" class="w-full h-full object-cover" loading="lazy"
                        decoding="async" style="object-position: 50% 30%;" />
                </div>
            </aside>

        </div>
    </section>
</template>

<style scoped>
/* Mobile S: 1×1 next to title */
.mobile-hero {
    width: 5.5rem;
    aspect-ratio: 1 / 1;
}

/* Mobile M/L: 2×1 next to title */
@media (min-width: 361px) and (max-width: 639px) {
    .mobile-hero {
        width: 10.5rem;
        aspect-ratio: 2 / 1;
    }
}
</style>
