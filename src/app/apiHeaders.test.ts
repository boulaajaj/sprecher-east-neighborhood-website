import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match'
import { describe, expect, it } from 'vitest'

import { API_HEADERS } from '../../next.config.js'

/** The headers next.config.js adds to a response for this path, matched the way Next matches them. */
const headersFor = (pathname: string) =>
  API_HEADERS.filter(({ source }) => getPathMatch(source)(pathname) !== false).flatMap(
    ({ headers }) => headers,
  )

const NOINDEX = { key: 'X-Robots-Tag', value: 'noindex' }

describe('X-Robots-Tag on API answers (#280)', () => {
  it.each([
    '/api/users',
    '/api/users/me',
    '/api/form-submissions',
    '/api/email-confirmations/confirm',
    '/api/posts',
    '/api/media',
    '/api/version',
    '/api/graphql',
  ])('asks search engines not to index %s', (pathname) => {
    expect(headersFor(pathname)).toEqual([NOINDEX])
  })

  it.each(['/api/media/file/street-fair.jpg', '/api/media/file/street-fair-1200x630.webp'])(
    'leaves the upload %s indexable, for image search',
    (pathname) => {
      expect(headersFor(pathname)).toEqual([])
    },
  )

  it.each(['/', '/events', '/posts/block-party', '/media/file/x.jpg'])(
    'adds nothing to the page %s',
    (pathname) => {
      expect(headersFor(pathname)).toEqual([])
    },
  )
})
