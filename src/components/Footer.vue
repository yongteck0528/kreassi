<script setup>
import { Icon } from '@iconify/vue';
const inquiries = [
    { number: '+62 8115700777', label: 'Indonesia' },
    { number: '+61 416487177', label: 'Australia' },
]
const email = 'admin@kreassiteam.com'
const socials = [
    { name: 'Instagram', href: 'https://instagram.com/kreassiteam', icon: 'mdi:instagram' },
    { name: 'WhatsApp', href: 'https://wa.me/628115700777', icon: 'mdi:whatsapp' },
    { name: 'Email', href: 'mailto:admin@kreassiteam.com', icon: 'heroicons-outline:envelope' },
];

const logo = new URL('../assets/Logos/Kreassi/White - Kreassi Logo.png', import.meta.url).href
</script>

<template>
    <footer class="bg-[#35164F] text-white">
        <div class="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
            <div class="grid grid-cols-1 gap-10 md:grid-cols-2">
                <!-- Left: Logo + CTA -->
                <div class="space-y-6">
                    <div class="flex items-center gap-2">
                        <img :src="logo" alt="Kreassi Logo" class="h-10 w-auto" />
                    </div>

                    <div>
                        <h2 class="font-normal tracking-tight text-[clamp(22px,4vw,40px)]">LET’S WORK TOGETHER</h2>
                        <p class="mt-1 text-white font-thin text-[clamp(14px,2.2vw,18px)]">
                            <span class="font-bold">Discover a new</span> difference for your business
                        </p>
                    </div>

                    <nav aria-label="Social links" class="flex items-center gap-4">
                        <a v-for="s in socials" :key="s.name" :href="s.href" class="group inline-flex h-8 w-8 md:h-10 md:w-10 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-[#35164F] transition
                 hover:bg-[#35164F] hover:text-white" :aria-label="s.name" target="_blank" rel="noopener">
                            <Icon :icon="s.icon" class="h-[clamp(18px,2.4vw,24px)] w-[clamp(18px,2.4vw,24px)]" />
                        </a>
                    </nav>
                </div>

                <!-- RIGHT: Contacts -->
                <div class="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                    <div>
                        <h3 class="uppercase tracking-wider text-white/80 text-[clamp(12px,1.6vw,14px)]">Inquiries</h3>
                        <ul class="mt-2 space-y-2">
                            <li v-for="(c, i) in inquiries" :key="i" class="flex items-center gap-2">
                                <!-- WhatsApp icon -->
                                <Icon icon="mdi:whatsapp" class="h-5 w-5 text-white" />

                                <!-- Clickable number -->
                                <a :href="`https://wa.me/${c.number.replace(/\s|\+/g, '')}`" target="_blank"
                                    rel="noopener"
                                    class="font-semibold hover:text-gray-300 transition text-[clamp(14px,2vw,18px)] md:text-sm">
                                    {{ c.number }}
                                </a>

                                <!-- Country label -->
                                <span class="text-sm text-white/70">({{ c.label }})</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 class="uppercase tracking-wider text-white/80 text-[clamp(12px,1.6vw,14px)]">Email Us</h3>
                        <p class="mt-2">
                            <a :href="`mailto:${email}`"
                                class="font-semibold hover:text-gray-300 transition text-[clamp(14px,2vw,18px)]">
                                {{ email }}
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            <div
                class="mt-10 border-t border-white/10 pt-6 text-[clamp(11px,1.8vw,14px)] text-white/60 text-center md:text-left">
                © 2025 Kreassi. All rights reserved.
            </div>
        </div>
    </footer>
</template>