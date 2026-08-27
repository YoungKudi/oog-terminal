import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  // Get client IP for rate limiting
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  const { limited, remaining } = rateLimit(ip)
  
  if (limited) {
    return NextResponse.json({ 
      error: 'Too many requests. Please try again later.' 
    }, { status: 429 })
  }
  
  try {
    const { containerNumbers } = await req.json()
    
    if (!containerNumbers || !Array.isArray(containerNumbers) || containerNumbers.length === 0) {
      return NextResponse.json({ error: 'No container numbers provided' }, { status: 400 })
    }
    
    // Limit number of containers per request to prevent abuse
    if (containerNumbers.length > 50) {
      return NextResponse.json({ 
        error: 'Maximum 50 containers per request' 
      }, { status: 400 })
    }
    
    // Clean and validate container numbers
    const cleanNumbers = containerNumbers
      .map((num: string) => num.trim().toUpperCase())
      .filter((num: string) => num.length > 0)
    
    if (cleanNumbers.length === 0) {
      return NextResponse.json({ error: 'Invalid container numbers' }, { status: 400 })
    }
    
    // Query Supabase for all matching containers in the stack
    const { data, error } = await supabase
      .from('Container')
      .select('containerNumber, position, equipment, size, type, auxCargo, receivedDate')
      .in('containerNumber', cleanNumbers)
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    // Create a map of found containers
    const foundMap = new Map()
    data?.forEach((container: any) => {
      foundMap.set(container.containerNumber, container)
    })
    
    // Build results for each requested container
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
      rateLimit: { remaining }
    })
    
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
