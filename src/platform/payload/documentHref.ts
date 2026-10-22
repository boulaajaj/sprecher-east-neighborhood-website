/** The page whose slug is `home` is the site's front page, served at `/`. */
export const HOME_PAGE_SLUG = 'home'

/**
 * Where a CMS document lives on the site: pages at the root (the home page at `/`), every other
 * collection under its own path. The one place that rule is written.
 */
export function documentHref(relationTo: string, slug: string): string {
  if (relationTo !== 'pages') return `/${relationTo}/${slug}`
  return slug === HOME_PAGE_SLUG ? '/' : `/${slug}`
}
