import React from 'react'

import type { Page } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

export const HighImpactHero: React.FC<Page['hero']> = ({ links, media, richText }) => {
  return (
    <div className="relative -mt-[10.4rem]">
      <div className="relative flex min-h-[70vh] items-end text-white" data-theme="dark">
        {/* Background image */}
        <div className="absolute inset-0 select-none">
          {media && typeof media === 'object' && (
            <Media fill imgClassName="object-cover" priority resource={media} />
          )}
        </div>
        {/* Dark overlay for text readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

        {/* Two-column layout: text left, buttons right */}
        <div className="relative z-10 container pt-48 pb-16 md:pt-56 md:pb-20">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            {/* Left column — title above, description in frosted glass */}
            <div className="max-w-2xl">
              {richText && (
                <>
                  {/* Title — sits directly on the hero image with strong shadow for readability */}
                  <RichText
                    className="mb-0 [&_h1]:text-3xl [&_h1]:leading-tight [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:text-white [&_h1]:[text-shadow:0_2px_4px_rgba(0,0,0,0.8),0_4px_16px_rgba(0,0,0,0.5)] sm:[&_h1]:text-4xl lg:[&_h1]:text-5xl [&_p]:hidden"
                    data={richText}
                    enableGutter={false}
                  />
                  {/* Description — frosted glass card with realistic glass effect */}
                  <div className="relative mt-1 overflow-hidden rounded-xl border border-white/20 bg-white/10 px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-xl md:px-5 md:py-3.5">
                    {/* Glass highlight sheen — top-left to bottom-right */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-white/5" />
                    {/* Inner glow along top edge */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                    <RichText
                      className="relative mb-0 [&_h1]:hidden [&_p]:mt-0 [&_p]:mb-0 [&_p]:text-base [&_p]:leading-relaxed [&_p]:text-white/90 md:[&_p]:text-lg"
                      data={richText}
                      enableGutter={false}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Right column — CTA buttons aligned to bottom, frosted glass style */}
            {Array.isArray(links) && links.length > 0 && (
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row md:flex-col md:pb-2">
                {links.map(({ link }, i) => {
                  return (
                    <CMSLink
                      key={i}
                      {...link}
                      className={
                        i === 0
                          ? 'rounded-xl border border-white/20 bg-primary/80 px-8 py-3.5 text-center text-base font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl'
                          : 'rounded-xl border border-white/20 bg-black/25 px-8 py-3.5 text-center text-base font-semibold text-white shadow-[0_4px_16px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-black/35 hover:shadow-xl'
                      }
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Bottom fade into page content — extended for smooth transition */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-b from-transparent via-background/40 to-background md:h-48" />
    </div>
  )
}
