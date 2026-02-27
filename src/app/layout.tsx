import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

// Next.js downloads and self-hosts Poppins at build time — no Google CDN at runtime
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s — Sprecher East',
    default: 'Sprecher East Neighborhood Association',
  },
  description:
    "Connecting neighbors on Madison's Far East Side since 2006. Your Sprecher East Neighborhood Association — community events, news, and resources.",
  openGraph: {
    siteName: 'Sprecher East Neighborhood Association',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
