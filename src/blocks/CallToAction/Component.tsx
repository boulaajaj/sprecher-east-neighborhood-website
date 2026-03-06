import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div
      className="bg-gradient-to-br from-primary to-primary-dark py-10 md:py-14"
      data-theme="dark"
    >
      <div className="container">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:gap-12 md:text-left">
          <div className="max-w-[48rem] flex-1">
            {richText && (
              <RichText
                className="mb-0 text-white [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-white [&_p]:text-lg [&_p]:text-white/90"
                data={richText}
                enableGutter={false}
              />
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
            {(links || []).map(({ link }, i) => {
              return (
                <CMSLink
                  key={i}
                  size="lg"
                  {...link}
                  className={
                    i === 0
                      ? 'rounded-lg bg-white px-8 py-3 text-base font-semibold text-primary shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-xl'
                      : 'rounded-lg border-2 border-white px-8 py-3 text-base font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/10'
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
