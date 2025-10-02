<script setup>
import { ref } from 'vue'
import { useActiveSection } from '../composables/useActiveSection'

const logo = new URL('../assets/Logos/Kreassi/Original Kreassi Logo.png', import.meta.url).href
// Navigation items (make sure hrefs match section IDs below)
const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About Us', href: '#about' },
    { name: 'Our Team', href: '#team' },
    { name: 'Services', href: '#services' },
    { name: 'Contact Us', href: '#contact' },
    { name: 'Partners', href: '#partners' },
]

const sectionIds = ['home', 'team', 'services', 'about', 'contact']
const { active } = useActiveSection(sectionIds)

const mobileMenuOpen = ref(false)
const currentLanguage = ref('EN')

const toggleMobileMenu = () => { mobileMenuOpen.value = !mobileMenuOpen.value }
const toggleLanguage = () => { currentLanguage.value = currentLanguage.value === 'EN' ? 'ID' : 'EN' }

// Close mobile menu after clicking a link
const onNavClick = () => { mobileMenuOpen.value = false }
</script>

<template>
    <nav class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">

                <!-- Logo -->
                <div class="flex-shrink-0">
                    <img :src="logo" alt="logo" class="h-10 w-auto" />
                </div>

                <!-- Desktop Navigation -->
                <div class="hidden md:flex items-center space-x-0 ml-auto">
                    <a v-for="item in navItems" :key="item.name" :href="item.href" @click="onNavClick"
                        class="font-primary text-sm md:text-sm lg:text-base px-2 md:px-3 lg:px-4 py-4 h-16 flex items-center text-darkPurple transition-colors duration-100"
                        :class="active === item.href.slice(1)
                            ? 'bg-purple-5 text-white font-bold cursor-default hover:bg-purple-5'  // no pale hover
                            : 'hover:bg-purple-20'                                                // only when not active
                            " :aria-current="active === item.href.slice(1) ? 'page' : undefined">
                        {{ item.name }}
                    </a>

                    <!-- Language Toggle -->
                    <div class="px-6 flex items-center">
                        <button @click="toggleLanguage"
                            class="font-primary text-base px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200">
                            {{ currentLanguage }}
                        </button>
                    </div>
                </div>

                <!-- Mobile menu button -->
                <div class="md:hidden">
                    <button @click="toggleMobileMenu"
                        class="text-gray-700 hover:text-gray-900 focus:outline-none focus:text-gray-900 p-2">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div v-if="mobileMenuOpen" class="md:hidden bg-white border-t border-gray-200">
            <div class="px-2 pt-2 pb-3 space-y-1">
                <a v-for="item in navItems" :key="item.name" :href="item.href" @click="onNavClick"
                    class="font-primary text-base block px-3 py-2 text-gray-700 hover:bg-purple-20 rounded-md transition-colors duration-200"
                    :class="active === item.href.slice(1) ? 'bg-purple-50 text-white' : ''"
                    :aria-current="active === item.href.slice(1) ? 'page' : undefined">
                    {{ item.name }}
                </a>

                <!-- Mobile Language Toggle -->
                <div class="px-3 py-2">
                    <button @click="toggleLanguage"
                        class="font-primary text-base px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200">
                        {{ currentLanguage }}
                    </button>
                </div>
            </div>
        </div>
    </nav>
</template>

<style scoped>
.bg-purple-50 {
    background-color: rgba(124, 61, 176, 0.5);
}

.hover\:bg-purple-20:hover {
    background-color: rgba(124, 61, 176, 0.2);
}
</style>
