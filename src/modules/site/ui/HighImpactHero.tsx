import React from 'react'

import type { Page } from '@/payload-types'

import { Media } from '@/platform/ui/Media'
import { RichText } from '@/platform/richtext/RichText'
import { splitHeadingFromBody } from '@/platform/richtext/splitHeadingFromBody'
import { resolveLink } from '@/platform/payload/resolveLink'
import { Button } from '@/platform/ui'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  // Render the heading and the description from the same rich text without duplicating
  // it in the DOM (two copies meant two <h1> elements on the home page).
  const { heading, body } = splitHeadingFromBody(richText)

  return (
    <div className="relative -mt-[var(--header-height)]">
      {/* Background image — stays vivid at the top, darkens at the bottom where text lives */}
      <div aria-hidden="true" className="absolute inset-0 select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="object-cover" priority resource={media} />
        )}
      </div>

      {/* Gradient scrim — darkens the bottom-left where text is anchored */}
      <div className="absolute inset-0 bg-gradient-to-r from-scrim/60 via-scrim/30 to-transparent" />

      {/* Content anchored to bottom-left with two-column layout */}
      <div
        className="relative z-10 container flex min-h-[80vh] items-end pt-[var(--header-height)] pb-16 md:pb-20"
        data-theme="dark"
      >
        <div className="flex w-full flex-col gap-8 md:flex-row md:items-end md:justify-between">
          {/* Left column — title above, description in frosted glass */}
          <div className="max-w-2xl">
            {heading && (
              <RichText
                className="mb-0 [&_h1]:text-3xl [&_h1]:leading-tight [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-balance [&_h1]:text-on-image [&_h1]:[text-shadow:0_2px_4px_color-mix(in_srgb,var(--scrim)_80%,transparent),0_4px_16px_color-mix(in_srgb,var(--scrim)_50%,transparent)] sm:[&_h1]:text-4xl lg:[&_h1]:text-5xl"
                data={heading}
                enableGutter={false}
              />
            )}
            {body && (
              // Description — frosted glass card
              <div className="relative mt-3 overflow-hidden rounded-xl border border-on-image/20 bg-on-image/10 px-4 py-3 shadow-[0_8px_32px_color-mix(in_srgb,var(--scrim)_30%,transparent),inset_0_1px_0_color-mix(in_srgb,var(--on-image)_20%,transparent)] backdrop-blur-xl md:px-5 md:py-3.5">
                {/* Glass highlight sheen — top-left to bottom-right */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-on-image/15 via-transparent to-on-image/5" />
                {/* Inner glow along top edge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-on-image/40 to-transparent" />
                <RichText
                  className="relative mb-0 [&_a]:text-on-image [&_p]:mt-0 [&_p]:mb-0 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-on-image/90 md:[&_p]:text-lg [&_strong]:text-on-image"
                  data={body}
                  enableGutter={false}
                />
              </div>
            )}
          </div>

          {/* Right column — CTA buttons */}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex shrink-0 flex-col gap-3 sm:flex-row md:w-60 md:flex-col md:pb-2">
              {links.map(({ link }, i) => {
                const resolved = resolveLink(link)
                if (!resolved) return null
                // By position, as the design asks: the first is the main action
                return (
                  <li key={i}>
                    <Button
                      href={resolved.href}
                      external={resolved.external}
                      size="lg"
                      variant={i === 0 ? 'primary' : 'accent'}
                      // A white focus ring: the theme ring is green on a green photo
                      className="w-full focus-visible:outline-primary-foreground sm:w-auto md:w-full"
                    >
                      {resolved.label}
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom fade — seamless transition into page content */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-b from-transparent to-background" />
    </div>
  )
}
