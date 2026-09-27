<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PostList from '../components/blog/PostList.vue'

// Knowledge-base layout: post list on the left, the open post on the right.
// On phones it's one or the other.
const route = useRoute()
const editing = computed(() => !!route.params.id)
</script>

<template>
    <div class="flex h-[calc(100dvh-3.5rem)] min-h-0 bg-white lg:h-screen">
        <aside :class="['w-full shrink-0 border-r border-gray-200 lg:block lg:w-72 xl:w-80', editing ? 'hidden' : 'block']">
            <PostList />
        </aside>
        <section :class="['min-w-0 flex-1', editing ? 'block' : 'hidden lg:block']">
            <router-view :key="route.params.id ?? 'home'" />
        </section>
    </div>
</template>
