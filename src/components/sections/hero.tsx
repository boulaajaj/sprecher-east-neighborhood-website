import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Users } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative h-[82vh] max-h-[780px] min-h-[520px] overflow-hidden">
      <Image
        src="/images/photo.jpeg"
        alt="Sprecher East neighborhood"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/70 via-foreground/50 to-primary/40" />

      <div className="relative z-10 flex h-full flex-col justify-center">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-4 text-sm font-semibold tracking-widest text-accent uppercase sm:text-base">
            Madison, Wisconsin · Far East Side
          </p>
          <h1 className="mb-6 max-w-2xl text-4xl leading-tight font-bold text-white sm:text-5xl lg:text-6xl">
            Your Neighborhood, <span className="text-accent">Your Community</span>
          </h1>
          <p className="mb-8 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">
            The Sprecher East Neighborhood Association has connected neighbors on Madison's Far East
            Side since 2006. Free to join, always open.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-primary-dark"
            >
              <Calendar className="h-4 w-4" />
              See Events
            </Link>
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              <Users className="h-4 w-4" />
              Get Involved
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
