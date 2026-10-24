import { NextResponse, type NextRequest } from 'next/server'

import { FORGOT_PASSWORD_PATH, VERIFY_ACCOUNT_PATH } from '@/modules/accounts'
import { isEventScope } from '@/modules/events'
import { parsePageNumber } from '@/platform/lib'
import { ADMIN_FORGOT_PATH, ADMIN_VERIFY_PREFIX } from '@/platform/payload/adminRoutes'

/**
 * Answers 404 for malformed paging URLs (`/posts/page/zz`, `/events/list/x/1`) before Next
 * renders them. The pages would 404 too, but only after caching the result on disk, so a client
 * requesting many junk URLs could grow the page cache without limit (#119). Valid formats are a
 * bounded set (page 1 to MAX_PAGE, two event scopes), so the cache stays bounded on these routes.
 */
export function isValidPagingPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
  // `/posts/page` and `/events/list` alone are slug pages (a post called "Page"), not paging URLs.
  if (segments.length <= 2) return true
  if (segments[0] === 'posts' && segments[1] === 'page') {
    return segments.length === 3 && parsePageNumber(segments[2]) !== null
  }
  if (segments[0] === 'events' && segments[1] === 'list') {
    return (
      segments.length === 4 && isEventScope(segments[2]) && parsePageNumber(segments[3]) !== null
    )
  }
  return true
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  // The admin panel's "Forgot password?" page can't send anything since Payload's own endpoint
  // was closed (#282); the site's page sends the same email, after the robot check and limits
  if (pathname === ADMIN_FORGOT_PATH) {
    return NextResponse.redirect(new URL(FORGOT_PASSWORD_PATH, request.url))
  }
  // The admin panel's verify page verifies on load, with no button or robot check, and would skip
  // a resent link's password step (#289). The site's page does both (#303): send the token there.
  if (pathname.startsWith(ADMIN_VERIFY_PREFIX)) {
    const target = new URL(VERIFY_ACCOUNT_PATH, request.url)
    // Tokens are hex, so no decoding: a junk escape (`%E0%A4%A`) then can't throw
    target.searchParams.set('token', pathname.slice(ADMIN_VERIFY_PREFIX.length))
    return NextResponse.redirect(target)
  }
  if (isValidPagingPath(pathname)) return NextResponse.next()
  return new NextResponse('Not found', { status: 404 })
}

// `:path+` needs at least one segment after the prefix, so slug pages like `/posts/page` never
// reach the proxy. Next reads the matcher statically, so the admin pages' paths are written out;
// tests check they are still `ADMIN_FORGOT_PATH` (#292) and `ADMIN_VERIFY_PREFIX` (#303).
export const config = {
  matcher: [
    '/posts/page/:path+',
    '/events/list/:path+',
    '/admin/forgot',
    '/admin/users/verify/:path+',
  ],
}
