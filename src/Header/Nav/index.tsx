'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { type ResolvedLink, resolveLink } from '@/platform/payload/resolveLink'
import { Link } from '@/platform/ui'
import { SearchIcon } from 'lucide-react'

function normalizePath(value: string): string {
  const [pathOnly] = value.split(/[?#]/)
  if (!pathOnly) return ''
  if (pathOnly === '/') return '/'
  return pathOnly.replace(/\/+$/, '')
}

function isActivePath(pathname: string, href: string): boolean {
  const current = normalizePath(pathname)
  const target = normalizePath(href)
  if (!target || !target.startsWith('/')) return false
  return current === target || (target !== '/' && current.startsWith(target + '/'))
}

// The header always shows a Contact button, so a CMS "Contact" nav item would appear twice.
const CTA_PATHS = new Set(['/contact'])

interface HeaderNavProps {
  data: HeaderType
  pathname: string
  mobile?: boolean
  onNavigate?: () => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, pathname, mobile, onNavigate }) => {
  const links = (data?.navItems || [])
    .map(({ link }) => resolveLink(link))
    .filter(
      (link): link is ResolvedLink => link !== null && !CTA_PATHS.has(normalizePath(link.href)),
    )
  const size = mobile ? 'md' : 'sm'

  return (
    <nav className={mobile ? 'flex flex-col gap-1' : 'flex items-center gap-1'}>
      {links.map((link, i) => (
        <Link
          key={i}
          href={link.href}
          external={link.external}
          variant="nav"
          size={size}
          current={isActivePath(pathname, link.href)}
          onClick={onNavigate}
        >
          {link.label}
        </Link>
      ))}
      <Link
        href="/search"
        variant="nav"
        size={size}
        current={isActivePath(pathname, '/search')}
        icon={<SearchIcon aria-hidden="true" />}
        // In the desktop bar only the magnifier shows, muted until it's the current page
        iconOnly={!mobile}
        className={mobile ? undefined : 'text-muted-foreground'}
        onClick={onNavigate}
      >
        Search
      </Link>
    </nav>
  )
}
