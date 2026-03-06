import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { Poppins } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { JsonLd } from '@/components/JsonLd'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { Providers } from '@/providers'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { organizationJsonLd } from '@/utilities/structuredData'
import { VersionCheck } from '@/components/VersionCheck'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html className={cn(poppins.variable)} lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <JsonLd data={organizationJsonLd()} />
      </head>
      <body>
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:outline-none"
          >
            Skip to content
          </a>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <VersionCheck />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: {
    template: '%s — Sprecher East',
    default: 'Sprecher East — Neighborhood Association',
  },
  description:
    "Connecting neighbors on Madison's Far East Side. Community events, local news, and resources for the Sprecher East neighborhood.",
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
