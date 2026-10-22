import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import { RichText } from '@/platform/richtext/RichText'
import { resolveLink } from '@/platform/payload/resolveLink'
import { Button } from '@/platform/ui'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <div
      className="bg-gradient-to-br from-primary-fill to-primary-fill-hover py-10 md:py-14"
      data-theme="dark"
    >
      <div className="container">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:gap-12 md:text-left">
          <div className="max-w-[48rem] flex-1">
            {richText && (
              <RichText
                className="mb-0 text-white [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-white [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-white [&_p]:text-lg [&_p]:text-white/90 [&_strong]:text-white"
                data={richText}
                enableGutter={false}
              />
            )}
          </div>
          <div className="flex shrink-0 flex-col gap-4 sm:flex-row">
            {(links || []).map(({ link }, i) => {
              const resolved = resolveLink(link)
              if (!resolved) return null
              // This block is a brand band: white fill first, then a white outline
              return (
                <Button
                  key={i}
                  href={resolved.href}
                  external={resolved.external}
                  size="lg"
                  variant={i === 0 ? 'inverse' : 'inverse-outline'}
                >
                  {resolved.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
