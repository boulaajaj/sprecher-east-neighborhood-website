'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { cn } from '@/utilities/ui'
import { CMSLink } from '@/components/Link'
import { resolveLink } from '@/platform/payload/resolveLink'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

function resolveHref(link: NonNullable<HeaderType['navItems']>[number]['link']): string {
  return resolveLink(link)?.href ?? ''
}

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
  const navItems = (data?.navItems || []).filter(
    ({ link }) => !CTA_PATHS.has(normalizePath(resolveHref(link))),
  )

  if (mobile) {
    return (
      <nav className="flex flex-col gap-1">
        {navItems.map(({ link }, i) => {
          const href = resolveHref(link)
          const active = href && isActivePath(pathname, href)

          return (
            <div key={i} onClick={onNavigate}>
              <CMSLink
                {...link}
                appearance="link"
                ariaCurrent={Boolean(active)}
                className={cn(
                  'block min-h-11 w-full rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-secondary hover:text-primary',
                  active ? 'bg-secondary text-primary' : 'text-foreground',
                )}
              />
            </div>
          )
        })}
        <div onClick={onNavigate}>
          <Link
            href="/search"
            aria-current={isActivePath(pathname, '/search') ? 'page' : undefined}
            className={cn(
              'flex min-h-11 items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-secondary hover:text-primary',
              isActivePath(pathname, '/search') ? 'bg-secondary text-primary' : 'text-foreground',
            )}
          >
            <SearchIcon aria-hidden="true" className="h-5 w-5" />
            Search
          </Link>
        </div>
      </nav>
    )
  }

  return (
    <nav className="flex items-center gap-1">
      {navItems.map(({ link }, i) => {
        const href = resolveHref(link)
        const active = href && isActivePath(pathname, href)

        return (
          <CMSLink
            key={i}
            {...link}
            appearance="link"
            ariaCurrent={Boolean(active)}
            className={cn(
              'relative rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors hover:bg-secondary hover:text-primary',
              active ? 'text-primary' : 'text-foreground',
            )}
          />
        )
      })}
      <Link
        href="/search"
        aria-current={isActivePath(pathname, '/search') ? 'page' : undefined}
        className={cn(
          'rounded-md p-2 transition-colors hover:bg-secondary hover:text-primary',
          isActivePath(pathname, '/search') ? 'text-primary' : 'text-muted-foreground',
        )}
      >
        <span className="sr-only">Search</span>
        <SearchIcon aria-hidden="true" className="h-5 w-5" />
      </Link>
    </nav>
  )
}
