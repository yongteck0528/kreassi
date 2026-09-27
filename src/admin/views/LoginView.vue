<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import AuthShell from '../components/AuthShell.vue'
import { useAuth } from '../composables/useAuth'
import { authErrorMessage, buttonClass, inputClass } from '../lib/authErrors'

const { signIn } = useAuth()
const route = useRoute()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const busy = ref(false)
const error = ref('')

const submit = async () => {
    error.value = ''
    busy.value = true
    try {
        const role = await signIn(email.value.trim(), password.value)
        if (!role) return router.replace({ name: 'no-access' })
        const redirect = route.query.redirect
        router.replace(typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/')
    } catch (e) {
        error.value = authErrorMessage(e)
    } finally {
        busy.value = false
    }
}
</script>

<template>
    <AuthShell title="Sign in" subtitle="Admin access for the Kreassi Team website.">
        <form class="space-y-4" novalidate @submit.prevent="submit">
            <div>
                <label for="email" class="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input id="email" v-model="email" type="email" autocomplete="username" required :class="inputClass" />
            </div>
            <div>
                <div class="mb-1 flex items-center justify-between">
                    <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
                    <router-link :to="{ name: 'forgot-password' }" class="text-xs font-medium text-purple-5 hover:underline">Forgot password?</router-link>
                </div>
                <div class="relative">
                    <input id="password" v-model="password" :type="showPassword ? 'text' : 'password'"
                        autocomplete="current-password" required :class="[inputClass, 'pr-10']" />
                    <button type="button" class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
                        :aria-label="showPassword ? 'Hide password' : 'Show password'" @click="showPassword = !showPassword">
                        <Icon :icon="showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" class="h-5 w-5" />
                    </button>
                </div>
            </div>

            <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>

            <button type="submit" :class="buttonClass" :disabled="busy || !email || !password">
                {{ busy ? 'Signing in…' : 'Sign in' }}
            </button>
        </form>
    </AuthShell>
</template>
