import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Users } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative h-[82vh] min-h-[520px] max-h-[780px] overflow-hidden">
      <Image
        src="/images/photo.jpeg"
        alt="Sprecher East neighborhood"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/70 via-foreground/50 to-primary/40" />

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
  )
}
