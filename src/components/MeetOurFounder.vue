<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <section id="founder" class="bg-white">
        <div class="max-w-screen-xl mx-auto px-8 sm:px-10 lg:px-8 pt-10 sm:pt-12 lg:pt-[140px] pb-12 sm:pb-16 lg:pb-20">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-12 md:items-center">
                <div class="justify-self-center">
                    <div class="relative mx-auto md:mx-0
           w-[160px] sm:w-[220px] md:w-[260px] lg:w-[300px] xl:w-[340px]" style="aspect-ratio: 330 / 646;">
                        <div
                            class="absolute inset-x-0 bottom-0 h-[75%] rounded-3xl bg-middle-gradient ring-1 ring-black/10 shadow-xl z-0">
                        </div>

                        <img src="../assets/Images/AboutUs/ken.png" :alt="t('founder.imageAlt')"
                            class="relative z-10 block w-full h-auto object-contain select-none pointer-events-none"
                            loading="lazy" decoding="async" />
                    </div>
                </div>

                <div class="items-start">
                    <h2 class="text-darkPurple font-extrabold leading-tight text-3xl sm:text-4xl lg:text-[44px]">
                        {{ t('founder.title') }}
                    </h2>

                    <div class="mt-6 space-y-5 text-darkPurple/90 text-sm sm:text-sm md:text-xs lg:text-base xl:text-lg
              leading-relaxed md:leading-normal lg:leading-relaxed">
                        <p>
                            {{ t('founder.p1') }}
                        </p>
                        <p>
                            {{ t('founder.p2') }}
                        </p>
                        <p>
                            {{ t('founder.p3') }}
                        </p>
                        <p>
                            {{ t('founder.quote') }}
                        </p>
                        <p class="font-bold text-darkPurple">
                            {{ t('founder.p5') }}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    </section>
</template>
