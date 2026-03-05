import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'
import React from 'react'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'

export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-surface" data-theme="dark">
      <div className="container py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          {/* Brand column */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Logo className="text-2xl" />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Connecting neighbors on Madison&apos;s Far East Side.
            </p>
          </div>

          {/* Quick links column */}
          <div>
            <h3 className="mb-5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Quick Links
            </h3>
            <nav className="flex flex-col gap-3">
              {navItems.map(({ link }, i) => {
                return (
                  <CMSLink
                    key={i}
                    {...link}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  />
                )
              })}
            </nav>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="mb-5 text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Get in Touch
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Sprecher East Neighborhood</p>
              <p>Madison, WI</p>
              <Link
                href="/contact"
                className="inline-block font-medium text-primary transition-colors hover:text-foreground"
              >
                Contact us
              </Link>
            </div>
          </div>
        </div>

        {/* Disclaimer + copyright */}
        <div className="mt-12 border-t border-border pt-8">
          <p className="mb-2 text-xs leading-relaxed text-muted-foreground">
            Sprecher East is an unofficial grassroots neighborhood initiative. This website was
            built with AI assistance.
          </p>
          <p className="text-xs text-muted-foreground/70">&copy; {currentYear} Sprecher East</p>
        </div>
      </div>
    </footer>
  )
}
