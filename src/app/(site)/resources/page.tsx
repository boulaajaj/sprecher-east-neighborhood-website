import type { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import {
  type ResourceCard,
  electedOfficials,
  publicSafety,
  childcare,
  renting,
  otherResources,
} from './data'

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Useful community resources for Sprecher East residents — elected officials, public safety, childcare, renting, and more.',
}

function ResourceGrid({ items }: { items: ResourceCard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <a
          key={item.title}
          href={item.href}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener noreferrer' : undefined}
          className="group flex flex-col rounded-2xl border border-border bg-white p-5 transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
              {item.title}
            </h3>
            {item.external && (
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted" />
            )}
          </div>
          <p className="flex-1 text-sm leading-relaxed text-muted">{item.desc}</p>
          {item.phone && <div className="mt-3 text-xs font-medium text-primary">{item.phone}</div>}
        </a>
      ))}
    </div>
  )
}

const sections = [
  {
    id: 'elected-officials',
    label: 'Elected Officials',
    eyebrow: 'Local Government',
    items: electedOfficials,
  },
  {
    id: 'public-safety',
    label: 'Public Safety',
    eyebrow: 'Safety & Emergency',
    items: publicSafety,
  },
  { id: 'childcare', label: 'Childcare Resources', eyebrow: 'Families', items: childcare },
  { id: 'renting', label: 'Renting Resources', eyebrow: 'Housing', items: renting },
  {
    id: 'other-help',
    label: 'Other Community Resources',
    eyebrow: 'Additional Support',
    items: otherResources,
  },
]

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Community Resources"
        title="Resources"
        description="Helpful links and contacts for Sprecher East residents — from elected officials to public safety, childcare, renting, and more."
      />

      {/* Quick nav */}
      <div className="sticky top-16 z-30 border-b border-border bg-white">
        <div className="mx-auto max-w-6xl overflow-x-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex min-w-max gap-1 py-3" aria-label="Resource sections">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap text-muted transition-colors hover:bg-surface hover:text-primary"
              >
                {s.label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-28">
            <div className="mb-6">
              <p className="mb-1 text-xs font-bold tracking-widest text-primary uppercase">
                {s.eyebrow}
              </p>
              <h2 className="text-2xl font-bold text-foreground">{s.label}</h2>
            </div>
            <ResourceGrid items={s.items} />
          </section>
        ))}
      </div>

      {/* CTA */}
      <section className="bg-primary py-14">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-3 text-2xl font-bold text-white">Don't See What You Need?</h2>
          <p className="mx-auto mb-6 max-w-lg text-sm leading-relaxed text-white/80">
            We're always adding to this list. If you know of a resource that would help Sprecher
            East residents, let us know.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-primary transition-colors hover:bg-surface"
          >
            Suggest a Resource
          </Link>
        </div>
      </section>
    </>
  )
}
