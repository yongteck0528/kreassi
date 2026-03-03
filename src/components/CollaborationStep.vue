<template>
    <!-- Center vertically & horizontally -->
    <section class="w-full min-h-[75svh] md:min-h-[100svh] flex flex-col items-center justify-center px-4">
        <!-- Heading -->
        <h2 class="text-3xl sm:text-4xl md:text-[48px] font-bold text-center text-darkPurple">
            {{ t('collaborationStep.title') }}
        </h2>
        <p class="mt-2 text-center tracking-widest uppercase text-darkPurple/70">
            {{ t('collaborationStep.subtitle') }}
        </p>

        <ul class="mt-12 mx-auto list-none p-0 gap-2">
            <li v-for="(step, idx) in steps" :key="idx"
                class="grid grid-cols-[64px_auto] sm:grid-cols-[84px_auto] gap-x-4 sm:gap-x-7">
                <!-- Left rail -->
                <div class="relative flex flex-col items-center self-center sm:self-stretch">
                    <div
                        class="bg-middle-gradient h-14 w-14 sm:h-20 sm:w-20 rounded-full my-2 shadow-lg flex items-center justify-center shrink-0">
                        <Icon :icon="iconify(step.icon)" class="text-2xl sm:text-4xl leading-none text-white"
                            aria-hidden="true" />
                    </div>
                </div>

                <!-- Right column -->
                <div class="text-left self-center">
                    <!-- smaller on mobile, bump at sm -->
                    <h3 class="text-base sm:text-xl font-bold text-darkPurple leading-snug sm:leading-normal">
                        {{ step.title }}
                    </h3>
                    <p class="text-xs sm:text-base text-darkPurple leading-snug sm:leading-relaxed mt-0.5 sm:mt-1">
                        {{ step.description }}
                    </p>
                </div>
            </li>
        </ul>

    </section>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

const { t, tm } = useI18n()

const stepIcons = ['video_call', 'description', 'checklist', 'credit_card', 'movie_edit']
const steps = computed(() =>
    tm('collaborationStep.steps').map((step, index) => ({ ...step, icon: stepIcons[index] }))
)

const ICONS = {
    video_call: 'material-symbols:video-call-rounded',
    description: 'material-symbols:description-rounded',
    checklist: 'material-symbols:checklist-rounded',
    credit_card: 'mdi:credit-card',
    movie_edit: 'lucide:clapperboard', // or 'mdi:movie-open-outline'
}
const iconify = (name) =>
    String(name).includes(':')
        ? String(name)
        : (ICONS[name] ?? `material-symbols:${String(name).replace(/_/g, '-')}-rounded`)
</script>
