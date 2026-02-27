import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'

export function AboutPreview() {
  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div>
            <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
              About the Neighborhood
            </p>
            <h2 className="mb-5 text-3xl leading-tight font-bold text-foreground lg:text-4xl">
              A Welcoming Corner of Madison
            </h2>
            <p className="mb-4 leading-relaxed text-muted">
              Sprecher East is a residential neighborhood on Madison's Far East Side, bounded by
              Milwaukee Street to the south, Sprecher Road to the east, Cottage Grove Road to the
              north, and Femrite Drive to the west.
            </p>
            <p className="mb-6 leading-relaxed text-muted">
              Our neighborhood includes several subdivisions — Meadowlands, Door Creek, and Reston
              Heights — all united by a shared commitment to community connection.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark"
              >
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-border px-5 py-2.5 font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <MapPin className="h-4 w-4" />
                Resources
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
            <Image
              src="/images/image-asset.jpeg"
              alt="Sprecher East neighborhood"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute bottom-4 left-4 rounded-xl bg-white/95 px-4 py-2.5 shadow-md backdrop-blur-sm">
              <div className="text-xs font-bold text-primary">Door Creek Area</div>
              <div className="text-xs text-muted">Madison, Wisconsin</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
