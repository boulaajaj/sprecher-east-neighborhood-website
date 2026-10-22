'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import React, { type ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import type { Header } from '@/payload-types'

import { Button } from '@/platform/ui'
import { Menu, X } from 'lucide-react'
import { Logo } from './Logo'
import { HeaderNav } from './HeaderNav.client'

interface SiteHeaderBarProps {
  data: Header
  /** The account links in the desktop bar */
  accountMenu: ReactNode
  /** The account links in the mobile menu */
  mobileAccountMenu: ReactNode
}

export const SiteHeaderBar: React.FC<SiteHeaderBarProps> = ({
  data,
  accountMenu,
  mobileAccountMenu,
}) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()
  const toggleRef = useRef<HTMLButtonElement>(null)

  const closeMobileMenu = useCallback((restoreFocus = false) => {
    setMobileOpen(false)
    if (restoreFocus) toggleRef.current?.focus()
  }, [])

  const closeOnLinkOrButton = useCallback(
    (event: React.MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a, button')) closeMobileMenu()
    },
    [closeMobileMenu],
  )

  useEffect(() => {
    setHeaderTheme(null)
    setMobileOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme !== theme) setTheme(headerTheme ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Escape closes the mobile menu and returns focus to the toggle
  useEffect(() => {
    if (!mobileOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileMenu(true)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [mobileOpen, closeMobileMenu])

  // Close the mobile menu if the viewport grows past the desktop breakpoint (e.g. a tablet
  // rotated with the menu open): its close button hides there, and the scroll lock would stay
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 64rem)') // Tailwind's lg, in rem so it tracks font size
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setMobileOpen(false)
    }
    desktop.addEventListener('change', onChange)
    return () => desktop.removeEventListener('change', onChange)
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
      className={`sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-200 ${
        scrolled ? 'shadow-md' : 'shadow-sm'
      }`}
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="container flex items-center justify-between py-4">
        <NextLink href="/" className="shrink-0">
          <Logo loading="eager" priority="high" />
        </NextLink>

        {/* Desktop nav */}
        {/* Desktop nav starts at lg: below 1024px the items don't fit and the page scrolls sideways */}
        <div className="hidden items-center gap-1 lg:flex">
          <HeaderNav data={data} pathname={pathname} />
          {accountMenu}
          <Button
            href="/contact"
            size="sm"
            aria-current={pathname === '/contact' ? 'page' : undefined}
            className="ml-3"
          >
            Contact
          </Button>
        </div>

        {/* Mobile hamburger */}
        <Button
          ref={toggleRef}
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          {mobileOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </Button>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="max-h-[calc(100dvh-var(--header-height))] overflow-y-auto border-t border-border bg-background lg:hidden"
        >
          <div className="container flex flex-col gap-2 py-4">
            <HeaderNav
              data={data}
              pathname={pathname}
              mobile
              onNavigate={() => closeMobileMenu()}
            />
            {/* Following a link or signing out in the account links closes the menu too */}
            <div className="contents" onClick={closeOnLinkOrButton}>
              {mobileAccountMenu}
            </div>
            <Button
              href="/contact"
              fullWidth
              onClick={() => closeMobileMenu()}
              aria-current={pathname === '/contact' ? 'page' : undefined}
              className="mt-2"
            >
              Contact
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
