<template>
    <section :class="sectionClass">
        <div :class="containerClass">
            <div class="pt-8 sm:pt-12 lg:pt-20">
                <div class="text-left">
                    <h1 class="font-bold mb-2 text-2xl sm:text-3xl lg:text-5xl">{{ t('howItWorks.title') }}</h1>
                    <h2 class="font-semibold opacity-90 mb-8 sm:mb-10 lg:mb-12 sm:text-lg lg:text-2xl">
                        {{ t('howItWorks.subtitle') }}
                    </h2>

                    <div class="mb-10 lg:mb-12 max-w-3xl">
                        <h3 class="font-bold text-base sm:text-lg lg:text-2xl">{{ t('howItWorks.workflowTitle') }}</h3>
                        <p class="font-semibold opacity-95 leading-relaxed text-xs sm:text-sm lg:text-lg">
                            {{ t('howItWorks.workflowDescription') }}
                        </p>
                    </div>
                </div>

                <ul class="mt-2 max-w-3xl">
                    <li
                        v-for="(step, idx) in steps"
                        :key="step.title"
                        class="grid grid-cols-[2rem_1fr] sm:grid-cols-[2.5rem_1fr] lg:grid-cols-[3rem_1fr] gap-4 sm:gap-6 lg:gap-8"
                    >
                        <div class="relative flex flex-col items-center">
                            <div :class="stepIconContainerClass">
                                <Icon
                                    icon="lucide:chevron-right"
                                    class="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-darkPurple"
                                    aria-hidden="true"
                                />
                            </div>
                            <div v-if="idx !== steps.length - 1" class="flex-1 w-0.5 bg-white"></div>
                        </div>

                        <div class="pb-6 sm:pb-7 lg:pb-8">
                            <h4 class="font-bold text-sm sm:text-base lg:text-lg">{{ step.title }}</h4>
                            <p class="font-semibold leading-relaxed text-xs sm:text-sm lg:text-base">
                                {{ step.description }}
                            </p>
                        </div>
                    </li>
                </ul>
            </div>

            <div class="mt-auto pb-10 sm:pb-12 lg:pb-16">
                <h2 class="text-3xl sm:text-4xl md:text-5xl font-bold mb-8 lg:mb-12">{{ t('howItWorks.featuresTitle') }}</h2>
                <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl">
                    <div v-for="feature in features" :key="feature" :class="featureItemClass">
                        {{ feature }}
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()

const sectionClass = 'relative isolate w-full min-h-[100svh] bg-purple-gradient text-white overflow-hidden'
const containerClass = 'max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-20 min-h-[100svh] flex flex-col'
const stepIconContainerClass = 'h-7 w-7 sm:h-9 sm:w-9 lg:h-12 lg:w-12 rounded-full border-2 border-white/30 bg-white flex items-center justify-center shrink-0'
const featureItemClass = 'bg-white text-darkPurple font-bold border border-white/20 rounded-full py-2 px-4 sm:py-3 sm:px-8 text-xs sm:text-sm md:text-base flex items-center justify-center text-center bg-var-gray-diagonal transition-all duration-300 hover:backdrop-blur-lg hover:-translate-y-1 hover:shadow-xl w-full'

const steps = computed(() => tm('howItWorks.steps'))
const features = computed(() => tm('howItWorks.features'))
</script>
