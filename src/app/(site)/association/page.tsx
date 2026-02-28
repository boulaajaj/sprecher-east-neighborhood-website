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
      <header className="border-b border-border bg-surface py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
            Sprecher East
          </p>
          <h1 className="mb-4 text-4xl font-bold text-foreground md:text-5xl">The Association</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted">
            The Sprecher East Neighborhood Association is a volunteer, non-HOA organization that
            exists to serve and connect our community.
          </p>
          <nav className="mt-6 flex gap-4" aria-label="Page sections">
            {[
              ['#mission', 'Mission'],
              ['#board', 'Board'],
              ['#bylaws', 'Bylaws'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="text-sm font-medium text-primary transition-colors hover:text-primary-dark hover:underline"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Mission */}
      <section id="mission" className="scroll-mt-20 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">Purpose</p>
          <h2 className="mb-4 text-3xl font-bold text-foreground">Our Mission</h2>
          <p className="mb-10 max-w-2xl leading-relaxed text-muted">
            The Sprecher East Neighborhood Association exists to improve the quality of life for all
            residents in the Sprecher East neighborhood by promoting community involvement,
            communication, and advocacy.
          </p>
          <div className="grid gap-6 sm:grid-cols-3">
            {MISSION_PILLARS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-surface p-6">
                <div className="mb-4 text-3xl">{p.icon}</div>
                <h3 className="mb-2 font-bold text-foreground">{p.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board */}
      <section id="board" className="scroll-mt-20 bg-surface py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
            Leadership
          </p>
          <h2 className="mb-2 text-3xl font-bold text-foreground">Board of Directors</h2>
          <p className="mb-10 max-w-xl leading-relaxed text-muted">
            Sprecher East is led by a volunteer board elected by the membership. Board members serve
            one-year terms and can be re-elected.
          </p>

          {board.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {board.map((member) => (
                <div
                  key={member.id ?? member._id}
                  className="flex flex-col rounded-2xl border border-border bg-white p-5"
                >
                  {/* Avatar */}
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                    {member.initials ??
                      member.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                  </div>
                  <div className="font-bold text-foreground">{member.name}</div>
                  <div className="mb-2 text-xs font-medium text-primary">{member.role}</div>
                  {member.bio && (
                    <p className="flex-1 text-xs leading-relaxed text-muted">{member.bio}</p>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="mt-3 flex items-center gap-1.5 text-xs text-muted transition-colors hover:text-primary"
                    >
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white p-10 text-center">
              <p className="text-sm text-muted">
                Board member information coming soon.{' '}
                <Link href="/contact" className="text-primary underline hover:text-primary-dark">
                  Contact us
                </Link>{' '}
                for questions.
              </p>
            </div>
          )}

          <p className="mt-6 text-xs text-muted">
            Interested in serving on the board?{' '}
            <Link href="/contact" className="text-primary underline hover:text-primary-dark">
              Reach out to learn more.
            </Link>
          </p>
        </div>
      </section>

      {/* Bylaws */}
      <section id="bylaws" className="scroll-mt-20 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_280px]">
            <div>
              <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
                Governing Documents
              </p>
              <h2 className="mb-8 text-3xl font-bold text-foreground">Bylaws</h2>

              <article className="prose-content space-y-8">
                <section>
                  <h3 className="mb-4 border-b border-border pb-3 text-xl font-bold text-foreground">
                    Article I — Name
                  </h3>
                  <p className="leading-relaxed text-muted">
                    The name of this organization shall be the Sprecher East Neighborhood
                    Association, hereinafter referred to as "the Association."
                  </p>
                </section>

                <section>
                  <h3 className="mb-4 border-b border-border pb-3 text-xl font-bold text-foreground">
                    Article II — Purpose
                  </h3>
                  <p className="mb-3 leading-relaxed text-muted">
                    The purpose of the Association shall be to:
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
                        <span className="mt-0.5 flex-shrink-0 text-primary">→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="mb-4 border-b border-border pb-3 text-xl font-bold text-foreground">
                    Article III — Membership
                  </h3>
                  <div className="space-y-4 leading-relaxed text-muted">
                    <p>
                      <strong className="text-foreground">Section 1 — Eligibility.</strong> Any
                      person who is a resident of the Sprecher East neighborhood and is at least 18
                      years of age shall be eligible for membership in the Association.
                    </p>
                    <p>
                      <strong className="text-foreground">Section 2 — Dues.</strong> Membership is
                      currently free and voluntary for all residents of the neighborhood. If dues
                      are introduced in the future, they will be proposed and approved by the
                      membership before taking effect.
                    </p>
                    <p>
                      <strong className="text-foreground">Section 3 — Household Membership.</strong>{' '}
                      All adult members of a household are entitled to attend and participate in
                      meetings. Each household shall have one vote on matters brought before the
                      membership.
                    </p>
                    <p>
                      <strong className="text-foreground">Section 4 — Associate Membership.</strong>{' '}
                      Businesses with a permanent presence within the neighborhood boundaries may
                      become associate members. Associate members may participate in meetings but do
                      not have voting rights.
                    </p>
                    <p>
                      <strong className="text-foreground">Section 5 — Good Standing.</strong> A
                      member shall be considered in good standing when their dues are current.
                      Members in good standing may vote at membership meetings and are eligible to
                      serve on committees and the Board of Directors.
                    </p>
                  </div>
                </section>

                <p className="border-t border-border pt-4 text-xs text-muted">
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
            <aside className="flex flex-col gap-5 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-border bg-surface p-5">
                <h3 className="mb-4 font-bold text-foreground">Quick Links</h3>
                <ul className="flex flex-col gap-2.5">
                  {[
                    { href: '#mission', label: 'Mission & Purpose' },
                    { href: '#board', label: 'Board of Directors' },
                    { href: '#bylaws', label: 'Bylaws' },
                    { href: '/get-involved', label: 'Get Involved' },
                    { href: '/contact', label: 'Contact the Board' },
                  ].map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-primary transition-colors hover:text-primary-dark hover:underline"
                      >
                        {link.label} →
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-primary p-5 text-white">
                <h3 className="mb-2 font-bold text-white">Free to Join</h3>
                <p className="mb-4 text-sm leading-relaxed text-white/70">
                  Membership is free and completely optional for all neighborhood residents.
                </p>
                <Link
                  href="/get-involved"
                  className="flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-surface"
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
