import { NextResponse, type NextRequest } from 'next/server'

import { FORGOT_PASSWORD_PATH } from '@/modules/accounts'
import { isEventScope } from '@/modules/events'
import { parsePageNumber } from '@/platform/lib'

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

/**
 * The admin panel's "Forgot password?" page (Payload's `admin.routes.forgot`). Payload's own
 * forgot-password endpoint is closed (#282), so the page couldn't send anything.
 */
export const ADMIN_FORGOT_PATH = '/admin/forgot'

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl
  // The site's page sends the same reset email, after the robot check and the limits
  if (pathname === ADMIN_FORGOT_PATH) {
    return NextResponse.redirect(new URL(FORGOT_PASSWORD_PATH, request.url))
  }
  if (isValidPagingPath(pathname)) return NextResponse.next()
  return new NextResponse('Not found', { status: 404 })
}

// `:path+` needs at least one segment after the prefix, so slug pages like `/posts/page` never
// reach the proxy.
export const config = {
  matcher: ['/posts/page/:path+', '/events/list/:path+', '/admin/forgot'],
}
