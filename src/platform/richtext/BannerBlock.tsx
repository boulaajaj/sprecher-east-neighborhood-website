import type { BannerBlock as BannerBlockProps } from '@/payload-types'

import { cn } from '@/platform/lib/cn'
import { Alert } from '@/platform/ui/Alert'
import React from 'react'
import { RichText } from './RichText'

type Props = {
  className?: string
} & BannerBlockProps

// A banner is part of the post, read in its place: not announced like a form's message
export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  return (
    <Alert
      tone={style}
      live={false}
      className={cn('mx-auto my-8 w-full px-6 py-3 text-base', className)}
    >
      <RichText data={content} enableGutter={false} enableProse={false} />
    </Alert>
  )
}
