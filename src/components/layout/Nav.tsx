'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { UserMenu } from './UserMenu'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/news', label: 'News' },
  { href: '/resources', label: 'Resources' },
  { href: '/get-involved', label: 'Get Involved' },
] as const

function isActive(pathname: string, href: string): boolean {
  return href === '/' ? pathname === '/' : pathname.startsWith(href)
}

export default function Nav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      {/* ── Desktop + Mobile nav bar ── */}
      <nav className="fixed inset-x-0 top-0 z-40 border-b border-border bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="group flex flex-col leading-none">
              <span className="text-base font-bold text-primary transition-colors group-hover:text-primary-dark">
                Sprecher East
              </span>
              <span className="text-xs text-muted">Neighborhood Association</span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden items-center gap-0.5 md:flex">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(pathname, link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted hover:bg-surface hover:text-foreground'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="ml-2">
                <Link
                  href="/contact"
                  className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    isActive(pathname, '/contact')
                      ? 'bg-primary-dark text-white'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  Contact
                </Link>
              </li>
            </ul>

            {/* Auth widget — desktop */}
            <div className="ml-2 hidden items-center md:flex">
              <UserMenu />
            </div>

            {/* Mobile toggle */}
            <button
              className="rounded-lg p-2 text-muted transition-colors hover:bg-surface md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu overlay ── */}
      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="absolute top-0 right-0 bottom-0 flex w-72 flex-col bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <div className="font-bold text-primary">Sprecher East</div>
                <div className="text-xs text-muted">Neighborhood Association</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 text-muted transition-colors hover:bg-surface"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <ul className="flex flex-col gap-1">
                {[...NAV_LINKS, { href: '/contact', label: 'Contact' }].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center rounded-lg px-4 py-3 font-medium transition-colors ${
                        isActive(pathname, link.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-surface'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Footer: auth + CTA */}
            <div className="flex flex-col gap-3 border-t border-border p-4">
              <div className="flex items-center justify-center">
                <UserMenu />
              </div>
              <Link
                href="/get-involved"
                className="flex w-full items-center justify-center rounded-lg bg-primary py-3 font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Join the Association
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Spacer so content doesn't hide behind fixed nav */}
      <div className="h-16" aria-hidden="true" />
    </>
  )
}
