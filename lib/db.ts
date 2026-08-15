import { createClient } from '@supabase/supabase-js'

// Safe initialization - doesn't throw during build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if credentials exist
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

// Helper to check if Supabase is available
export const isSupabaseAvailable = () => supabase !== null
