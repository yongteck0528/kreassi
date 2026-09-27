import { computed, reactive } from 'vue'
import { supabase } from '../lib/supabase'

// Shared post list for the blog sidebar. The editor updates entries in place,
// so titles and statuses in the list follow what's being typed.
const LIST_COLUMNS = 'id, title, status, updated_at, published_at, lang, category_id, pending_title:pending->>title'

const state = reactive({ items: [], loaded: false, loading: false, error: '' })

const sortItems = () => state.items.sort((a, b) => Date.parse(b.updated_at) - Date.parse(a.updated_at))

export function usePosts() {
    const load = async () => {
        state.loading = true
        const { data, error } = await supabase.from('posts').select(LIST_COLUMNS).order('updated_at', { ascending: false })
        state.loading = false
        if (error) {
            state.error = error.code === 'PGRST205' || error.code === '42P01'
                ? 'The blog isn’t set up in the database yet. Run supabase/migrations/0004_blog.sql in the Supabase SQL Editor.'
                : 'Could not load posts. Please refresh.'
            return
        }
        state.error = ''
        state.items = data
        state.loaded = true
    }

    const create = async () => {
        const { data, error } = await supabase.from('posts').insert({ title: '', lang: 'id' }).select(LIST_COLUMNS).single()
        if (error) throw error
        state.items.unshift(data)
        return data
    }

    /** Merge fresh values for one post into the list (called by the editor after saves). */
    const patch = (id, values) => {
        const item = state.items.find((p) => p.id === id)
        if (item) Object.assign(item, values)
        else state.items.unshift({ id, ...values })
        sortItems()
    }

    const remove = (id) => { state.items = state.items.filter((p) => p.id !== id) }

    return {
        state,
        load,
        create,
        patch,
        remove,
        drafts: computed(() => state.items.filter((p) => p.status === 'draft')),
        published: computed(() => state.items.filter((p) => p.status === 'published')),
    }
}
