import { NextResponse } from 'next/server'
import { supabase } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { containerIds } = await req.json()

    if (!containerIds || !Array.isArray(containerIds) || containerIds.length === 0) {
      return NextResponse.json({ error: 'No container IDs provided' }, { status: 400 })
    }

    // Delete containers
    const { error } = await supabase
      .from('Container')
      .delete()
      .in('id', containerIds)

    if (error) {
      console.error('Error clearing receivals:', error)
      return NextResponse.json({ error: 'Failed to clear receivals' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in clear-receivals:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
