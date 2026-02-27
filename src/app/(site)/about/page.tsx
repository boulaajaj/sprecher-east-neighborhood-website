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
  {
    src: '/images/441519955_18435399844044029_8893742456448624265_n.jpg',
    alt: 'Sprecher East community gathering',
  },
  {
    src: '/images/451962546_18443909296044029_4679884066375857301_n.jpg',
    alt: 'Neighborhood event',
  },
  {
    src: '/images/452236518_18443909287044029_3867824997287597586_n.jpg',
    alt: 'Sprecher East residents',
  },
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 md:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
                Neighborhood Overview
              </p>
              <h2 className="mb-5 text-3xl font-bold text-foreground">Who We Are</h2>
              <div className="space-y-4 leading-relaxed text-muted">
                <p>
                  Sprecher East is a residential neighborhood located on the Far East Side of
                  Madison, Wisconsin. It is bounded by Milwaukee Street to the south, Sprecher Road
                  to the east, Cottage Grove Road to the north, and Femrite Drive to the west.
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
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-sm">
                <Image
                  src="/images/East_Madison_NAs.png"
                  alt="Map of Sprecher East neighborhood boundaries"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <p className="text-center text-xs text-muted">
                Sprecher East neighborhood boundaries within East Madison
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-14 md:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">
                Where We Are
              </p>
              <h2 className="mb-5 text-3xl font-bold text-foreground">Neighborhood Boundaries</h2>
              <div className="grid grid-cols-2 gap-3">
                {BOUNDARIES.map((b) => (
                  <div key={b.dir} className="rounded-xl border border-border bg-white p-4">
                    <div className="mb-1 text-xs font-bold tracking-wide text-primary uppercase">
                      {b.dir}
                    </div>
                    <div className="text-sm font-medium text-foreground">{b.road}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                <div>
                  <div className="mb-1 font-semibold text-foreground">Location</div>
                  <div className="text-sm text-muted">Far East Side, Madison, Wisconsin</div>
                </div>
              </div>
              <div className="text-sm leading-relaxed text-muted">
                Sprecher East sits within Dane County's City of Madison, near the intersection of
                Milwaukee Street and Sprecher Road. The neighborhood is easily accessible via
                Highway 30 and has convenient access to the East Towne area.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">Sub-Areas</p>
          <h2 className="mb-10 text-3xl font-bold text-foreground">Neighborhood Subdivisions</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {SUBDIVISIONS.map((sub) => (
              <div key={sub.name} className="rounded-2xl border border-border bg-surface p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <span className="text-lg text-primary">🏘️</span>
                </div>
                <h3 className="mb-2 font-bold text-foreground">{sub.name}</h3>
                <p className="text-sm leading-relaxed text-muted">{sub.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface py-12">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {PHOTOS.map((img) => (
              <div key={img.src} className="relative aspect-[4/3] overflow-hidden rounded-xl">
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
