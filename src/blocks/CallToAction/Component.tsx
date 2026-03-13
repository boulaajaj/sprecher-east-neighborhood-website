import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div className="bg-background py-8 md:py-10" data-theme="dark">
      <div className="container">
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:gap-12 md:text-left">
          <div className="max-w-[48rem] flex-1">
            {richText && (
              <RichText
                className="mb-0 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-primary md:[&_h2]:text-3xl [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-primary md:[&_h3]:text-2xl [&_p]:mt-2 [&_p]:text-base [&_p]:text-foreground md:[&_p]:text-lg"
                data={richText}
                enableGutter={false}
              />
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            {(links || []).map(({ link }, i) => {
              return (
                <CMSLink
                  key={i}
                  size="lg"
                  {...link}
                  className={
                    i === 0
                      ? 'rounded-lg bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-xl'
                      : 'rounded-lg bg-accent px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-accent/90 hover:shadow-xl'
                  }
                />
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
