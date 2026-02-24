import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Protect /admin — Payload handles its own auth redirect internally.
  // Protect /profile — requires Better Auth session cookie.
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/profile')) {
    const sessionCookie =
      request.cookies.get('better-auth.session_token') ??
      request.cookies.get('__Secure-better-auth.session_token')

    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/profile/:path*'],
}
