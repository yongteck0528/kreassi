<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthShell from '../components/AuthShell.vue'
import { useAuth } from '../composables/useAuth'
import { authErrorMessage, buttonClass, inputClass } from '../lib/authErrors'

// Reached from an invite or password-reset email (the link signs the user in),
// or from "Change password" while signed in.
const MIN_LENGTH = 10

const { state, email, setPassword } = useAuth()
const router = useRouter()

// Expired/used links come back with the reason in the URL hash, captured in
// admin/index.html before the auth client tidies the URL.
const linkError = new URLSearchParams(String(window.__authHash || '').replace(/^#/, '')).get('error_description')
const linkMessage = `${(linkError || 'This link is invalid or has expired').replace(/\.$/, '')}.`

const password = ref('')
const confirm = ref('')
const busy = ref(false)
const done = ref(false)
const error = ref('')

const submit = async () => {
    error.value = ''
    if (password.value.length < MIN_LENGTH) { error.value = `Use at least ${MIN_LENGTH} characters.`; return }
    if (password.value !== confirm.value) { error.value = 'The passwords do not match.'; return }
    busy.value = true
    try {
        await setPassword(password.value)
        done.value = true
        setTimeout(() => router.replace('/'), 1200)
    } catch (e) {
        error.value = authErrorMessage(e)
    } finally {
        busy.value = false
    }
}
</script>

<template>
    <AuthShell title="Set your password" :subtitle="state.session ? `For ${email}` : ''">
        <div v-if="!state.session" class="space-y-4">
            <p class="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {{ linkMessage }} Request a new one below.
            </p>
            <router-link :to="{ name: 'forgot-password' }" class="block text-center text-sm font-medium text-purple-5 hover:underline">Send a new link</router-link>
        </div>

        <p v-else-if="done" class="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">Password saved. Taking you to the admin…</p>

        <form v-else class="space-y-4" novalidate @submit.prevent="submit">
            <div>
                <label for="new-password" class="mb-1 block text-sm font-medium text-gray-700">New password</label>
                <input id="new-password" v-model="password" type="password" autocomplete="new-password" required :class="inputClass" />
                <p class="mt-1 text-xs text-gray-500">At least {{ MIN_LENGTH }} characters.</p>
            </div>
            <div>
                <label for="confirm-password" class="mb-1 block text-sm font-medium text-gray-700">Confirm password</label>
                <input id="confirm-password" v-model="confirm" type="password" autocomplete="new-password" required :class="inputClass" />
            </div>
            <p v-if="error" role="alert" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
            <button type="submit" :class="buttonClass" :disabled="busy || !password || !confirm">
                {{ busy ? 'Saving…' : 'Save password' }}
            </button>
        </form>
    </AuthShell>
</template>
