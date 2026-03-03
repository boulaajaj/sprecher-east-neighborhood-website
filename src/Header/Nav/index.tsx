'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

interface HeaderNavProps {
  data: HeaderType
  mobile?: boolean
  onNavigate?: () => void
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ data, mobile, onNavigate }) => {
  const navItems = data?.navItems || []

  if (mobile) {
    return (
      <nav className="flex flex-col gap-1">
        {navItems.map(({ link }, i) => {
          return (
            <div key={i} onClick={onNavigate}>
              <CMSLink
                {...link}
                appearance="link"
                className="block w-full rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
              />
            </div>
          )
        })}
        <div onClick={onNavigate}>
          <Link
            href="/search"
            className="flex items-center gap-2 rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
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
        return (
          <CMSLink
            key={i}
            {...link}
            appearance="link"
            className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
          />
        )
      })}
      <Link
        href="/search"
        className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
      >
        <span className="sr-only">Search</span>
        <SearchIcon className="h-5 w-5" />
      </Link>
    </nav>
  )
}
