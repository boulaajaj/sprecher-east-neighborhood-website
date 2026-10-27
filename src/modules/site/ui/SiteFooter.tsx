import NextLink from 'next/link'
import React from 'react'
import { MapPin, Mail } from 'lucide-react'

import { resolveLink } from '@/platform/payload/resolveLink'
import { Link } from '@/platform/ui'
import { MetaList } from '@/platform/ui/MetaList'
import { Text } from '@/platform/ui/Text'

import { getFooterNav } from '../use-cases/getFooterNav'
import { Logo } from './Logo'

export async function SiteFooter() {
  const footerData = await getFooterNav()

  const navItems = footerData?.navItems || []
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border bg-surface" data-theme="dark">
      <div className="container py-14 md:py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          {/* Brand column */}
          <div className="space-y-4">
            <NextLink href="/" className="inline-block">
              <Logo className="text-2xl" />
            </NextLink>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              Connecting neighbors on Madison&apos;s Far East Side.
            </p>
          </div>

          {/* Quick links column */}
          <div>
            <Text variant="label" as="h3" className="mb-5">
              Quick Links
            </Text>
            <nav aria-label="Footer" className="flex flex-col gap-3">
              {navItems.map(({ link }, i) => {
                const resolved = resolveLink(link)
                if (!resolved) return null
                return (
                  <Link
                    key={i}
                    href={resolved.href}
                    external={resolved.external}
                    variant="muted"
                    className="self-start"
                  >
                    {resolved.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Contact column */}
          <div>
            <Text variant="label" as="h3" className="mb-5">
              Get in Touch
            </Text>
            <MetaList
              className="text-sm text-muted-foreground"
              items={[
                { icon: <MapPin className="text-primary" />, value: 'Madison, WI' },
                {
                  icon: <Mail className="text-primary" />,
                  value: (
                    <Link href="/contact" variant="muted" className="font-medium">
                      Contact us
                    </Link>
                  ),
                },
              ]}
            />
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
