<script setup>
import { Icon } from '@iconify/vue'
</script>

<template>
    <div class="flex h-full items-center justify-center p-10">
        <div class="max-w-sm text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-5/10 text-purple-5">
                <Icon icon="mdi:file-document-edit-outline" class="h-6 w-6" />
            </div>
            <h2 class="mt-4 text-base font-semibold text-gray-900">Pick a post, or start a new one</h2>
            <p class="mt-2 text-sm text-gray-500">
                Drafts save automatically as you type. When you’re ready, press <strong class="font-semibold text-gray-700">Publish</strong>.
                Edits to a published post stay private until you press <strong class="font-semibold text-gray-700">Update post</strong>.
            </p>
        </div>
    </div>
</template>
