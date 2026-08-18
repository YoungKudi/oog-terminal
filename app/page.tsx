import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

export default async function Home() {
  const session = await getServerSession(authOptions)
  return session ? redirect('/dashboard') : redirect('/login')
}
// Trigger deployment Mon Aug 17 22:37:41 GMT 2026
// Trigger deployment Tue Aug 18 01:17:11 GMT 2026
