'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import { Logo } from '@/components/Logo/Logo'
import { HeaderNav } from './Nav'
import { useAuth } from '@/hooks/useAuth'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const { user, loading: authLoading, logout } = useAuth()

  useEffect(() => {
    setHeaderTheme(null)
    setMobileOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <header
      className={`sticky top-0 z-50 transition-[background-color,border-color,box-shadow] duration-200 ${
        scrolled
          ? 'border-b border-border bg-background/95 shadow-sm backdrop-blur-sm'
          : 'border-b border-transparent bg-transparent'
      }`}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="shrink-0">
          <Logo loading="eager" priority="high" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <HeaderNav data={data} pathname={pathname} />
          {authLoading ? (
            <div className="h-9 w-16 animate-pulse rounded-md bg-border" />
          ) : user ? (
            <>
              <Link
                href="/account"
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                {user.name || 'Account'}
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
            >
              Log In
            </Link>
          )}
          <Link
            href="/contact"
            className="ml-3 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90"
          >
            Contact
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground transition-colors hover:bg-secondary md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="container flex flex-col gap-2 py-4">
            <HeaderNav
              data={data}
              pathname={pathname}
              mobile
              onNavigate={() => setMobileOpen(false)}
            />
            {!authLoading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileOpen(false)}
                      className="block w-full rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
                    >
                      {user.name || 'Account'}
                    </Link>
                    <Button
                      variant="ghost"
                      size="clear"
                      onClick={() => {
                        setMobileOpen(false)
                        logout()
                      }}
                      className="w-full justify-start rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground"
                    >
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full rounded-md px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-secondary hover:text-primary"
                  >
                    Log In
                  </Link>
                )}
              </>
            )}
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
