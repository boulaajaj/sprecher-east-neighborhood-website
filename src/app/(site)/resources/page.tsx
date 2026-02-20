import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Useful community resources for Sprecher East residents — elected officials, public safety, childcare, renting, and more.',
}

interface ResourceCard {
  title: string
  desc: string
  href: string
  phone?: string
  external?: boolean
}

function ResourceGrid({ items }: { items: ResourceCard[] }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <a
          key={item.title}
          href={item.href}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener noreferrer' : undefined}
          className="group flex flex-col bg-white border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
              {item.title}
            </h3>
            {item.external && (
              <ExternalLink className="w-3.5 h-3.5 text-muted flex-shrink-0 mt-0.5" />
            )}
          </div>
          <p className="text-sm text-muted leading-relaxed flex-1">{item.desc}</p>
          {item.phone && (
            <div className="mt-3 text-xs text-primary font-medium">{item.phone}</div>
          )}
        </a>
      ))}
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <>
      {/* Page header */}
      <header className="bg-surface border-b border-border py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">
            Community Resources
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Resources</h1>
          <p className="text-muted text-lg max-w-2xl leading-relaxed">
            Helpful links and contacts for Sprecher East residents — from elected officials to
            public safety, childcare, renting, and more.
          </p>
        </div>
      </header>

      {/* Quick nav */}
      <div className="sticky top-16 z-30 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
          <nav className="flex gap-1 py-3 min-w-max" aria-label="Resource sections">
            {[
              ['#elected-officials', 'Elected Officials'],
              ['#public-safety', 'Public Safety'],
              ['#childcare', 'Childcare'],
              ['#renting', 'Renting'],
              ['#other-help', 'Other Help'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="px-3 py-1.5 text-sm font-medium text-muted rounded-lg hover:text-primary hover:bg-surface transition-colors whitespace-nowrap"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 flex flex-col gap-16">

        {/* Elected Officials */}
        <section id="elected-officials" className="scroll-mt-28">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Local Government</p>
            <h2 className="text-2xl font-bold text-foreground">Elected Officials</h2>
          </div>
          <ResourceGrid items={[
            {
              title: 'City of Madison – Mayor\'s Office',
              desc: 'Contact the Mayor\'s office for city-wide issues and services.',
              href: 'https://www.cityofmadison.com/mayor',
              external: true,
            },
            {
              title: 'Madison City Council',
              desc: 'Find your District representative and city council meeting information.',
              href: 'https://www.cityofmadison.com/council',
              external: true,
            },
            {
              title: 'Dane County Executive',
              desc: 'County-level government services and elected leadership.',
              href: 'https://www.countyofdane.com/exec',
              external: true,
            },
            {
              title: 'Wisconsin State Legislature',
              desc: 'Find your state Assembly and Senate representatives.',
              href: 'https://legis.wisconsin.gov/',
              external: true,
            },
            {
              title: 'Madison City Services (311)',
              desc: 'Report issues, request services, or ask questions about city services.',
              href: 'https://www.cityofmadison.com/streets/cityservices/',
              phone: 'Call 311 or (608) 266-4611',
              external: true,
            },
            {
              title: 'Madison Alder — District 15',
              desc: 'Sprecher East falls within Madison\'s District 15. Contact your Alder directly.',
              href: 'https://www.cityofmadison.com/council/district15',
              external: true,
            },
          ]} />
        </section>

        {/* Public Safety */}
        <section id="public-safety" className="scroll-mt-28">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Safety & Emergency</p>
            <h2 className="text-2xl font-bold text-foreground">Public Safety</h2>
          </div>
          <ResourceGrid items={[
            {
              title: 'Madison Police Department',
              desc: 'Non-emergency line for reporting concerns and connecting with your district officers.',
              href: 'https://www.cityofmadison.com/police',
              phone: 'Non-emergency: (608) 255-2345',
              external: true,
            },
            {
              title: 'Madison Fire Department',
              desc: 'Fire prevention, safety tips, and emergency information.',
              href: 'https://www.cityofmadison.com/fire',
              phone: 'Emergency: 911',
              external: true,
            },
            {
              title: 'Dane County Emergency Management',
              desc: 'Preparedness resources, alerts, and emergency planning.',
              href: 'https://www.countyofdane.com/publicsafety/emergency',
              external: true,
            },
            {
              title: 'MPD East District',
              desc: 'Your local police district covering the Far East Side of Madison.',
              href: 'https://www.cityofmadison.com/police/districts/east',
              external: true,
            },
          ]} />
        </section>

        {/* Childcare */}
        <section id="childcare" className="scroll-mt-28">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Families</p>
            <h2 className="text-2xl font-bold text-foreground">Childcare Resources</h2>
          </div>
          <ResourceGrid items={[
            {
              title: 'Wisconsin Child Care Subsidy Program',
              desc: 'Financial assistance for qualifying families needing childcare support.',
              href: 'https://www.dhs.wisconsin.gov/childcare/subsidy.htm',
              external: true,
            },
            {
              title: 'Wisconsin Early Childhood Association',
              desc: 'Find quality childcare providers and early education resources.',
              href: 'https://www.wisconsinearlychildhood.org/',
              external: true,
            },
            {
              title: 'Madison School Childcare Programs',
              desc: 'Before and after school care through Madison Metropolitan School District.',
              href: 'https://www.madison.k12.wi.us/',
              external: true,
            },
            {
              title: 'Boys & Girls Club of Dane County',
              desc: 'Youth programs, after-school care, and summer activities.',
              href: 'https://www.bgcdane.org/',
              phone: '(608) 257-2606',
              external: true,
            },
            {
              title: 'Childcare Resource & Referral Network',
              desc: 'Help finding childcare providers that fit your family\'s needs.',
              href: 'https://www.dhs.wisconsin.gov/childcare/referral.htm',
              external: true,
            },
          ]} />
        </section>

        {/* Renting */}
        <section id="renting" className="scroll-mt-28">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Housing</p>
            <h2 className="text-2xl font-bold text-foreground">Renting Resources</h2>
          </div>
          <ResourceGrid items={[
            {
              title: 'Madison City Housing',
              desc: 'Tenant rights, housing code enforcement, and renter assistance programs.',
              href: 'https://www.cityofmadison.com/dpced/communityDevelopment/housing',
              external: true,
            },
            {
              title: 'Tenant Resource Center',
              desc: 'Free help understanding your rights and responsibilities as a renter in Wisconsin.',
              href: 'https://www.tenantresourcecenter.org/',
              phone: '(608) 257-0006',
              external: true,
            },
            {
              title: 'Legal Action of Wisconsin',
              desc: 'Free legal assistance for low-income tenants facing eviction or housing issues.',
              href: 'https://www.legalaction.org/',
              external: true,
            },
          ]} />
        </section>

        {/* Other Help */}
        <section id="other-help" className="scroll-mt-28">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-1">Additional Support</p>
            <h2 className="text-2xl font-bold text-foreground">Other Community Resources</h2>
          </div>
          <ResourceGrid items={[
            {
              title: 'United Way of Dane County',
              desc: 'Connects residents with health, education, and financial stability services.',
              href: 'https://www.unitedwaydanecounty.org/',
              phone: 'Dial 211 for help',
              external: true,
            },
            {
              title: 'Dane County Social Services',
              desc: 'Public benefits, food assistance, housing programs, and more.',
              href: 'https://www.countyofdane.com/humanservices',
              external: true,
            },
            {
              title: 'Madison Public Library — Pinney Branch',
              desc: 'Your nearest library branch with programs, resources, and community space.',
              href: 'https://www.madisonpubliclibrary.org/locations/pinney',
              external: true,
            },
            {
              title: 'East Madison Community Center',
              desc: 'Programs, classes, and community gathering space on the East Side.',
              href: 'https://www.cityofmadison.com/parks/facilities/communityCenter.cfm?id=1246',
              external: true,
            },
            {
              title: 'Wisconsin 211',
              desc: 'Free, confidential referral service for health and human services.',
              href: 'https://www.211wisconsin.org/',
              phone: 'Dial 211 anytime',
              external: true,
            },
            {
              title: 'Neighbor Forum (sprechereast.org)',
              desc: 'Connect with your Sprecher East neighbors online for local recommendations and help.',
              href: 'https://www.sprechereast.org/',
              external: true,
            },
          ]} />
        </section>

      </div>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Don't See What You Need?</h2>
          <p className="text-white/80 max-w-lg mx-auto mb-6 text-sm leading-relaxed">
            We're always adding to this list. If you know of a resource that would help Sprecher East
            residents, let us know.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-xl hover:bg-surface transition-colors"
          >
            Suggest a Resource
          </Link>
        </div>
      </section>
    </>
  )
}
