import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getBoardMembers } from '@/lib/data'
import { PageHeader } from '@/components/ui/page-header'
import { CtaBanner } from '@/components/sections/cta-banner'

export const metadata: Metadata = {
  title: 'Get Involved',
  description:
    'Join the Sprecher East Neighborhood Association — free membership, community events, and ways to contribute to your neighborhood.',
}

export const revalidate = 3600

const BENEFITS = [
  {
    icon: '🗣️',
    title: 'A Voice in Your Neighborhood',
    desc: 'Vote on association decisions and help shape the direction of Sprecher East.',
  },
  {
    icon: '📢',
    title: 'Stay Informed',
    desc: 'Receive updates on neighborhood news, events, local government decisions, and community developments.',
  },
  {
    icon: '🤝',
    title: 'Connect with Neighbors',
    desc: 'Meet the people who live near you, build friendships, and be part of a supportive community network.',
  },
  {
    icon: '🏛️',
    title: 'Collective Advocacy',
    desc: 'Sprecher East speaks with a unified voice to local government on behalf of all residents.',
  },
  {
    icon: '🎉',
    title: 'Community Events',
    desc: 'Sprecher East organizes social events, meetings, and activities that bring the neighborhood together.',
  },
  {
    icon: '🧑‍💼',
    title: 'Run for the Board',
    desc: 'Members in good standing are eligible to serve on the Board of Directors.',
  },
]

const WAYS_TO_HELP = [
  {
    icon: '📅',
    title: 'Attend Meetings',
    desc: "Show up to meetings to hear what's going on and have your voice heard on neighborhood matters.",
  },
  {
    icon: '🙋',
    title: 'Volunteer',
    desc: 'Help organize events, communicate with neighbors, or assist with specific neighborhood projects.',
  },
  {
    icon: '📣',
    title: 'Spread the Word',
    desc: 'Tell your neighbors about Sprecher East. The more people who know and participate, the stronger our community voice.',
  },
  {
    icon: '💡',
    title: 'Share Ideas',
    desc: 'Have an idea for an event or neighborhood improvement? We want to hear from you.',
  },
  {
    icon: '🏛️',
    title: 'Engage with Local Gov',
    desc: 'Attend city council meetings and public hearings — we can help you navigate the process.',
  },
]

export default async function GetInvolvedPage() {
  const board = await getBoardMembers()

  return (
    <>
      <PageHeader
        eyebrow="Membership & Participation"
        title="Get Involved"
        description="Your neighborhood association is made up of neighbors just like you. There are no barriers, no obligations — just community."
      />

      {/* Membership */}
      <section id="membership" className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
                Join Sprecher East
              </p>
              <h2 className="mb-5 text-3xl font-bold text-foreground">
                Membership is Open to Everyone
              </h2>
              <div className="mb-6 space-y-4 leading-relaxed text-muted">
                <p>
                  The Sprecher East Neighborhood Association welcomes any resident within the
                  neighborhood boundaries who is at least 18 years of age. Membership is{' '}
                  <strong className="text-foreground">always free and always optional</strong>.
                </p>
                <p>
                  All adult members of a household are entitled to attend and participate in
                  meetings. There are no dues requirements and no mandates — just neighbors helping
                  neighbors.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-dark"
              >
                Join Sprecher East
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
              <Image
                src="/images/452236518_18443909287044029_3867824997287597586_n.jpg"
                alt="Sprecher East neighborhood community event"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm">
                <div className="text-xs font-bold text-primary">Community Events</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-surface py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
              Why Join
            </p>
            <h2 className="text-3xl font-bold text-foreground">What You Get as a Member</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="flex gap-4 rounded-2xl border border-border bg-white p-5"
              >
                <div className="flex-shrink-0 text-2xl">{b.icon}</div>
                <div>
                  <div className="mb-1 text-sm font-semibold text-foreground">{b.title}</div>
                  <div className="text-sm leading-relaxed text-muted">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ways to participate */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
            Ways to Help
          </p>
          <h2 className="mb-2 text-3xl font-bold text-foreground">How You Can Contribute</h2>
          <p className="mb-10 max-w-xl leading-relaxed text-muted">
            There's no pressure to do more than you want. Even showing up makes a difference.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WAYS_TO_HELP.map((w) => (
              <div key={w.title} className="rounded-2xl border border-border bg-surface p-6">
                <div className="mb-3 text-3xl">{w.icon}</div>
                <h3 className="mb-2 font-bold text-foreground">{w.title}</h3>
                <p className="text-sm leading-relaxed text-muted">{w.desc}</p>
              </div>
            ))}
            <Link
              href="/contact"
              className="group rounded-2xl border-2 border-primary/20 bg-primary/8 p-6 transition-all hover:border-primary hover:bg-primary/10"
            >
              <div className="mb-3 text-3xl">✉️</div>
              <h3 className="mb-2 font-bold text-foreground">Reach Out</h3>
              <p className="mb-3 text-sm leading-relaxed text-muted">
                Have questions? Want to introduce yourself? Just want to say hi? We'd love to hear
                from you.
              </p>
              <span className="text-sm font-semibold text-primary group-hover:underline">
                Contact Us →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Community photos */}
      <section className="bg-surface py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            {[
              '/images/292437847_10217816468723814_3133225540081752947_n.jpg',
              '/images/441519955_18435399844044029_8893742456448624265_n.jpg',
              '/images/451962546_18443909296044029_4679884066375857301_n.jpg',
            ].map((src, i) => (
              <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={src}
                  alt="Sprecher East community"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 25vw"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title="Ready to Join?"
        description="It takes just a few minutes to connect with Sprecher East. Reach out and we'll get you started."
        primaryHref="/contact"
        primaryLabel="Contact Us to Join"
        secondaryHref="/events"
        secondaryLabel="See Upcoming Events"
      />
    </>
  )
}
