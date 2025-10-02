<template>
    <section class="w-full bg-white">
        <div class="max-w-screen-xl mx-auto px-6 sm:px-10 lg:px-20 pb-6 sm:pb-10 lg:pb-16">
            <ul
                class="mt-10 grid gap-5 sm:gap-6 md:gap-6 lg:gap-7 grid-cols-1 md:grid-cols-4 lg:grid-cols-6 auto-rows-fr">
                <li v-for="(card, i) in cards" :key="i" class="relative h-full md:col-span-2 lg:col-span-2"
                    :class="pos[i]">
                    <article class="bg-middle-gradient text-white rounded-2xl ring-1 ring-black/10
                   p-6 sm:p-7 lg:p-8 pt-12 h-full flex flex-col
                   shadow-[0_34px_88px_-22px_rgba(43,17,84,0.6),0_20px_40px_-16px_rgba(0,0,0,0.6),0_0_60px_-10px_rgba(124,61,176,0.45)]
">
                        <!-- medallion -->
                        <div class="absolute -top-6 left-1/2 -translate-x-1/2 h-16 w-16 sm:h-18 sm:w-18
                     rounded-full bg-white text-darkPurple flex items-center justify-center
                     shadow-lg ring-1 ring-black/10">
                            <Icon :icon="iconify(card.icon)" class="text-3xl sm:text-4xl" aria-hidden="true" />
                        </div>

                        <!-- centered title -->
                        <h1 class="font-bold text-lg sm:text-xl tracking-wide text-center my-2 sm:my-6 lg:my-6">
                            {{ card.title }}
                        </h1>

                        <p v-if="card.intro"
                            class="font-semibold text-white/90 mt-3 leading-relaxed text-sm sm:text-base">
                            {{ card.intro }}
                        </p>

                        <p v-if="card.opening" class="text-white/90 mt-3 leading-relaxed text-sm sm:text-base">
                            {{ card.opening }}
                        </p>

                        <ul v-if="card.points?.length" class="mt-4 space-y-2">
                            <li v-for="(pt, j) in card.points" :key="j" class="flex items-baseline gap-2">
                                <span class="mt-1 h-2 w-2 rounded-full bg-white/80 shrink-0"></span>
                                <span class="text-white/90 text-sm sm:text-base leading-relaxed">{{ pt }}</span>
                            </li>
                        </ul>

                        <p v-if="card.outro" class="mt-4 text-white/90 text-sm sm:text-base leading-relaxed">
                            {{ card.outro }}
                        </p>

                        <p v-if="card.footer"
                            class="mt-5 italic font-bold text-white/85 text-sm sm:text-base leading-relaxed">
                            “{{ card.footer }}”
                        </p>
                    </article>
                </li>
            </ul>
        </div>
    </section>
</template>

<script setup>
import { Icon } from '@iconify/vue'

/* Static content, simple mapping */
const cards = [
    {
        icon: 'diversity_2',
        title: 'CONSULTATION',
        intro: 'We start with a focused 15-minutes consultation via Google Meet.',
        opening: 'This quick yet meaningful session allows us to:',
        points: [
            'Understand your brand values, goals, and target audience.',
            'Identify the challenges you’re facing in content creation or digital engagement.',
            'Share initial recommendations and spark creative direction ideas.'
        ],
        outro: 'Our goal at this stage is to listen carefully and align visions before we dive deeper.',
        footer: 'We listen first — because every brand has a unique story to tell.',
    },
    {
        icon: 'description',
        title: 'PROPOSAL',
        intro: 'After the consultation, our team prepares a comprehensive proposal tailored to your brand needs.',
        opening: 'This document will include:',
        points: [
            'A curated content concept based on your goals.',
            'Recommended deliverables (e.g., feed posts, videos, reels, etc.)',
            'A clear timeline for planning, production, and revisions.',
            'Budget estimation, payment terms, and team responsibilities.'
        ],
        outro: 'This proposal ensures both parties are aligned on expectations before the work begins.',
        footer: 'No guesswork — just clarity, structure, and creative direction that fits your brand.',
    },
    {
        icon: 'task_alt',
        title: 'DEAL & CONFIRMATION',
        intro: 'Once you’ve reviewed the proposal and everything looks good, simply confirm the project.',
        opening: 'Upon confirmation, we will:',
        points: [
            'Send you the official invoice.',
            'Set up a dedicated communication group (via WhatsApp)',
            'Begin our internal onboarding process and task assignments.'
        ],
        outro: 'We value transparency and want to make sure every step forward is agreed and well-communicated.',
        footer: 'Clear communication is the foundation of every great collaboration.',
    },
    {
        icon: 'payments',
        title: 'PAYMENT',
        intro: 'Our payment structure is designed to ensure smooth progress and commitment from both sides:',
        opening: '',
        points: [
            '50% Down Payment (DP): Paid upfront to secure the schedule and begin production.',
            '50% Final Payment: Paid upon project completion, before final file delivery.'
        ],
        outro: 'All invoices will be issued under Kreassi Team’s official account, with clear due dates and payment instructions.',
        footer: 'We keep things simple, structured, and fair for both parties.',
    },
    {
        icon: 'movie_edit',
        title: 'PRODUCTION',
        intro: 'Now the creative journey begins! Once everything is confirmed and payment is received, our team jumps into action.',
        opening: 'This phase includes:',
        points: [
            'Brainstorming sessions & creative planning',
            'Field documentation (if needed)',
            'Content creation: design, video, editing, and caption writing',
            'Client feedback & minor revisions',
            'Final file delivery, ready to post',
        ],
        outro: 'We’ll keep you updated with progress and previews, so you stay informed every step of the way.',
        footer: 'From concept to content — we make sure every piece reflects your brand’s best version.',
    },
]

/* Hard positions by index (0..4) */
const pos = [
    'md:col-start-1 lg:col-start-1',
    'md:col-start-3 lg:col-start-3',
    'md:col-start-1 lg:col-start-5',
    'md:col-start-3 lg:col-start-2',
    'md:col-start-2 lg:col-start-4',
]

/* Iconify mapper:
   - Uses explicit aliases for your names
   - Falls back to Material Symbols (rounded) when possible */
const ICONS = {
    diversity_2: 'material-symbols:diversity-2-rounded',
    description: 'material-symbols:description-rounded',
    task_alt: 'material-symbols:task-alt-rounded',
    payments: 'material-symbols:payments-rounded', // or 'mdi:credit-card'
    movie_edit: 'lucide:clapperboard',               // production
}

const iconify = (name) =>
    String(name).includes(':')
        ? String(name)
        : (ICONS[name] ?? `material-symbols:${String(name).replace(/_/g, '-')}-rounded`)
</script>
