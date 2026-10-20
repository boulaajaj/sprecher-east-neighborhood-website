import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { config, isValidPagingPath, middleware } from './middleware'

describe('isValidPagingPath', () => {
  it.each(['/posts/page/1', '/posts/page/500', '/events/list/upcoming/2', '/events/list/past/1'])(
    'lets %s through',
    (path) => {
      expect(isValidPagingPath(path)).toBe(true)
    },
  )

  it.each([
    '/posts/page/zz',
    '/posts/page/0',
    '/posts/page/02',
    '/posts/page/501',
    '/posts/page',
    '/posts/page/2/extra',
    '/events/list/x1/1',
    '/events/list/upcoming/zz',
    '/events/list/upcoming',
    '/events/list/past/1/extra',
  ])('rejects %s', (path) => {
    expect(isValidPagingPath(path)).toBe(false)
  })

  it('leaves other routes alone', () => {
    expect(isValidPagingPath('/posts/some-post')).toBe(true)
    expect(isValidPagingPath('/events')).toBe(true)
  })
})

describe('middleware', () => {
  it('answers 404 without rendering for a junk paging URL', () => {
    const response = middleware(new NextRequest('https://sprechereast.example/posts/page/zz'))
    expect(response.status).toBe(404)
  })

  it('passes a valid paging URL on to the page', () => {
    const response = middleware(new NextRequest('https://sprechereast.example/posts/page/2'))
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('only runs on the two paging routes', () => {
    expect(config.matcher).toEqual(['/posts/page/:path*', '/events/list/:path*'])
  })
})
