import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Users, Calendar, ArrowRight } from 'lucide-react'
import { getEvents, getPosts, isUpcoming } from '@/lib/data'
import EventCard from '@/components/EventCard'
import PostCard from '@/components/PostCard'

export const metadata: Metadata = {
  title: 'Home',
}

// Revalidate once per hour — change to 0 for fully static
export const revalidate = 3600

export default async function HomePage() {
  const [allEvents, allPosts] = await Promise.all([getEvents(), getPosts()])

  const upcoming = allEvents.filter((e) => isUpcoming(e.date)).slice(0, 4)
  const recent = allPosts.slice(0, 4)

  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative h-[82vh] min-h-[520px] max-h-[780px] overflow-hidden">
        {/* Background image — move assets/images/ to public/images/ during setup */}
        <Image
          src="/images/photo.jpeg"
          alt="Sprecher East neighborhood"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/70 via-foreground/50 to-primary/40" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <p className="text-accent font-semibold text-sm sm:text-base uppercase tracking-widest mb-4">
              Madison, Wisconsin · Far East Side
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl">
              Your Neighborhood,{' '}
              <span className="text-accent">Your Community</span>
            </h1>
            <p className="text-white/85 text-lg sm:text-xl leading-relaxed max-w-xl mb-8">
              The Sprecher East Neighborhood Association has connected neighbors
              on Madison's Far East Side since 2006. Free to join, always open.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors shadow-lg"
              >
                <Calendar className="w-4 h-4" />
                See Events
              </Link>
              <Link
                href="/get-involved"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/25 transition-colors backdrop-blur-sm"
              >
                <Users className="w-4 h-4" />
                Join SENA
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature strip ─────────────────────────────────────────────────── */}
      <section className="bg-primary text-white py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            {[
              { icon: '🏡', label: 'Established', value: '2006' },
              { icon: '📍', label: 'Location', value: 'Far East Side' },
              { icon: '🌳', label: 'Community', value: 'Door Creek Area' },
              { icon: '🤝', label: 'Membership', value: 'Free & Optional' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-wide">{item.label}</div>
                  <div className="text-white font-semibold text-sm">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About preview ─────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                About the Neighborhood
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-5 leading-tight">
                A Welcoming Corner of Madison
              </h2>
              <p className="text-muted leading-relaxed mb-4">
                Sprecher East is a residential neighborhood on Madison's Far East Side, bounded
                by Milwaukee Street to the south, Sprecher Road to the east, Cottage Grove Road
                to the north, and Femrite Drive to the west.
              </p>
              <p className="text-muted leading-relaxed mb-6">
                Our neighborhood includes several subdivisions — Meadowlands, Door Creek, and
                Reston Heights — all united by a shared commitment to community connection.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/resources"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-border text-foreground font-medium rounded-xl hover:border-primary hover:text-primary transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  Resources
                </Link>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
              <Image
                src="/images/image-asset.jpeg"
                alt="Sprecher East neighborhood"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-md">
                <div className="text-xs font-bold text-primary">Door Creek Area</div>
                <div className="text-xs text-muted">Madison, Wisconsin</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Events + News ──────────────────────────────────────────────────── */}
      <section className="bg-surface py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14">

            {/* Events column */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                    Upcoming Events
                  </p>
                  <h2 className="text-2xl font-bold text-foreground">What's Coming Up</h2>
                </div>
                <Link
                  href="/events"
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {upcoming.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {upcoming.map((event) => (
                    <EventCard key={event.id ?? event._id} event={event} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-border p-8 text-center">
                  <div className="text-3xl mb-3">📅</div>
                  <p className="font-semibold text-foreground mb-1">No upcoming events</p>
                  <p className="text-sm text-muted">Check back soon — more events are planned.</p>
                </div>
              )}
            </div>

            {/* News column */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">
                    Latest News
                  </p>
                  <h2 className="text-2xl font-bold text-foreground">Neighborhood Updates</h2>
                </div>
                <Link
                  href="/news"
                  className="text-sm font-medium text-primary hover:text-primary-dark transition-colors flex items-center gap-1"
                >
                  All news
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recent.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {recent.map((post) => (
                    <PostCard key={post.id ?? post._id} post={post} variant="feed" />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-border p-8 text-center">
                  <div className="text-3xl mb-3">📰</div>
                  <p className="font-semibold text-foreground mb-1">No posts yet</p>
                  <p className="text-sm text-muted">Check back for neighborhood news.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA banner ─────────────────────────────────────────────────────── */}
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join Your Neighbors
          </h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Membership is free and optional. Come to a meeting, volunteer for a project,
            or just say hello — every neighbor is welcome.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-surface transition-colors shadow-md"
            >
              <Users className="w-4 h-4" />
              Get Involved
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-7 py-3.5 border-2 border-white/40 text-white font-semibold rounded-xl hover:border-white/70 hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
