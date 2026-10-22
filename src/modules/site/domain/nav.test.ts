import { describe, expect, it } from 'vitest'

import { isActivePath, isHeaderButtonPath, toPathname } from './nav'

describe('toPathname', () => {
  it('drops the query, the fragment and trailing slashes', () => {
    expect(toPathname('/events/?scope=past#top')).toBe('/events')
    expect(toPathname('/about//')).toBe('/about')
  })

  it('keeps the root as it is', () => {
    expect(toPathname('/')).toBe('/')
    expect(toPathname('/?q=1')).toBe('/')
  })

  it('is empty for an address that is only a query or a fragment', () => {
    expect(toPathname('?q=1')).toBe('')
    expect(toPathname('#top')).toBe('')
  })
})

describe('isActivePath', () => {
  it('marks the link to the current page', () => {
    expect(isActivePath('/events', '/events')).toBe(true)
    expect(isActivePath('/events/', '/events?scope=past')).toBe(true)
  })

  it('marks a section link on the pages inside it', () => {
    expect(isActivePath('/posts/park-cleanup', '/posts')).toBe(true)
  })

  it('does not mark a link whose path only starts the same way', () => {
    expect(isActivePath('/postsarchive', '/posts')).toBe(false)
  })

  it('marks the home link on the home page only', () => {
    expect(isActivePath('/', '/')).toBe(true)
    expect(isActivePath('/events', '/')).toBe(false)
  })

  it('never marks an outside link or one with no path', () => {
    expect(isActivePath('/events', 'https://example.org/events')).toBe(false)
    expect(isActivePath('/events', '#top')).toBe(false)
  })
})

describe('isHeaderButtonPath', () => {
  it('is true for the contact page, which the header shows as a button', () => {
    expect(isHeaderButtonPath('/contact')).toBe(true)
    expect(isHeaderButtonPath('/contact/?from=nav')).toBe(true)
  })

  it('is false for other pages', () => {
    expect(isHeaderButtonPath('/contact-us')).toBe(false)
    expect(isHeaderButtonPath('/events')).toBe(false)
  })
})
