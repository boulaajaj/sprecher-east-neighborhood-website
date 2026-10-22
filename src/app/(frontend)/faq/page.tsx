import type { Metadata } from 'next/types'

import React from 'react'
import { JsonLd } from '@/components/JsonLd'
import { toFaqSections } from '@/modules/directory'
import { FaqList, faqJsonLd, findFaqEntries } from '@/modules/directory/server'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function FAQPage() {
  const entries = await findFaqEntries()
  const sections = toFaqSections(entries)

  return (
    <div className="pt-24 pb-24">
      <JsonLd data={faqJsonLd(entries)} />
      <div className="container mb-12 md:mb-16">
        <p className="mb-3 text-xs font-bold tracking-widest text-primary uppercase">FAQ</p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-balance text-foreground md:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Common questions about Sprecher East, how it works, and how to get involved.
        </p>
      </div>

      <div className="container max-w-3xl space-y-12">
        {sections.map(({ category, label, items }) => (
          <section key={category}>
            <h2 className="mb-6 text-xl font-semibold">{label}</h2>
            <FaqList items={items} />
          </section>
        ))}

        {sections.length === 0 && (
          <div className="text-center">
            <p className="text-muted-foreground">FAQ items are being added. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  const title = 'FAQ'
  const description =
    'Frequently asked questions about the Sprecher East Neighborhood Association in Madison, WI.'

  return {
    title,
    description,
    openGraph: mergeOpenGraph({ title, description }),
  }
}
