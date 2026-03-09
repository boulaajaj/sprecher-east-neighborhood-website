import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="relative -mt-[var(--header-height)]">
      {/* Background image — stays vivid at the top, darkens at the bottom where text lives */}
      <div aria-hidden="true" className="absolute inset-0 select-none">
        {media && typeof media === 'object' && (
          <Media fill imgClassName="object-cover" priority resource={media} />
        )}
      </div>

      {/* Gradient scrim — darkens the bottom where text is anchored */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content anchored to bottom-left */}
      <div
        className="relative z-10 container flex min-h-[80vh] items-end pt-[var(--header-height)] pb-16 md:pb-20"
        data-theme="dark"
      >
        <div className="max-w-2xl">
          {richText && (
            <RichText
              className="[&_h1]:hero-text-shadow [&_p]:hero-text-shadow-sm mb-8 [&_h1]:text-4xl [&_h1]:leading-tight [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-white md:[&_h1]:text-5xl lg:[&_h1]:text-6xl [&_p]:max-w-lg [&_p]:text-lg [&_p]:leading-relaxed [&_p]:text-white/85 md:[&_p]:text-xl"
              data={richText}
              enableGutter={false}
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <ul className="flex flex-wrap gap-4">
              {links.map(({ link }, i) => {
                return (
                  <li key={i}>
                    <CMSLink
                      {...link}
                      className={
                        i === 0
                          ? 'rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl'
                          : 'rounded-lg border-2 border-white/70 px-6 py-3 font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10'
                      }
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
