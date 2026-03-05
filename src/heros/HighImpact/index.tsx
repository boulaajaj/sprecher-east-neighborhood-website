'use client'
import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="relative -mt-[10.4rem]">
      <div
        className="relative flex min-h-[85vh] items-center justify-center text-white"
        data-theme="dark"
      >
        <div className="absolute inset-0 select-none">
          {media && typeof media === 'object' && (
            <Media fill imgClassName="object-cover" priority resource={media} />
          )}
        </div>
        {/* Dark overlay for text readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20" />
        <div className="relative z-10 container mb-8 flex items-center justify-center">
          <div className="max-w-[40rem] md:text-center">
            {richText && (
              <RichText
                className="mb-8 [&_h1]:text-4xl [&_h1]:leading-tight [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-white [&_h1]:drop-shadow-lg md:[&_h1]:text-5xl lg:[&_h1]:text-6xl [&_p]:text-lg [&_p]:text-white/90 [&_p]:drop-shadow-md md:[&_p]:text-xl"
                data={richText}
                enableGutter={false}
              />
            )}
            {Array.isArray(links) && links.length > 0 && (
              <ul className="flex gap-4 md:justify-center">
                {links.map(({ link }, i) => {
                  return (
                    <li key={i}>
                      <CMSLink
                        {...link}
                        className={
                          i === 0
                            ? 'rounded-lg bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl'
                            : 'rounded-lg border-2 border-white/80 px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white/10'
                        }
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
      {/* Bottom fade into page background — outside data-theme="dark" so it inherits the page theme */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  )
}
