/**
 * Supabase project (auth, database, file storage for the admin area and blog).
 *
 * Both values are PUBLIC by design — the anon key only grants what the
 * database's row-level security policies allow. Never put the service_role /
 * secret key here: it lives only in Netlify environment variables.
 */
export const SUPABASE_URL = 'https://gjfltdddhppscqlyyfaa.supabase.co'

export const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdqZmx0ZGRkaHBwc2NxbHl5ZmFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1Mjc5MTgsImV4cCI6MjEwNjEwMzkxOH0.R31OfA3oTU-e7-aAE6jQH0XpgrKMINYmY9Es814rrK4'
