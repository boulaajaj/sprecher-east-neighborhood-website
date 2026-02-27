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
    <footer className="mt-auto bg-foreground text-white/80">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {/* Grid */}
        <div className="mb-10 grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-1 text-lg leading-tight font-bold text-white">Sprecher East</div>
            <div className="mb-4 text-sm text-white/60">
              Neighborhood Association · Madison, Wisconsin
            </div>
            <div className="text-sm text-white/50">🏡 Established 2006</div>
            <div className="mt-6">
              <a
                href="https://www.sprechereast.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/60 underline transition-colors hover:text-white"
              >
                Visit Neighbor Forum →
              </a>
            </div>
          </div>

          {/* Pages */}
          <div>
            <div className="mb-4 text-xs font-semibold tracking-wider text-white/40 uppercase">
              Pages
            </div>
            <ul className="flex flex-col gap-2.5">
              {PAGES.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Association */}
          <div>
            <div className="mb-4 text-xs font-semibold tracking-wider text-white/40 uppercase">
              Association
            </div>
            <ul className="flex flex-col gap-2.5">
              {ASSOCIATION.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="mb-4 text-xs font-semibold tracking-wider text-white/40 uppercase">
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
                      className="text-sm text-white/70 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-white/70 transition-colors hover:text-white"
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
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-sm text-white/40">© {year} Sprecher East Neighborhood Association</p>
          <div className="flex items-center gap-6">
            <Link
              href="/association#bylaws"
              className="text-sm text-white/40 transition-colors hover:text-white/70"
            >
              Bylaws
            </Link>
            <Link
              href="/contact"
              className="text-sm text-white/40 transition-colors hover:text-white/70"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
