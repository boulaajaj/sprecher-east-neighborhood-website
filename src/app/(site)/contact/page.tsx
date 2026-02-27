import type { Metadata } from 'next'
import Link from 'next/link'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with the Sprecher East Neighborhood Association.',
}

export default function ContactPage() {
  return (
    <>
      {/* Page header */}
      <header className="border-b border-border bg-surface py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">Say Hello</p>
          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">Contact Us</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted">
            We're your neighbors. Whether you have a question, an idea, want to join SENA, or just
            want to introduce yourself — we'd love to hear from you.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_320px] lg:gap-14">
          {/* Form */}
          <div>
            <p className="mb-2 text-xs font-bold tracking-widest text-primary uppercase">
              Send a Message
            </p>
            <h2 className="mb-8 text-2xl font-bold text-foreground">Get in Touch</h2>
            <ContactForm />
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
            {/* About SENA */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="mb-4 font-bold text-foreground">About SENA</h3>
              <div className="flex flex-col gap-3">
                {[
                  {
                    icon: '📍',
                    label: 'Location',
                    value: 'Madison, Dane County, Wisconsin\nFar East Side',
                  },
                  { icon: '📅', label: 'Established', value: '2006' },
                  {
                    icon: '🤝',
                    label: 'Membership',
                    value: 'Free and always optional for all residents',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="flex-shrink-0 text-lg">{item.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-foreground">{item.label}</div>
                      <div className="text-sm text-muted" style={{ whiteSpace: 'pre-line' }}>
                        {item.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forum */}
            <div className="rounded-2xl bg-primary p-6 text-white">
              <h3 className="mb-2 font-bold text-white">Community Forum</h3>
              <p className="mb-4 text-sm leading-relaxed text-white/70">
                For real-time neighbor conversations, visit the Sprecher East community forum.
              </p>
              <a
                href="https://www.sprechereast.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-surface"
              >
                Visit Forum
              </a>
            </div>

            {/* Quick links */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h3 className="mb-4 font-bold text-foreground">You Might Also Want</h3>
              <ul className="flex flex-col gap-2.5">
                {[
                  { href: '/get-involved', label: 'Join SENA' },
                  { href: '/events', label: 'Upcoming Events' },
                  { href: '/resources', label: 'Community Resources' },
                  { href: '/association#bylaws', label: 'Read the Bylaws' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-primary transition-colors hover:text-primary-dark hover:underline"
                    >
                      {link.label} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold text-white">Not Sure Where to Start?</h2>
          <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-white/80">
            Whether you want to join, ask a question, or learn more about the neighborhood — you're
            in the right place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary transition-colors hover:bg-surface"
            >
              Learn About the Area
            </Link>
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/10"
            >
              Get Involved
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
