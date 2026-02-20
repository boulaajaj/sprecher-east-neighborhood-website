import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

// This layout wraps all public-facing pages.
// The /studio route bypasses this and gets its own full-page layout.

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Nav />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
