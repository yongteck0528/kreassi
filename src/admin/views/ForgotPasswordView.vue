<script setup>
import { ref } from 'vue'
import AuthShell from '../components/AuthShell.vue'
import { useAuth } from '../composables/useAuth'
import { authErrorMessage, buttonClass, inputClass } from '../lib/authErrors'

const { requestPasswordReset } = useAuth()

const email = ref('')
const busy = ref(false)
const sent = ref(false)
const error = ref('')

const submit = async () => {
    error.value = ''
    busy.value = true
    try {
        await requestPasswordReset(email.value.trim())
        sent.value = true
    } catch (e) {
        error.value = authErrorMessage(e)
    } finally {
        busy.value = false
    }
}
</script>

<template>
    <AuthShell title="Reset password" subtitle="Ask someone on the team to reset it for you (Admin → Team → Reset password). The email option below may not reach you yet.">
        <div v-if="sent" class="space-y-4">
            <p class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
                If that email belongs to an admin account, a reset link is on its way. Check your inbox (and spam).
            </p>
            <router-link :to="{ name: 'login' }" class="block text-center text-sm font-medium text-purple-5 hover:underline">Back to sign in</router-link>
        </div>

        <form v-else class="space-y-4" novalidate @submit.prevent="submit">
            <div>
                <label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input id="email" v-model="email" type="email" autocomplete="username" required :class="inputClass" />
            </div>
            <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
            <button type="submit" :class="buttonClass" :disabled="busy || !email">
                {{ busy ? 'Sending…' : 'Send reset link' }}
            </button>
            <router-link :to="{ name: 'login' }" class="block text-center text-sm font-medium text-purple-5 hover:underline">Back to sign in</router-link>
        </form>
    </AuthShell>
</template>
