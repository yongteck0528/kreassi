<script setup>
import { onMounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

const members = ref([])
const loading = ref(true)
const error = ref('')

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

onMounted(async () => {
    // Only the owner can read other admins' rows (enforced by the database).
    const { data, error: err } = await supabase
        .from('admins')
        .select('email, role, created_at')
        .order('created_at')
    if (err) error.value = 'Could not load the team. Please refresh.'
    else members.value = data
    loading.value = false
})
</script>

<template>
    <div class="space-y-4">
        <div class="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <table class="w-full text-left text-sm">
                <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                        <th class="px-5 py-3 font-medium">Email</th>
                        <th class="px-5 py-3 font-medium">Role</th>
                        <th class="hidden px-5 py-3 font-medium sm:table-cell">Added</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                    <tr v-if="loading"><td colspan="3" class="px-5 py-6 text-gray-500">Loading…</td></tr>
                    <tr v-else-if="error"><td colspan="3" class="px-5 py-6 text-red-700">{{ error }}</td></tr>
                    <tr v-for="m in members" v-else :key="m.email">
                        <td class="break-all px-5 py-3 text-gray-900">{{ m.email }}</td>
                        <td class="px-5 py-3">
                            <span :class="['rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                                m.role === 'owner' ? 'bg-darkPurple text-white' : 'bg-purple-5/10 text-purple-5']">{{ m.role }}</span>
                        </td>
                        <td class="hidden px-5 py-3 text-gray-500 sm:table-cell">{{ dateFormat.format(new Date(m.created_at)) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p class="text-sm text-gray-500">
            Inviting writers from this page arrives with the blog editor. Writers will be able to draft posts and submit them for your review.
        </p>
    </div>
</template>
