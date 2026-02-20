import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getBoardMembers } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Get Involved',
  description:
    'Join the Sprecher East Neighborhood Association — free membership, community events, and ways to contribute to your neighborhood.',
}

export const revalidate = 3600

const BENEFITS = [
  { icon: '🗣️', title: 'A Voice in Your Neighborhood', desc: 'Vote on association decisions and help shape the direction of SENA.' },
  { icon: '📢', title: 'Stay Informed', desc: 'Receive updates on neighborhood news, events, local government decisions, and community developments.' },
  { icon: '🤝', title: 'Connect with Neighbors', desc: 'Meet the people who live near you, build friendships, and be part of a supportive community network.' },
  { icon: '🏛️', title: 'Collective Advocacy', desc: 'SENA speaks with a unified voice to local government on behalf of all residents.' },
  { icon: '🎉', title: 'Community Events', desc: 'SENA organizes social events, meetings, and activities that bring the neighborhood together.' },
  { icon: '🧑‍💼', title: 'Run for the Board', desc: 'Members in good standing are eligible to serve on the Board of Directors.' },
]

const WAYS_TO_HELP = [
  { icon: '📅', title: 'Attend Meetings', desc: 'Show up to general membership meetings to hear what\'s going on and vote on association matters.' },
  { icon: '🙋', title: 'Volunteer', desc: 'Help organize events, communicate with neighbors, or assist with specific neighborhood projects.' },
  { icon: '📣', title: 'Spread the Word', desc: 'Tell your neighbors about SENA. The more people who know and participate, the stronger our community voice.' },
  { icon: '💡', title: 'Share Ideas', desc: 'Have an idea for an event or neighborhood improvement? We want to hear from you.' },
  { icon: '🏛️', title: 'Engage with Local Gov', desc: 'Attend city council meetings and public hearings — SENA can help you navigate this.' },
]

export default async function GetInvolvedPage() {
  const board = await getBoardMembers()

  return (
    <>
      {/* Page header */}
      <header className="bg-surface border-b border-border py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            Membership &amp; Participation
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Get Involved</h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            Your neighborhood association is made up of neighbors just like you. There are no
            barriers, no obligations — just community.
          </p>
        </div>
      </header>

      {/* Membership */}
      <section id="membership" className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Join SENA</p>
              <h2 className="text-3xl font-bold text-foreground mb-5">Membership is Open to Everyone</h2>
              <div className="space-y-4 text-muted leading-relaxed mb-6">
                <p>
                  The Sprecher East Neighborhood Association welcomes any resident within the
                  neighborhood boundaries who is at least 18 years of age. Membership is{' '}
                  <strong className="text-foreground">always free and always optional</strong>.
                </p>
                <p>
                  Dues are paid on a fiscal year basis (April 1 through March 30). All adult members
                  of a household are entitled to attend and participate in meetings. Members in good
                  standing may vote and serve on committees.
                </p>
                <p>
                  Businesses with a permanent presence within the neighborhood boundaries can also
                  become associate members by paying an annual dues amount set by the Board.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
              >
                Join SENA Today
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
              <Image
                src="/images/452236518_18443909287044029_3867824997287597586_n.jpg"
                alt="Sprecher East neighborhood community event"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-md">
                <div className="text-xs font-bold text-primary">Community Events</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-surface py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Why Join</p>
            <h2 className="text-3xl font-bold text-foreground">What You Get as a Member</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl border border-border p-5 flex gap-4">
                <div className="text-2xl flex-shrink-0">{b.icon}</div>
                <div>
                  <div className="font-semibold text-foreground mb-1 text-sm">{b.title}</div>
                  <div className="text-muted text-sm leading-relaxed">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ways to participate */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Ways to Help</p>
          <h2 className="text-3xl font-bold text-foreground mb-2">How You Can Contribute</h2>
          <p className="text-muted mb-10 max-w-xl leading-relaxed">
            There's no pressure to do more than you want. Even showing up makes a difference.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {WAYS_TO_HELP.map((w) => (
              <div key={w.title} className="bg-surface rounded-2xl border border-border p-6">
                <div className="text-3xl mb-3">{w.icon}</div>
                <h3 className="font-bold text-foreground mb-2">{w.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{w.desc}</p>
              </div>
            ))}
            <Link
              href="/contact"
              className="group bg-primary/8 border-2 border-primary/20 rounded-2xl p-6 hover:border-primary hover:bg-primary/10 transition-all"
            >
              <div className="text-3xl mb-3">✉️</div>
              <h3 className="font-bold text-foreground mb-2">Reach Out</h3>
              <p className="text-sm text-muted leading-relaxed mb-3">
                Have questions? Want to introduce yourself? Just want to say hi? We'd love to hear from you.
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4">
            {[
              '/images/292437847_10217816468723814_3133225540081752947_n.jpg',
              '/images/441519955_18435399844044029_8893742456448624265_n.jpg',
              '/images/451962546_18443909296044029_4679884066375857301_n.jpg',
            ].map((src, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden aspect-[4/3]">
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

      {/* CTA */}
      <section className="bg-primary py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join?</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8 leading-relaxed">
            It takes just a few minutes to connect with SENA. Reach out and we'll get you started.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-surface transition-colors shadow-md"
            >
              Contact Us to Join
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:border-white/70 hover:bg-white/10 transition-colors"
            >
              See Upcoming Events
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
