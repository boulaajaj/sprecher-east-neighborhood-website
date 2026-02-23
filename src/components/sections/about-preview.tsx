import Image from 'next/image'
import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'

export function AboutPreview() {
  return (
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
  )
}
