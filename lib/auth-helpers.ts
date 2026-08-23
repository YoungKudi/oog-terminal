import { supabase } from './db'

export async function getUserIdFromSession(session: any) {
  if (!session?.user?.userId) return null
  
  try {
    const { data, error } = await supabase
      .from('User')
      .select('id')
      .eq('userId', session.user.userId)
      .single()
    
    if (error) {
      console.error('Error getting user ID:', error)
      return null
    }
    return data?.id
  } catch (error) {
    console.error('Error getting user ID:', error)
    return null
  }
}
