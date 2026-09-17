import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public routes - no authentication required
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/api/public-search',
    '/api/auth',
    '/auth/reset-password',
    '/auth/update-password'
  ]

  const isPublicRoute = publicRoutes.some(route => 
    path === route || 
    path.startsWith(route + '/') ||
    path.startsWith('/_next') || 
    path.startsWith('/favicon.ico')
  )

  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('next-auth.session-token') || 
                        request.cookies.get('__Secure-next-auth.session-token')

  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', path)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
