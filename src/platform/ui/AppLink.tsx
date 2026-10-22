import NextLink from 'next/link'
import type { ComponentProps } from 'react'

type AppLinkProps = ComponentProps<typeof NextLink> & { href: string }

/**
 * `next/link` for routes, a plain `<a>` for in-page `#` links. next/link scrolls to a fragment
 * without moving focus, so a skip link through it would leave keyboard users where they were.
 * `Button` and `Link` render through this; nothing else needs it.
 */
export function AppLink(props: AppLinkProps) {
  if (!props.href.startsWith('#')) return <NextLink {...props} />

  // Router-only options mean nothing to the browser; keep them off the <a>
  const {
    prefetch: _prefetch,
    replace: _replace,
    scroll: _scroll,
    shallow: _shallow,
    passHref: _passHref,
    legacyBehavior: _legacyBehavior,
    locale: _locale,
    onNavigate: _onNavigate,
    ...anchor
  } = props
  return <a {...anchor} />
}
