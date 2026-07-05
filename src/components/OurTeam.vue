<template>
    <section class="relative overflow-x-clip overflow-y-visible">
        <div class="relative bg-cover bg-center bg-var-3">
            <div v-reveal class="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-20 pt-12 sm:pt-12 lg:pt-20 text-center">
                <h2 class="text-white font-bold tracking-wide text-3xl sm:text-4xl lg:text-5xl">{{ t('ourTeam.title') }}</h2>
                <p class="text-white/90 mt-2 uppercase tracking-widest text-sm sm:text-base lg:text-lg">
                    {{ t('ourTeam.subtitle') }}
                </p>
                <p class="text-white/90 mt-4 max-w-2xl mx-auto text-xs sm:text-sm lg:text-base leading-relaxed">
                    {{ t('ourTeam.description') }}
                </p>
            </div>

            <div class="mt-6 sm:mt-8 lg:mt-10">
                <img v-reveal :src="teamImg" :alt="t('ourTeam.imageAlt')" class="block mx-auto w-full h-auto max-w-[min(96vw,1366px)]
                 drop-shadow-[0_30px_60px_rgba(0,0,0,.35)]" loading="lazy" decoding="async" />
            </div>

            <div class="pb-16 sm:pb-20 lg:pb-24"></div>

            <figure class="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-0
         translate-y-[calc(50%-1.75rem)]
         sm:translate-y-[calc(50%-1.5rem)]
         md:translate-y-[calc(50%-2rem)]
         lg:translate-y-[calc(50%-2.5rem)]
         xl:translate-y-[calc(50%-3.75rem)]
         w-[120vw] max-w-none z-30 select-none">
                <div class="absolute inset-x-0 bottom-0 h-[55%] bg-white -z-10"></div>
                <img :src="paperBg" alt="" class="block w-full h-auto" loading="lazy" decoding="async" />
                <figcaption class="absolute inset-0 flex items-center justify-center px-4">
                    <p class="font-bold text-darkPurple text-center leading-tight
              text-[16px] sm:text-[18px] md:text-[28px] lg:text-[36px] xl:text-[46px]">
                        {{ t('ourTeam.quote') }}
                    </p>
                </figcaption>
            </figure>
        </div>

        <div>
            <div class="pt-16 sm:pt-20 lg:pt-24"></div>
        </div>
    </section>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import teamImg from '../assets/Images/AboutUs/ourteam.png'
import paperBg from '../assets/Backgrounds/paperbg.png'

const { t } = useI18n()
</script>
