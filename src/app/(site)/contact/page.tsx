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
      <header className="bg-surface border-b border-border py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Say Hello</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Contact Us</h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            We're your neighbors. Whether you have a question, an idea, want to join SENA,
            or just want to introduce yourself — we'd love to hear from you.
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_320px] gap-10 lg:gap-14 items-start">

          {/* Form */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-2">Send a Message</p>
            <h2 className="text-2xl font-bold text-foreground mb-8">Get in Touch</h2>
            <ContactForm />
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 flex flex-col gap-5">

            {/* About SENA */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-4">About SENA</h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: '📍', label: 'Location', value: 'Madison, Dane County, Wisconsin\nFar East Side' },
                  { icon: '📅', label: 'Established', value: '2006' },
                  { icon: '🤝', label: 'Membership', value: 'Free and always optional for all residents' },
                ].map((item) => (
                  <div key={item.label} className="flex gap-3">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
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
            <div className="bg-primary rounded-2xl p-6 text-white">
              <h3 className="font-bold text-white mb-2">Community Forum</h3>
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                For real-time neighbor conversations, visit the Sprecher East community forum.
              </p>
              <a
                href="https://www.sprechereast.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-center items-center w-full py-2.5 bg-white text-primary text-sm font-semibold rounded-xl hover:bg-surface transition-colors"
              >
                Visit Forum
              </a>
            </div>

            {/* Quick links */}
            <div className="bg-surface rounded-2xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-4">You Might Also Want</h3>
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
                      className="text-sm text-primary hover:text-primary-dark hover:underline transition-colors"
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Not Sure Where to Start?</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-6 text-sm leading-relaxed">
            Whether you want to join, ask a question, or learn more about the neighborhood —
            you're in the right place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/about"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-surface transition-colors"
            >
              Learn About the Area
            </Link>
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/40 text-white font-semibold rounded-xl hover:border-white/70 hover:bg-white/10 transition-colors"
            >
              Get Involved
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
