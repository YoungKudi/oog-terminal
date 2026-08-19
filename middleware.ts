import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // If not authenticated and trying to access protected routes
    if (!token && path.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // If authenticated and trying to access auth pages
    if (token && (path === '/login' || path === '/signup')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Allow public routes
        const publicPaths = ['/login', '/signup', '/api/auth', '/_next', '/favicon.ico']
        const path = token?.path || ''
        if (publicPaths.some(p => path.startsWith(p))) return true
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/api/auth/:path*'
  ]
}
