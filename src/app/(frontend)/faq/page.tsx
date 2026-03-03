import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { lexicalToPlainText } from '@/utilities/lexicalToPlainText'

export const dynamic = 'force-static'
export const revalidate = 600

const categoryLabels: Record<string, string> = {
  general: 'General',
  membership: 'Membership',
  events: 'Events',
  neighborhood: 'Neighborhood',
}

export default async function FAQPage() {
  const payload = await getPayload({ config: configPromise })

  const faqs = await payload.find({
    collection: 'faq',
    depth: 0,
    limit: 200,
    sort: 'order',
    overrideAccess: false,
  })

  // Group by category
  const grouped = faqs.docs.reduce(
    (acc, faq) => {
      const cat = faq.category || 'general'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(faq)
      return acc
    },
    {} as Record<string, typeof faqs.docs>,
  )

  const categoryOrder = Object.keys(categoryLabels)

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.docs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: lexicalToPlainText(faq.answer),
      },
    })),
  }

  return (
    <div className="pt-24 pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container mb-16">
        <div className="prose max-w-none">
          <h1>Frequently Asked Questions</h1>
          <p className="text-muted-foreground">
            Common questions about the Sprecher East Neighborhood Association.
          </p>
        </div>
      </div>

      <div className="container max-w-3xl space-y-12">
        {categoryOrder
          .filter((cat) => grouped[cat]?.length)
          .map((cat) => (
            <section key={cat}>
              <h2 className="mb-6 text-xl font-semibold">{categoryLabels[cat]}</h2>
              <div className="space-y-4">
                {grouped[cat].map((faq) => (
                  <details
                    key={faq.id}
                    className="group rounded-lg border border-border bg-card p-4"
                  >
                    <summary className="cursor-pointer list-none font-medium">
                      <span className="flex items-center justify-between">
                        {faq.question}
                        <span className="ml-2 text-muted-foreground transition-transform group-open:rotate-180">
                          ▾
                        </span>
                      </span>
                    </summary>
                    <div className="mt-4 border-t border-border pt-4">
                      <RichText data={faq.answer} enableGutter={false} />
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}

        {Object.keys(grouped).length === 0 && (
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
