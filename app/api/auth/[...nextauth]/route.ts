import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getSupabase } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { logAudit, getClientInfo } from '@/lib/audit'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        workerId: { label: 'Worker ID', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        const supabase = getSupabase()
        if (!supabase) {
          console.error('❌ Supabase not configured')
          return null
        }

        if (!credentials?.workerId || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        try {
          console.log('🔍 Looking for user:', credentials.workerId.toUpperCase().trim())

          const { data: users, error } = await supabase
            .from('User')
            .select('*')
            .eq('userId', credentials.workerId.toUpperCase().trim())

          if (error) {
            console.error('❌ Supabase error:', error.message)
            return null
          }

          if (!users || users.length === 0) {
            console.log('❌ No user found with ID:', credentials.workerId)
            const clientInfo = getClientInfo(req)
            await logAudit({
              action: 'LOGIN_FAILED',
              details: { workerId: credentials.workerId, reason: 'User not found' },
              ipAddress: clientInfo.ipAddress,
              userAgent: clientInfo.userAgent
            })
            return null
          }

          const user = users[0]
          console.log('👤 User found:', user.userId)

          if (!user.password) {
            console.log('❌ User has no password')
            return null
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)
          console.log('🔐 Password valid:', isValid)

          if (!isValid) {
            const clientInfo = getClientInfo(req)
            await logAudit({
              action: 'LOGIN_FAILED',
              details: { workerId: credentials.workerId, reason: 'Invalid password' },
              ipAddress: clientInfo.ipAddress,
              userAgent: clientInfo.userAgent
            })
            return null
          }

          // Log successful login
          const clientInfo = getClientInfo(req)
          await logAudit({
            action: 'LOGIN_SUCCESS',
            userId: user.id,
            details: { workerId: user.userId, role: user.role },
            ipAddress: clientInfo.ipAddress,
            userAgent: clientInfo.userAgent
          })

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            userId: user.userId,
            phone: user.phone,
            role: user.role || 'user'
          }
        } catch (error: any) {
          console.error('❌ Auth error:', error.message)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: parseInt(process.env.SESSION_TIMEOUT_MINUTES || '30') * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.userId = user.userId
        token.name = user.name
        token.email = user.email
        token.phone = user.phone
        token.iat = Math.floor(Date.now() / 1000)
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.userId = token.userId as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.phone = token.phone as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
