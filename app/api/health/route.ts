import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    const { error } = await supabase
      .from('User')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json({ 
        status: 'unhealthy', 
        error: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy', 
      error: String(error)
    }, { status: 500 })
  }
}
