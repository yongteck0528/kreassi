<script setup>
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import FormDialog from '../components/FormDialog.vue'
import { useFormDialog } from '../composables/useFormDialog'
import { useTeam } from '../composables/useTeam'
import { useAuth } from '../composables/useAuth'
import { formatDate } from '../lib/text'

const team = useTeam()
const { state: auth } = useAuth()
const { dialog, ask, close } = useFormDialog()
const busy = ref('')
const error = ref('')
const myId = computed(() => auth.session?.user?.id)

onMounted(() => team.load(true))

const SIGN_IN_URL = 'https://kreassiteam.com/admin/'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Shows a temporary password once, with Copy and "send via WhatsApp".
const showPassword = (email, password, intro) => {
    const text = `Hi! ${intro}\n\nSign in: ${SIGN_IN_URL}\nEmail: ${email}\nTemporary password: ${password}\n\nPlease change your password after signing in (menu → Change password).`
    return ask({
        title: 'Temporary password',
        message: `Send this to ${email}. It’s shown only once — they should change it after signing in.`,
        copy: { label: 'Temporary password', value: password },
        links: [{ label: 'Send via WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(text)}`, icon: 'mdi:whatsapp' }],
        confirmLabel: 'Done',
        cancelLabel: null,
    })
}

const perform = async (key, fn) => {
    busy.value = key
    error.value = ''
    try { await fn() } catch (e) { error.value = e.message } finally { busy.value = '' }
}

const add = async () => {
    const values = await ask({
        title: 'Add a team member',
        message: 'They get full access: dashboard, blog and team.',
        fields: [{ key: 'email', label: 'Email', type: 'email', required: true, placeholder: 'name@example.com', validate: (v) => (EMAIL_RE.test(v) ? '' : 'Please enter a valid email address.') }],
        confirmLabel: 'Add member',
    })
    if (!values) return
    await perform('add', async () => {
        const result = await team.act('add_admin', { email: values.email })
        await team.load(true)
        await showPassword(result.email, result.temp_password, 'You now have access to the Kreassi website admin.')
    })
}

const reset = async (member) => {
    const ok = await ask({ title: `Reset password for ${member.email}?`, message: 'Their current password stops working. You’ll get a new temporary one to send them.', confirmLabel: 'Reset password' })
    if (!ok) return
    await perform(member.user_id, async () => {
        const result = await team.act('reset_password', { user_id: member.user_id })
        await showPassword(member.email, result.temp_password, 'Your password for the Kreassi website admin was reset.')
    })
}

const remove = async (member) => {
    const ok = await ask({ title: `Remove ${member.email}?`, message: 'They lose access immediately. Posts they wrote stay on the site.', confirmLabel: 'Remove', danger: true })
    if (!ok) return
    await perform(member.user_id, async () => {
        await team.act('remove', { user_id: member.user_id })
        await team.load(true)
    })
}
</script>

<template>
    <div class="space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-gray-500">Everyone on the team has full access to the dashboard, blog and team.</p>
            <button type="button" :disabled="!!busy"
                class="inline-flex items-center gap-1.5 rounded-lg bg-darkPurple px-3 py-2 text-sm font-semibold text-white hover:bg-[#4A1A78] disabled:opacity-60" @click="add">
                <Icon :icon="busy === 'add' ? 'mdi:loading' : 'mdi:account-plus-outline'" :class="['h-4 w-4', busy === 'add' && 'motion-safe:animate-spin']" />Add member
            </button>
        </div>
        <p v-if="error || team.state.error" role="alert" class="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{{ error || team.state.error }}</p>

        <ul class="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <li v-if="!team.state.loaded" class="px-5 py-6 text-sm text-gray-500">Loading…</li>
            <li v-for="m in team.state.members" :key="m.user_id" class="flex flex-wrap items-center gap-3 px-5 py-3">
                <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-purple-5/10 text-sm font-semibold uppercase text-purple-5" aria-hidden="true">
                    {{ m.email.charAt(0) }}
                </div>
                <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium text-gray-900">
                        {{ m.email }}
                        <span v-if="m.user_id === myId" class="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">You</span>
                    </p>
                    <p class="text-xs text-gray-500">Added {{ formatDate(m.created_at) }}</p>
                </div>
                <template v-if="m.user_id !== myId">
                    <button type="button" class="rounded-lg px-2.5 py-1.5 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50" :disabled="!!busy" @click="reset(m)">Reset password</button>
                    <button type="button" class="rounded-lg px-2.5 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50" :disabled="!!busy" @click="remove(m)">Remove</button>
                </template>
            </li>
        </ul>
        <p class="text-xs text-gray-400">Tip: there’s no email sender yet, so new members and password resets get a temporary password to pass on yourself.</p>
        <FormDialog v-if="dialog" :config="dialog" @close="close" />
    </div>
</template>
