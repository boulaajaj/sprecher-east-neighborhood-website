'use client'

import { usePathname } from 'next/navigation'
import React from 'react'

import { Button, Link } from '@/platform/ui'

import { ACCOUNT_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from '../domain/paths'
import { useAccount } from './AccountProvider.client'

/**
 * The header's account links: "Log In" and "Sign Up" for a visitor (#296); the account's name
 * and "Sign Out" when signed in. `bar` is the desktop header, `drawer` the mobile menu.
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
      <>
        <Link
          href={SIGN_IN_PATH}
          variant="nav"
          size={bar ? 'sm' : undefined}
          current={pathname === SIGN_IN_PATH}
        >
          Log In
        </Link>
        {/* Outlined in the bar, so it stands out without competing with the Contact button */}
        {bar ? (
          <Button
            href={SIGN_UP_PATH}
            variant="secondary"
            size="sm"
            aria-current={pathname === SIGN_UP_PATH ? 'page' : undefined}
            className="ml-2"
          >
            Sign Up
          </Button>
        ) : (
          <Link href={SIGN_UP_PATH} variant="nav" current={pathname === SIGN_UP_PATH}>
            Sign Up
          </Link>
        )}
      </>
    )
  }

  const label = account.name || 'Account'
  return bar ? (
    <>
      {/* A long name is cut short so the bar never overflows; the full name is the title */}
      <Link
        href={ACCOUNT_PATH}
        variant="nav"
        size="sm"
        current={pathname === ACCOUNT_PATH}
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
      <Link href={ACCOUNT_PATH} variant="nav" current={pathname === ACCOUNT_PATH}>
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
