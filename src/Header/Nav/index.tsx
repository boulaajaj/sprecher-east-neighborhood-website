'use client'

import React from 'react'
import { usePathname } from 'next/navigation'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

function resolveHref(link: NonNullable<HeaderType['navItems']>[number]['link']): string {
  if (link.type === 'custom' && link.url) return link.url
  if (link.type === 'reference' && link.reference && typeof link.reference.value === 'object') {
    const slug = (link.reference.value as { slug?: string }).slug
    if (slug) return slug === 'home' ? '/' : `/${slug}`
  }
  return ''
}

interface HeaderNavProps {
  data: HeaderType
  mobile?: boolean
  onNavigate?: () => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, mobile, onNavigate }) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()

  if (mobile) {
    return (
      <nav className="flex flex-col gap-1">
        {navItems.map(({ link }, i) => {
          const href = resolveHref(link)
          const isActive = href && (pathname === href || pathname.startsWith(href + '/'))

          return (
            <div key={i} onClick={onNavigate}>
              <CMSLink
                {...link}
                appearance="link"
                className={`block w-full rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-secondary hover:text-primary ${isActive ? 'bg-secondary text-primary' : 'text-foreground'}`}
              />
            </div>
          )
        })}
        <div onClick={onNavigate}>
          <Link
            href="/search"
            className={`flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium transition-colors hover:bg-secondary hover:text-primary ${pathname === '/search' ? 'bg-secondary text-primary' : 'text-foreground'}`}
          >
            <SearchIcon className="h-5 w-5" />
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
        const isActive = href && (pathname === href || pathname.startsWith(href + '/'))

        return (
          <CMSLink
            key={i}
            {...link}
            appearance="link"
            className={`relative rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-primary ${isActive ? 'text-primary' : 'text-foreground'}`}
          />
        )
      })}
      <Link
        href="/search"
        className={`rounded-md p-2 transition-colors hover:bg-secondary hover:text-primary ${pathname === '/search' ? 'text-primary' : 'text-muted-foreground'}`}
      >
        <span className="sr-only">Search</span>
        <SearchIcon className="h-5 w-5" />
      </Link>
    </nav>
  )
}
