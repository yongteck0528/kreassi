import { reactive } from 'vue'
import { supabase } from '../lib/supabase'

const state = reactive({ items: [], loaded: false, error: '' })

export function useCategories() {
    const load = async (force = false) => {
        if (state.loaded && !force) return
        const { data, error } = await supabase.from('categories').select('id, slug, name, sort_order').order('sort_order').order('name')
        if (error) { state.error = 'Could not load categories.'; return }
        state.items = data
        state.loaded = true
        state.error = ''
    }
    const nameOf = (id) => state.items.find((c) => c.id === id)?.name ?? ''
    return { state, load, nameOf }
}
