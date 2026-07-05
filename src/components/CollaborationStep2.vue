<template>
    <section class="w-full bg-white">
        <div class="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-20 pb-6 sm:pb-10 lg:pb-16">
            <ul
                class="mt-8 sm:mt-10 grid gap-3 sm:gap-6 md:gap-6 lg:gap-7 grid-cols-4 md:grid-cols-4 lg:grid-cols-6 auto-rows-fr">
                <li v-for="(card, i) in cards" :key="i" v-reveal="{ delay: (i % 3) * 110 }"
                    class="relative h-full md:col-span-2 lg:col-span-2"
                    :class="[i === cards.length - 1 ? 'col-span-2 col-start-2' : 'col-span-2', pos[i]]">
                    <article class="bg-middle-gradient text-white rounded-2xl ring-1 ring-black/10
                   p-4 sm:p-7 lg:p-8 pt-10 sm:pt-12 h-full flex flex-col
                   shadow-[0_34px_88px_-22px_rgba(43,17,84,0.6),0_20px_40px_-16px_rgba(0,0,0,0.6),0_0_60px_-10px_rgba(124,61,176,0.45)]
">
                        <div class="absolute -top-5 sm:-top-6 left-1/2 -translate-x-1/2 h-12 w-12
                     rounded-full bg-white text-darkPurple flex items-center justify-center
                     shadow-lg ring-1 ring-black/10">
                            <Icon :icon="card.icon" class="text-2xl sm:text-4xl" aria-hidden="true" />
                        </div>

                        <h3 class="font-bold text-base sm:text-xl tracking-wide text-center my-2 sm:my-6 lg:my-6">
                            {{ card.title }}
                        </h3>

                        <p v-if="card.intro"
                            class="font-semibold text-white/90 mt-2 sm:mt-3 leading-relaxed text-xs sm:text-base">
                            {{ card.intro }}
                        </p>

                        <p v-if="card.opening" class="text-white/90 mt-2 sm:mt-3 leading-relaxed text-xs sm:text-base">
                            {{ card.opening }}
                        </p>

                        <ul v-if="card.points?.length" class="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                            <li v-for="(pt, j) in card.points" :key="j" class="flex items-baseline gap-2">
                                <span class="mt-1 h-2 w-2 rounded-full bg-white/80 shrink-0"></span>
                                <span class="text-white/90 text-xs sm:text-base leading-relaxed">{{ pt }}</span>
                            </li>
                        </ul>

                        <p v-if="card.outro" class="mt-3 sm:mt-4 text-white/90 text-xs sm:text-base leading-relaxed">
                            {{ card.outro }}
                        </p>

                        <p v-if="card.footer"
                            class="mt-4 sm:mt-5 italic font-bold text-white/85 text-xs sm:text-base leading-relaxed">
                            &ldquo;{{ card.footer }}&rdquo;
                        </p>
                    </article>
                </li>
            </ul>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'

const { tm } = useI18n()

// One Iconify icon per card, in display order.
const CARD_ICONS = [
    'material-symbols:diversity-2-rounded',
    'material-symbols:description-rounded',
    'material-symbols:task-alt-rounded',
    'material-symbols:payments-rounded',
    'lucide:clapperboard',
]

const cards = computed(() =>
    tm('collaborationStep2.cards').map((card, index) => ({ ...card, icon: CARD_ICONS[index] }))
)

// Grid column starts that produce the staggered 2-3 card arrangement.
const pos = [
    'md:col-start-1 lg:col-start-1',
    'md:col-start-3 lg:col-start-3',
    'md:col-start-1 lg:col-start-5',
    'md:col-start-3 lg:col-start-2',
    'md:col-start-2 lg:col-start-4',
]
</script>
