import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail } from 'lucide-react'
import { getBoardMembers } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Association',
  description:
    'Learn about the Sprecher East Neighborhood Association — our mission, board of directors, and bylaws.',
}

export const revalidate = 3600

const MISSION_PILLARS = [
  {
    icon: '🏘️',
    title: 'Community Connection',
    desc: 'Foster meaningful relationships among Sprecher East residents through regular events, communication, and shared community spaces.',
  },
  {
    icon: '📢',
    title: 'Neighborhood Advocacy',
    desc: 'Represent the collective interests of Sprecher East residents in local government processes, planning decisions, and public policy.',
  },
  {
    icon: '📋',
    title: 'Information Sharing',
    desc: 'Keep residents informed about neighborhood news, city decisions, and community resources that affect our area.',
  },
]

export default async function AssociationPage() {
  const board = await getBoardMembers()

  return (
    <>
      {/* Page header */}
      <header className="bg-surface border-b border-border py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">SENA</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">The Association</h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            The Sprecher East Neighborhood Association is a volunteer, non-HOA organization
            that exists to serve and connect our community.
          </p>
          <nav className="flex gap-4 mt-6" aria-label="Page sections">
            {[
              ['#mission', 'Mission'],
              ['#board', 'Board'],
              ['#bylaws', 'Bylaws'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-primary hover:text-primary-dark hover:underline transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Mission */}
      <section id="mission" className="py-16 md:py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Purpose</p>
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-muted leading-relaxed max-w-2xl mb-10">
            The Sprecher East Neighborhood Association exists to improve the quality of life for all
            residents in the Sprecher East neighborhood by promoting community involvement,
            communication, and advocacy.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {MISSION_PILLARS.map((p) => (
              <div key={p.title} className="bg-surface rounded-2xl border border-border p-6">
                <div className="text-3xl mb-4">{p.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board */}
      <section id="board" className="bg-surface py-16 md:py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Leadership</p>
          <h2 className="text-3xl font-bold text-foreground mb-2">Board of Directors</h2>
          <p className="text-muted mb-10 leading-relaxed max-w-xl">
            SENA is led by a volunteer board elected by the membership. Board members serve
            one-year terms and can be re-elected.
          </p>

          {board.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {board.map((member) => (
                <div
                  key={member.id ?? member._id}
                  className="bg-white rounded-2xl border border-border p-5 flex flex-col"
                >
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mb-4">
                    {member.initials ??
                      member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                  </div>
                  <div className="font-bold text-foreground">{member.name}</div>
                  <div className="text-xs font-medium text-primary mb-2">{member.role}</div>
                  {member.bio && (
                    <p className="text-xs text-muted leading-relaxed flex-1">{member.bio}</p>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="mt-3 flex items-center gap-1.5 text-xs text-muted hover:text-primary transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      {member.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border p-10 text-center">
              <p className="text-muted text-sm">
                Board member information coming soon.{' '}
                <Link href="/contact" className="text-primary underline hover:text-primary-dark">
                  Contact us
                </Link>{' '}
                for questions.
              </p>
            </div>
          )}

          <p className="text-xs text-muted mt-6">
            Interested in serving on the board?{' '}
            <Link href="/contact" className="text-primary underline hover:text-primary-dark">
              Reach out to learn more.
            </Link>
          </p>
        </div>
      </section>

      {/* Bylaws */}
      <section id="bylaws" className="py-16 md:py-20 scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-start">

            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Governing Documents</p>
              <h2 className="text-3xl font-bold text-foreground mb-8">Bylaws</h2>

              <article className="prose-content space-y-8">

                <section>
                  <h3 className="text-xl font-bold text-foreground border-b border-border pb-3 mb-4">
                    Article I — Name
                  </h3>
                  <p className="text-muted leading-relaxed">
                    The name of this organization shall be the Sprecher East Neighborhood Association,
                    hereinafter referred to as "SENA" or "the Association."
                  </p>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-foreground border-b border-border pb-3 mb-4">
                    Article II — Purpose
                  </h3>
                  <p className="text-muted leading-relaxed mb-3">
                    The purpose of SENA shall be to:
                  </p>
                  <ul className="space-y-2 text-muted">
                    {[
                      'Promote the general welfare and improvement of the Sprecher East neighborhood',
                      'Foster community spirit and neighborly relations among residents',
                      'Provide a forum for discussion of matters affecting the neighborhood',
                      'Represent the interests of the neighborhood in dealings with local government and other organizations',
                      'Encourage civic participation and community involvement',
                    ].map((item) => (
                      <li key={item} className="flex gap-3 leading-relaxed">
                        <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-foreground border-b border-border pb-3 mb-4">
                    Article III — Membership
                  </h3>
                  <div className="space-y-4 text-muted leading-relaxed">
                    <p>
                      <strong className="text-foreground">Section 1 — Eligibility.</strong> Any
                      person who is a resident of the Sprecher East neighborhood and is at least 18
                      years of age shall be eligible for membership in the Association.
                    </p>
                    <p>
                      <strong className="text-foreground">Section 2 — Dues.</strong> Membership dues
                      shall be set by the Board of Directors. Dues shall be paid on a fiscal year
                      basis (April 1 through March 30). Membership shall be considered active upon
                      payment of dues.
                    </p>
                    <p>
                      <strong className="text-foreground">Section 3 — Household Membership.</strong>{' '}
                      All adult members of a household are entitled to attend and participate in
                      meetings when dues are paid for that household. Each household in good standing
                      shall have one vote on matters brought before the membership.
                    </p>
                    <p>
                      <strong className="text-foreground">Section 4 — Associate Membership.</strong>{' '}
                      Businesses with a permanent presence within the neighborhood boundaries may
                      become associate members by paying an annual dues amount set by the Board of
                      Directors. Associate members may participate in meetings but do not have voting
                      rights.
                    </p>
                    <p>
                      <strong className="text-foreground">Section 5 — Good Standing.</strong> A
                      member shall be considered in good standing when their dues are current. Members
                      in good standing may vote at membership meetings and are eligible to serve on
                      committees and the Board of Directors.
                    </p>
                  </div>
                </section>

                <p className="text-xs text-muted border-t border-border pt-4">
                  This is a summary of key articles. For the complete bylaws or questions about
                  governance, please{' '}
                  <Link href="/contact" className="text-primary underline hover:text-primary-dark">
                    contact the board
                  </Link>
                  .
                </p>
              </article>
            </div>

            {/* Sidebar */}
            <aside className="lg:sticky lg:top-24 flex flex-col gap-5">
              <div className="bg-surface rounded-2xl border border-border p-5">
                <h3 className="font-bold text-foreground mb-4">Quick Links</h3>
                <ul className="flex flex-col gap-2.5">
                  {[
                    { href: '#mission', label: 'Mission & Purpose' },
                    { href: '#board', label: 'Board of Directors' },
                    { href: '#bylaws', label: 'Bylaws' },
                    { href: '/get-involved', label: 'Join SENA' },
                    { href: '/contact', label: 'Contact the Board' },
                  ].map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-primary hover:text-primary-dark hover:underline transition-colors"
                      >
                        {link.label} →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-primary rounded-2xl p-5 text-white">
                <h3 className="font-bold text-white mb-2">Free to Join</h3>
                <p className="text-white/70 text-sm mb-4 leading-relaxed">
                  SENA membership is free and completely optional for all neighborhood residents.
                </p>
                <Link
                  href="/get-involved"
                  className="flex justify-center items-center w-full py-2.5 bg-white text-primary text-sm font-semibold rounded-xl hover:bg-surface transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </aside>

          </div>
        </div>
      </section>
    </>
  )
}
