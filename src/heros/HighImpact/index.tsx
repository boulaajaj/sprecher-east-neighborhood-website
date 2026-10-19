import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import { splitHeadingFromBody } from '@/utilities/splitRichText'
import { cn } from '@/utilities/ui'

const ctaBaseClassName =
  'inline-flex h-auto min-h-11 w-full items-center justify-center rounded-xl px-8 py-3.5 text-center text-base font-semibold whitespace-normal shadow-lg transition-all motion-safe:hover:-translate-y-0.5 hover:shadow-xl sm:w-auto md:w-full'

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
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

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
                className="mb-0 [&_h1]:text-3xl [&_h1]:leading-tight [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-balance [&_h1]:text-white [&_h1]:[text-shadow:0_2px_4px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.5)] sm:[&_h1]:text-4xl lg:[&_h1]:text-5xl"
                data={heading}
                enableGutter={false}
              />
            )}
            {body && (
              // Description — frosted glass card
              <div className="relative mt-3 overflow-hidden rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl md:px-5 md:py-3.5">
                {/* Glass highlight sheen — top-left to bottom-right */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/5" />
                {/* Inner glow along top edge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                <RichText
                  className="relative mb-0 [&_p]:mt-0 [&_p]:mb-0 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-white/90 md:[&_p]:text-lg"
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
                return (
                  <li key={i}>
                    <CMSLink
                      {...link}
                      size="clear"
                      className={cn(
                        ctaBaseClassName,
                        // The hero is a data-theme="dark" scope, where --primary is the lighter
                        // #4e9b76 (white text 3.4:1). --primary-dark there is the brand #3d7a5e (5.1:1).
                        i === 0
                          ? 'bg-primary-dark text-primary-foreground hover:bg-primary-dark/90'
                          : 'bg-accent text-accent-foreground hover:bg-accent/90',
                      )}
                    />
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
