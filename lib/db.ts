import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('URL:', supabaseUrl)
  console.error('Key:', supabaseKey ? 'Set but hidden' : 'Missing')
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'apikey': supabaseKey || '',
    },
  },
})

// Simple query wrapper for compatibility
export async function query(table: string, select: string = '*', filters: Record<string, any> = {}) {
  try {
    let query = supabase.from(table).select(select)
    
    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value)
      }
    })
    
    const { data, error } = await query
    if (error) throw error
    return { rows: data || [], rowCount: data?.length || 0 }
  } catch (error: any) {
    console.error(`❌ Query error on ${table}:`, error.message)
    return { rows: [], rowCount: 0, error: error.message }
  }
}

export default supabase
