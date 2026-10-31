'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import type { ResolvedLink } from '@/platform/lib'
import { resolveLink } from '@/platform/payload/resolveLink'
import { Link } from '@/platform/ui'
import { SearchIcon } from 'lucide-react'

import { isActivePath, isHeaderButtonPath } from '../domain/nav'

interface HeaderNavProps {
  data: HeaderType
  pathname: string
  mobile?: boolean
  onNavigate?: () => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, pathname, mobile, onNavigate }) => {
  const links = (data?.navItems || [])
    .map(({ link }) => resolveLink(link))
    .filter((link): link is ResolvedLink => link !== null && !isHeaderButtonPath(link.href))
  const size = mobile ? 'md' : 'sm'

  return (
    <nav aria-label="Main" className={mobile ? 'flex flex-col gap-1' : 'flex items-center gap-1'}>
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
