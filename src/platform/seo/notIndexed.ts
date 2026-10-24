import type { Metadata } from 'next'

/**
 * The `robots` metadata of a page that stays out of search results: sign-in, sign-up, password
 * recovery, account management and confirmation links (the owner's decision on #280). It only
 * keeps the page out of results; access control protects the data. robots.txt must not block
 * these pages, or crawlers never read the rule.
 */
export const NOT_INDEXED = { index: false, follow: false } as const satisfies Metadata['robots']
