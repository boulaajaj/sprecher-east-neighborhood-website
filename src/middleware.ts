import { NextResponse, type NextRequest } from 'next/server'

import { isEventScope, parsePageNumber } from '@/utilities/feedParams'

/**
 * Answers 404 for malformed paging URLs (`/posts/page/zz`, `/events/list/x/1`) before Next
 * renders them. The pages would 404 too, but only after caching the result on disk, so a client
 * requesting many junk URLs could grow the page cache without limit (#119). Valid formats are a
 * bounded set (page 1 to 500, two event scopes), so the cache stays bounded on these routes.
 */
export function isValidPagingPath(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean)
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

export function middleware(request: NextRequest): NextResponse {
  if (isValidPagingPath(request.nextUrl.pathname)) return NextResponse.next()
  return new NextResponse('Not found', { status: 404 })
}

export const config = {
  matcher: ['/posts/page/:path*', '/events/list/:path*'],
}
