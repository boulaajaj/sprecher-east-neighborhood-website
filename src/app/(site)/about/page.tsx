import type { Metadata } from 'next'
import Image from 'next/image'
import { MapPin } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { CtaBanner } from '@/components/sections/cta-banner'

export const metadata: Metadata = {
  title: 'About',
  description:
    "Learn about the Sprecher East neighborhood — its boundaries, history, subdivisions, and community character on Madison's Far East Side.",
}

const SUBDIVISIONS = [
  {
    name: 'Meadowlands',
    desc: 'A quiet residential area with tree-lined streets and strong neighborhood ties.',
  },
  {
    name: 'Door Creek',
    desc: 'Adjacent to the Door Creek watershed, with natural open spaces and wooded areas.',
  },
  {
    name: 'Reston Heights',
    desc: 'A newer development that has grown into an active part of the Sprecher East community.',
  },
]

const BOUNDARIES = [
  { dir: 'North', road: 'Cottage Grove Road' },
  { dir: 'South', road: 'Milwaukee Street' },
  { dir: 'East', road: 'Sprecher Road' },
  { dir: 'West', road: 'Femrite Drive' },
]

const PHOTOS = [
  { src: '/images/441519955_18435399844044029_8893742456448624265_n.jpg', alt: 'Sprecher East community gathering' },
  { src: '/images/451962546_18443909296044029_4679884066375857301_n.jpg', alt: 'Neighborhood event' },
  { src: '/images/452236518_18443909287044029_3867824997287597586_n.jpg', alt: 'Sprecher East residents' },
]

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Neighborhood"
        title="About Sprecher East"
        description="A welcoming residential community on Madison's Far East Side, organized by neighbors for neighbors since 2006."
      />

      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                Neighborhood Overview
              </p>
              <h2 className="text-3xl font-bold text-foreground mb-5">Who We Are</h2>
              <div className="space-y-4 text-muted leading-relaxed">
                <p>
                  Sprecher East is a residential neighborhood located on the Far East Side of
                  Madison, Wisconsin. It is bounded by Milwaukee Street to the south, Sprecher
                  Road to the east, Cottage Grove Road to the north, and Femrite Drive to the west.
                </p>
                <p>
                  The Sprecher East Neighborhood Association (SENA) was founded in 2006 to give
                  residents a collective voice in city planning decisions, connect neighbors
                  socially, and provide community resources.
                </p>
                <p>
                  We're organized as a non-HOA neighborhood association — membership is completely
                  free and voluntary. There are no dues requirements, no mandates, and no penalties.
                  Just neighbors helping neighbors.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-border shadow-sm">
                <Image
                  src="/images/East_Madison_NAs.png"
                  alt="Map of Sprecher East neighborhood boundaries"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <p className="text-xs text-muted text-center">
                Sprecher East neighborhood boundaries within East Madison
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-14 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
                Where We Are
              </p>
              <h2 className="text-3xl font-bold text-foreground mb-5">Neighborhood Boundaries</h2>
              <div className="grid grid-cols-2 gap-3">
                {BOUNDARIES.map((b) => (
                  <div key={b.dir} className="bg-white rounded-xl border border-border p-4">
                    <div className="text-xs font-bold text-primary uppercase tracking-wide mb-1">
                      {b.dir}
                    </div>
                    <div className="text-sm font-medium text-foreground">{b.road}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground mb-1">Location</div>
                  <div className="text-muted text-sm">Far East Side, Madison, Wisconsin</div>
                </div>
              </div>
              <div className="text-sm text-muted leading-relaxed">
                Sprecher East sits within Dane County's City of Madison, near the intersection of
                Milwaukee Street and Sprecher Road. The neighborhood is easily accessible via
                Highway 30 and has convenient access to the East Towne area.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Sub-Areas</p>
          <h2 className="text-3xl font-bold text-foreground mb-10">Neighborhood Subdivisions</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {SUBDIVISIONS.map((sub) => (
              <div key={sub.name} className="bg-surface rounded-2xl border border-border p-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-primary text-lg">🏘️</span>
                </div>
                <h3 className="font-bold text-foreground mb-2">{sub.name}</h3>
                <p className="text-sm text-muted leading-relaxed">{sub.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PHOTOS.map((img) => (
              <div key={img.src} className="relative rounded-xl overflow-hidden aspect-[4/3]">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 33vw"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner
        title="Want to Get Involved?"
        description="SENA is your neighborhood association. Come to a meeting, join the mailing list, or reach out — we'd love to meet you."
        primaryHref="/get-involved"
        primaryLabel="Get Involved"
        secondaryHref="/contact"
        secondaryLabel="Contact Us"
      />
    </>
  )
}
