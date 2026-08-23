import { useSession, signIn, signOut } from 'next-auth/react'

export function useAuth() {
  const { data: session, status } = useSession()
  
  return {
    user: session?.user || null,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    login: signIn,
    logout: () => signOut({ callbackUrl: '/login' })
  }
}
