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
            return null
          }

          const user = users[0]
          console.log('👤 User found:', user.userId)

          // Check if user is approved
          if (user.approved === false) {
            console.log('❌ User not approved:', user.userId)
            const clientInfo = getClientInfo(req)
            await logAudit({
              action: 'LOGIN_FAILED',
              details: { 
                workerId: user.userId, 
                reason: user.rejectionReason ? 'Account denied' : 'Pending approval' 
              },
              ipAddress: clientInfo.ipAddress,
              userAgent: clientInfo.userAgent
            })
            
            // Return specific error message
            if (user.rejectionReason) {
              throw new Error('Account denied')
            } else {
              throw new Error('Pending approval')
            }
          }

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
          // Pass through specific errors
          if (error.message === 'Pending approval' || error.message === 'Account denied') {
            throw error
          }
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
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
