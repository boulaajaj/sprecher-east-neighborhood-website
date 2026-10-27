import { describe, expect, it } from 'vitest'

import { FORUM_DEFAULT_URL, FORUM_URL_PROBLEM, toForumUrl, validateForumUrl } from './forum'

describe('toForumUrl', () => {
  it.each([
    FORUM_DEFAULT_URL,
    'https://discourse.sprechereast.org/',
    'https://forum.example.org/c/news/5',
    'HTTPS://FORUM.EXAMPLE.ORG',
  ])('links to %s', (value) => {
    expect(toForumUrl(value)).toBe(value)
  })

  it('trims spaces around the address', () => {
    expect(toForumUrl(`  ${FORUM_DEFAULT_URL}  `)).toBe(FORUM_DEFAULT_URL)
  })

  it.each([
    null,
    undefined,
    42,
    '',
    '   ',
    'http://forum.example.org',
    'javascript:alert(1)',
    'data:text/html,hi',
    '//forum.example.org',
    '/forum',
    'forum.example.org',
    'https://',
    'https://forum.example.org/a b',
    'https://forum.\texample.org',
    'https://forum.exam\nple.org',
    'mailto:forum@example.org',
  ])('draws no link for %j', (value) => {
    expect(toForumUrl(value)).toBeNull()
  })
})

describe('validateForumUrl', () => {
  it.each([null, undefined, ''])('allows %j, which hides the links', (value) => {
    expect(validateForumUrl(value)).toBe(true)
  })

  it('allows an https address', () => {
    expect(validateForumUrl(FORUM_DEFAULT_URL)).toBe(true)
  })

  it.each(['http://forum.example.org', 'javascript:alert(1)', 'forum.example.org'])(
    'refuses %s with a message editors can act on',
    (value) => {
      expect(validateForumUrl(value)).toBe(FORUM_URL_PROBLEM)
    },
  )
})
