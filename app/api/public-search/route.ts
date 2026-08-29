import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const rateLimitResult = rateLimit(ip, true)
  
  if (rateLimitResult.limited) {
    return NextResponse.json({ 
      error: rateLimitResult.blocked 
        ? `Too many requests. Please try again in ${rateLimitResult.blockRemaining} seconds.`
        : 'Rate limit exceeded. Please wait a moment.'
    }, { status: 429 })
  }
  
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ 
      error: 'Service temporarily unavailable' 
    }, { status: 503 })
  }
  
  try {
    const { containerNumbers } = await req.json()
    
    if (!containerNumbers || !Array.isArray(containerNumbers) || containerNumbers.length === 0) {
      return NextResponse.json({ error: 'No container numbers provided' }, { status: 400 })
    }
    
    const cleanNumbers = containerNumbers
      .map((num: string) => num.trim().toUpperCase())
      .filter((num: string) => num.length > 0)
    
    if (cleanNumbers.length === 0) {
      return NextResponse.json({ error: 'Invalid container numbers' }, { status: 400 })
    }
    
    const { data, error } = await supabase
      .from('Container')
      .select('containerNumber, position, equipment, size, type, auxCargo, receivedDate')
      .in('containerNumber', cleanNumbers)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 })
    }
    
    const foundMap = new Map()
    data?.forEach((container: any) => {
      foundMap.set(container.containerNumber, container)
    })
    
    const results = cleanNumbers.map((containerNumber: string) => {
      const container = foundMap.get(containerNumber)
      return {
        containerNumber,
        found: !!container,
        container: container || null
      }
    })
    
    return NextResponse.json({ 
      results,
      totalFound: results.filter(r => r.found).length,
      totalSearched: results.length,
      rateLimit: { remaining: rateLimitResult.remaining }
    })
    
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 500 })
  }
}
