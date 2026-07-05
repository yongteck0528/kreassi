<script setup>
import { Icon } from '@iconify/vue'
import { useI18n } from 'vue-i18n'
import { CONTACT, SOCIALS } from '../config/site'
import logo from '../assets/Logos/Kreassi/White - Kreassi Logo.png'

const { t } = useI18n()
const whatsappHref = (number) => `https://wa.me/${number.replace(/\s|\+/g, '')}`
</script>

<template>
    <footer class="bg-[#35164F] text-white">
        <div class="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
            <div class="grid grid-cols-1 gap-10 md:grid-cols-2">
                <div class="space-y-6">
                    <div class="flex items-center gap-2">
                        <img :src="logo" :alt="t('footer.logoAlt')" class="h-10 w-auto" loading="lazy" decoding="async" />
                    </div>

                    <div>
                        <h2 class="font-normal tracking-tight text-[clamp(22px,4vw,40px)]">{{ t('footer.heading') }}</h2>
                        <p class="mt-1 text-white font-thin text-[clamp(14px,2.2vw,18px)]">
                            <span class="font-bold">{{ t('footer.taglineHighlight') }}</span> {{ t('footer.taglineRest') }}
                        </p>
                    </div>

                    <nav :aria-label="t('footer.socialAriaLabel')" class="flex items-center gap-4">
                        <a v-for="s in SOCIALS" :key="s.name" :href="s.href" class="group inline-flex h-8 w-8 md:h-10 md:w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-[#35164F] transition
                 hover:bg-[#35164F] hover:text-white" :aria-label="s.name" target="_blank" rel="noopener">
                            <Icon :icon="s.icon" class="h-[clamp(18px,2.4vw,24px)] w-[clamp(18px,2.4vw,24px)]" />
                        </a>
                    </nav>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                    <div>
                        <h3 class="uppercase tracking-wider text-white/80 text-[clamp(12px,1.6vw,14px)]">{{ t('footer.inquiriesTitle') }}</h3>
                        <ul class="mt-2 space-y-2">
                            <li v-for="(c, i) in CONTACT.inquiries" :key="i" class="flex items-center gap-2">
                                <Icon icon="mdi:whatsapp" class="h-5 w-5 text-white" aria-hidden="true" />

                                <a :href="whatsappHref(c.number)" target="_blank" rel="noopener"
                                    class="font-semibold hover:text-gray-300 transition text-[clamp(14px,2vw,18px)] md:text-sm">
                                    {{ c.number }}
                                </a>

                                <span class="text-sm text-white/70">({{ c.label }})</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="uppercase tracking-wider text-white/80 text-[clamp(12px,1.6vw,14px)]">{{ t('footer.emailTitle') }}</h3>
                        <p class="mt-2">
                            <a :href="`mailto:${CONTACT.email}`"
                                class="font-semibold hover:text-gray-300 transition text-[clamp(14px,2vw,18px)]">
                                {{ CONTACT.email }}
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <div
                class="mt-10 border-t border-white/10 pt-6 text-[clamp(11px,1.8vw,14px)] text-white/60 text-center md:text-left">
                {{ t('footer.copyright') }}
            </div>
        </div>
    </footer>
</template>
