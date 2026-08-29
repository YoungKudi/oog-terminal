import { createClient } from '@supabase/supabase-js'

let supabaseInstance: any = null

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const getSupabase = () => {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase environment variables not available')
    return null
  }
  
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }
  return supabaseInstance
}

export const supabase = getSupabase()

export default getSupabase
