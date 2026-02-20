import Link from 'next/link'

const PAGES = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/news', label: 'News' },
  { href: '/contact', label: 'Contact' },
]

const ASSOCIATION = [
  { href: '/association', label: 'Mission & Purpose' },
  { href: '/association#board', label: 'Board of Directors' },
  { href: '/association#bylaws', label: 'Bylaws' },
  { href: '/get-involved', label: 'Membership' },
]

const RESOURCES = [
  { href: '/resources#elected-officials', label: 'Elected Officials' },
  { href: '/resources#public-safety', label: 'Public Safety' },
  { href: '/resources#childcare', label: 'Childcare' },
  { href: '/resources#renting', label: 'Renting' },
  { href: 'https://www.sprechereast.org/', label: 'Neighbor Forum', external: true },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-white/80 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="text-white font-bold text-lg leading-tight mb-1">Sprecher East</div>
            <div className="text-white/60 text-sm mb-4">
              Neighborhood Association · Madison, Wisconsin
            </div>
            <div className="text-sm text-white/50">🏡 Established 2006</div>
            <div className="mt-6">
              <a
                href="https://www.sprechereast.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 hover:text-white transition-colors underline"
              >
                Visit Neighbor Forum →
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
              Pages
            </div>
            <ul className="flex flex-col gap-2.5">
              {PAGES.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Association */}
          <div>
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
              Association
            </div>
            <ul className="flex flex-col gap-2.5">
              {ASSOCIATION.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">
              Resources
            </div>
            <ul className="flex flex-col gap-2.5">
              {RESOURCES.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {year} Sprecher East Neighborhood Association
          </p>
          <div className="flex items-center gap-6">
            <Link href="/association#bylaws" className="text-sm text-white/40 hover:text-white/70 transition-colors">
              Bylaws
            </Link>
            <Link href="/contact" className="text-sm text-white/40 hover:text-white/70 transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
