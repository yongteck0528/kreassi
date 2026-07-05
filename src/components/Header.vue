<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useActiveSection } from '../composables/useActiveSection'
import logo from '../assets/Logos/Kreassi/Original Kreassi Logo.png'

// Navigation items — hrefs must match the section IDs in App.vue.
const navItems = [
    { key: 'nav.home', href: '#home' },
    { key: 'nav.about', href: '#about' },
    { key: 'nav.team', href: '#team' },
    { key: 'nav.services', href: '#services' },
    { key: 'nav.contact', href: '#contact' },
    { key: 'nav.partners', href: '#partners' },
]

const sectionIds = navItems.map(item => item.href.slice(1))
const { active } = useActiveSection(sectionIds)
const isActive = (item) => active.value === item.href.slice(1)

const mobileMenuOpen = ref(false)
const { t, locale } = useI18n()

const currentLanguage = computed(() => (locale.value === 'en' ? 'EN' : 'ID'))

const toggleMobileMenu = () => { mobileMenuOpen.value = !mobileMenuOpen.value }
const toggleLanguage = () => {
    // Persisting the choice is handled centrally in src/i18n/index.js.
    locale.value = locale.value === 'en' ? 'id' : 'en'
}

// Close mobile menu after clicking a link
const onNavClick = () => { mobileMenuOpen.value = false }
</script>

<template>
    <nav class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">

                <!-- Logo -->
                <div class="flex-shrink-0">
                    <a href="#home" @click="onNavClick" aria-label="Kreassi Team Home">
                        <img :src="logo" alt="Kreassi Team logo" class="h-10 w-auto" />
                    </a>
                </div>

                <!-- Desktop Navigation -->
                <div class="hidden md:flex items-center space-x-0 ml-auto">
                    <a v-for="item in navItems" :key="item.key" :href="item.href" @click="onNavClick"
                        class="text-sm md:text-sm lg:text-base px-2 md:px-3 lg:px-4 py-4 h-16 flex items-center text-darkPurple transition-colors duration-100"
                        :class="isActive(item)
                            ? 'bg-purple-5 text-white font-bold cursor-default hover:bg-purple-5'
                            : 'nav-hover'"
                        :aria-current="isActive(item) ? 'page' : undefined">
                        {{ t(item.key) }}
                    </a>

                    <!-- Language Toggle -->
                    <div class="px-6 flex items-center">
                        <button @click="toggleLanguage"
                            class="text-base px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                            :aria-label="t('nav.languageToggle')">
                            {{ currentLanguage }}
                        </button>
                    </div>
                </div>

                <!-- Mobile menu button -->
                <div class="md:hidden">
                    <button @click="toggleMobileMenu" :aria-expanded="mobileMenuOpen" aria-controls="mobile-menu"
                        :aria-label="t('nav.menuToggle')"
                        class="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Navigation -->
        <div v-if="mobileMenuOpen" id="mobile-menu" class="md:hidden bg-white border-t border-gray-200">
            <div class="px-2 pt-2 pb-3 space-y-1">
                <a v-for="item in navItems" :key="item.key" :href="item.href" @click="onNavClick"
                    class="text-base block px-3 py-2 text-gray-700 nav-hover rounded-md transition-colors duration-200"
                    :class="isActive(item) ? 'nav-active-mobile text-white' : ''"
                    :aria-current="isActive(item) ? 'page' : undefined">
                    {{ t(item.key) }}
                </a>

                <!-- Mobile Language Toggle -->
                <div class="px-3 py-2">
                    <button @click="toggleLanguage"
                        class="text-base px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                        :aria-label="t('nav.languageToggle')">
                        {{ currentLanguage }}
                    </button>
                </div>
            </div>
        </div>
    </nav>
</template>

<style scoped>
/* Brand purple at 50% for the active mobile link, 20% for hover. */
.nav-active-mobile {
    background-color: rgba(124, 61, 176, 0.5);
}

.nav-hover:hover {
    background-color: rgba(124, 61, 176, 0.2);
}
</style>
