import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/supabase'

// Admin-only client. Public pages never import this (keeps them light).
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Invite / password-reset links land on /admin/set-password with the
        // session in the URL; let the client pick it up.
        detectSessionInUrl: true,
        storageKey: 'kreassi-admin-auth',
    },
})
