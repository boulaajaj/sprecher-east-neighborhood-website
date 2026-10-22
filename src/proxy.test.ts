import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { NextRequest } from 'next/server'
import { describe, expect, it } from 'vitest'

import { MAX_PAGE } from '@/utilities/feedParams'

import { config, isValidPagingPath, proxy } from './proxy'

describe('isValidPagingPath', () => {
  it.each([
    '/posts/page/1',
    `/posts/page/${MAX_PAGE}`,
    '/events/list/upcoming/2',
    '/events/list/past/1',
  ])('lets %s through', (path) => {
    expect(isValidPagingPath(path)).toBe(true)
  })

  it.each([
    '/posts/page/zz',
    '/posts/page/0',
    '/posts/page/02',
    `/posts/page/${MAX_PAGE + 1}`,
    '/posts/page/2/extra',
    '/events/list/x1/1',
    '/events/list/upcoming/zz',
    '/events/list/upcoming',
    '/events/list/past/1/extra',
  ])('rejects %s', (path) => {
    expect(isValidPagingPath(path)).toBe(false)
  })

  it('leaves slug pages and other routes alone', () => {
    // A post titled "Page" has the slug `page`; an event titled "List", `list`.
    expect(isValidPagingPath('/posts/page')).toBe(true)
    expect(isValidPagingPath('/events/list')).toBe(true)
    expect(isValidPagingPath('/posts/some-post')).toBe(true)
    expect(isValidPagingPath('/events')).toBe(true)
  })
})

describe('proxy', () => {
  it('answers 404 without rendering for a junk paging URL', () => {
    const response = proxy(new NextRequest('https://sprechereast.example/posts/page/zz'))
    expect(response.status).toBe(404)
  })

  it('passes a valid paging URL on to the page', () => {
    const response = proxy(new NextRequest('https://sprechereast.example/posts/page/2'))
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })
})

describe('matcher', () => {
  const runsOn = (path: string) =>
    unstable_doesMiddlewareMatch({ config, url: `https://sprechereast.example${path}` })

  it.each(['/posts/page/2', '/posts/page/zz', '/events/list/upcoming/1', '/events/list/x1/1'])(
    'runs on %s',
    (path) => {
      expect(runsOn(path)).toBe(true)
    },
  )

  it.each(['/posts/page', '/events/list', '/posts/some-post', '/events', '/'])(
    'does not run on %s',
    (path) => {
      expect(runsOn(path)).toBe(false)
    },
  )
})
