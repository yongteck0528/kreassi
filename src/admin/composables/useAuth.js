import { computed, reactive } from 'vue'
import { supabase } from '../lib/supabase'

/**
 * Admin auth state, shared app-wide (module-level singleton).
 *
 * `role` comes from public.admins (one role: 'admin'). A signed-in user
 * without a row there has no access — the database enforces the same rule on
 * every table.
 */
const state = reactive({
    ready: false,
    session: null,
    role: null,          // 'admin' (or null: no access)
    recovering: false,   // arrived via password-reset / invite link
})

let initPromise = null

const loadRole = async () => {
    if (!state.session) { state.role = null; return }
    const { data, error } = await supabase
        .from('admins')
        .select('role')
        .eq('user_id', state.session.user.id)
        .maybeSingle()
    state.role = error ? null : data?.role ?? null
    // Mark this browser as the team's so the public site's analytics skip it
    // (read by src/analytics/pulse.js; same origin, so same localStorage).
    if (state.role) {
        try { localStorage.setItem('kreassi-admin', '1') } catch { /* storage blocked */ }
    }
}

const init = () => {
    initPromise ||= (async () => {
        const { data } = await supabase.auth.getSession()
        state.session = data.session
        await loadRole()

        supabase.auth.onAuthStateChange((event, session) => {
            state.session = session
            if (event === 'PASSWORD_RECOVERY') state.recovering = true
            // Defer: supabase-js warns against awaiting its calls inside this callback.
            setTimeout(loadRole, 0)
        })
        state.ready = true
    })()
    return initPromise
}

export function useAuth() {
    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        state.session = data.session
        await loadRole()
        return state.role
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        state.session = null
        state.role = null
    }

    const requestPasswordReset = async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/admin/set-password`,
        })
        if (error) throw error
    }

    const setPassword = async (password) => {
        const { error } = await supabase.auth.updateUser({ password })
        if (error) throw error
        state.recovering = false
    }

    return {
        state,
        init,
        signIn,
        signOut,
        requestPasswordReset,
        setPassword,
        email: computed(() => state.session?.user?.email ?? ''),
        isAdmin: computed(() => !!state.role),
    }
}
