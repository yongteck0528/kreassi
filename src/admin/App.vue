<script setup>
import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'

const { state } = useAuth()
const route = useRoute()
const router = useRouter()

// If the session ends (signed out in another tab, token revoked, expired),
// leave any protected page immediately.
watch(() => state.session, (session) => {
    if (!session && state.ready && !route.meta.public) router.replace({ name: 'login' })
})
</script>

<template>
    <router-view />
</template>
