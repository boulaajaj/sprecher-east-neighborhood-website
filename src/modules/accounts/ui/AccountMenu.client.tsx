'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

import { Button, Link } from '@/platform/ui'

import { useAccount } from './AccountProvider.client'

/**
 * The header's account links: "Log In" for a visitor; the account's name and "Sign Out" when
 * signed in. `bar` is the desktop header, `drawer` the mobile menu.
 */
export function AccountMenu({ variant }: { variant: 'bar' | 'drawer' }) {
  const { account, loading, signOut } = useAccount()
  const pathname = usePathname()
  const bar = variant === 'bar'

  if (loading) {
    return bar ? <div className="h-9 w-16 animate-pulse rounded-md bg-border" /> : null
  }

  if (!account) {
    return (
      <Link
        href="/login"
        variant="nav"
        size={bar ? 'sm' : undefined}
        current={pathname === '/login'}
      >
        Log In
      </Link>
    )
  }

  const label = account.name || 'Account'
  return bar ? (
    <>
      {/* A long name is cut short so the bar never overflows; the full name is the title */}
      <Link
        href="/account"
        variant="nav"
        size="sm"
        current={pathname === '/account'}
        title={account.name || undefined}
        className="max-w-40"
      >
        <span className="truncate">{label}</span>
      </Link>
      <Button variant="ghost" size="sm" onClick={signOut}>
        Sign Out
      </Button>
    </>
  ) : (
    <>
      <Link href="/account" variant="nav" current={pathname === '/account'}>
        {label}
      </Link>
      <Button
        variant="ghost"
        fullWidth
        onClick={signOut}
        className="justify-start rounded-md px-3 font-medium hover:bg-secondary hover:text-primary"
      >
        Sign Out
      </Button>
    </>
  )
}
