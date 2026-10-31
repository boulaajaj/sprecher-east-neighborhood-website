import React from 'react'

import { Alert, type AlertTone } from '@/platform/ui/Alert'
import { Button } from '@/platform/ui/Button'
import { Card } from '@/platform/ui/Card'
import { DetailLayout } from '@/platform/ui/DetailLayout'
import { Section } from '@/platform/ui/Section'
import { SidebarCTA } from '@/platform/ui/SidebarCTA'
import { Text } from '@/platform/ui/Text'

import { GalleryEntry, GalleryVariant } from './GalleryEntry'

const TONES: AlertTone[] = ['info', 'success', 'warning', 'error']
const SECTION_TONES = ['plain', 'surface', 'brand'] as const
const SPACINGS = ['none', 'sm', 'md', 'lg'] as const
const WIDTHS = ['page', 'prose', 'narrow'] as const

const FRAME = 'w-full overflow-hidden rounded-2xl border border-border'

/** Messages, and the bands and columns a page is built from */
export function LayoutGallery() {
  return (
    <>
      <GalleryEntry
        name="Alert"
        description="Samples here are not live regions, so screen readers don't announce four at once."
      >
        <GalleryVariant label="tone" className="grid w-full gap-4 sm:grid-cols-2">
          {TONES.map((tone) => (
            <Alert key={tone} tone={tone} live={false} title={`${tone} title`}>
              A message in the {tone} tone.
            </Alert>
          ))}
        </GalleryVariant>
      </GalleryEntry>

      <GalleryEntry name="Section" description="A band of the page: tone, spacing and width.">
        <GalleryVariant label="tone (spacing sm)" className="block space-y-4">
          {SECTION_TONES.map((tone) => (
            <div key={tone} className={FRAME}>
              <Section as="div" tone={tone} spacing="sm">
                <Text variant="subsection" as="p">
                  tone {tone}
                </Text>
                {tone === 'brand' && (
                  <div className="mt-4">
                    <Button variant="inverse">Get involved</Button>
                  </div>
                )}
              </Section>
            </div>
          ))}
        </GalleryVariant>
        <GalleryVariant label="spacing (tone surface)" className="block space-y-4">
          {SPACINGS.map((spacing) => (
            <div key={spacing} className={FRAME}>
              <Section as="div" tone="surface" spacing={spacing}>
                <p>spacing {spacing}</p>
              </Section>
            </div>
          ))}
        </GalleryVariant>
        <GalleryVariant label="spacing center" className="block">
          <div className={FRAME}>
            <Section as="div" spacing="center" width="narrow">
              <p className="text-center">Centred in at least 60% of the screen&apos;s height.</p>
            </Section>
          </div>
        </GalleryVariant>
        <GalleryVariant label="width (spacing sm)" className="block space-y-4">
          {WIDTHS.map((width) => (
            <div key={width} className={FRAME}>
              <Section as="div" width={width} spacing="sm">
                <div className="rounded-xl bg-primary/10 p-4">width {width}</div>
              </Section>
            </div>
          ))}
        </GalleryVariant>
      </GalleryEntry>

      <GalleryEntry
        name="DetailLayout"
        description="Content with a sidebar beside it from lg, below it before that."
      >
        <GalleryVariant label="with-sidebar" className="block">
          <div className={`${FRAME} py-6`}>
            <DetailLayout
              aside={
                <SidebarCTA
                  heading="Sidebar box"
                  description="The aside: here a SidebarCTA, a tinted Card."
                  buttonLabel="Get involved"
                  buttonHref="/events"
                />
              }
            >
              <Card variant="muted">
                <Text variant="subsection" as="p">
                  Main content
                </Text>
                <Text variant="small" className="mt-2">
                  A post&apos;s or an event&apos;s body goes here.
                </Text>
              </Card>
            </DetailLayout>
          </div>
        </GalleryVariant>
      </GalleryEntry>
    </>
  )
}
