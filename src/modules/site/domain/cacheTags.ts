// The cache tags of what the site module reads through Next's data cache. Each is written once:
// the read that caches under it and the hook that expires it use the same name.

/** The tag of a cached global (`global_header`, `global_footer`). */
export const globalCacheTag = (slug: 'header' | 'footer'): string => `global_${slug}`

/** The tag of the cached list of redirects. */
export const REDIRECTS_CACHE_TAG = 'redirects'

/** The tag of the cached pages sitemap. */
export const PAGES_SITEMAP_CACHE_TAG = 'pages-sitemap'
