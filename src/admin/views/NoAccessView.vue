<script setup>
import { useRouter } from 'vue-router'
import AuthShell from '../components/AuthShell.vue'
import { useAuth } from '../composables/useAuth'
import { buttonClass } from '../lib/authErrors'

const { email, signOut } = useAuth()
const router = useRouter()

const onSignOut = async () => {
    await signOut()
    router.replace({ name: 'login' })
}
</script>

<template>
    <AuthShell title="No admin access" :subtitle="email ? `Signed in as ${email}` : ''">
        <p class="text-sm text-gray-600">
            This account isn't set up as a Kreassi admin. Ask the site owner to add you, then sign in again.
        </p>
        <button type="button" :class="[buttonClass, 'mt-6']" @click="onSignOut">Sign out</button>
    </AuthShell>
</template>
