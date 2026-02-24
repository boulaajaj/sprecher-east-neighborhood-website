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
  useEffect(() => { setOpen(false) }, [pathname])

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* ── Desktop + Mobile nav bar ── */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex flex-col leading-none group">
              <span className="text-base font-bold text-primary group-hover:text-primary-dark transition-colors">
                Sprecher East
              </span>
              <span className="text-xs text-muted">Neighborhood Association</span>
            </Link>

            {/* Desktop links */}
            <ul className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(pathname, link.href)
                        ? 'text-primary bg-primary/10'
                        : 'text-muted hover:text-foreground hover:bg-surface'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="ml-2">
                <Link
                  href="/contact"
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
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
            <div className="hidden md:flex items-center ml-2">
              <UserMenu />
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 rounded-lg text-muted hover:bg-surface transition-colors"
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={open}
              aria-controls="mobile-nav"
            >
              <Menu className="w-5 h-5" />
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
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <div className="font-bold text-primary">Sprecher East</div>
                <div className="text-xs text-muted">Neighborhood Association</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg text-muted hover:bg-surface transition-colors"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Links */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <ul className="flex flex-col gap-1">
                {[...NAV_LINKS, { href: '/contact', label: 'Contact' }].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
                        isActive(pathname, link.href)
                          ? 'text-primary bg-primary/10'
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
            <div className="p-4 border-t border-border flex flex-col gap-3">
              <div className="flex items-center justify-center">
                <UserMenu />
              </div>
              <Link
                href="/get-involved"
                className="flex justify-center items-center w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors"
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
