'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'
import { ImageIcon } from 'lucide-react'

import type { Post } from '@/payload-types'

import { Media } from '@/components/Media'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title } = doc || {}
  const { description } = meta || {}
  // meta.image is added by the SEO plugin but missing from Payload's generated types
  const metaImage = (meta as Record<string, unknown> | undefined)?.image as
    | Post['heroImage']
    | undefined

  const hasCategories = categories && Array.isArray(categories) && categories.length > 0
  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\u00A0/g, ' ') // replace non-breaking space with regular space
  const href = `/${relationTo}/${slug}`

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:cursor-pointer hover:shadow-lg',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full overflow-hidden">
        {!metaImage && (
          <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-surface to-primary/5">
            <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        {metaImage && typeof metaImage !== 'string' && (
          <div className="aspect-video overflow-hidden">
            <Media
              resource={metaImage}
              size="33vw"
              imgClassName="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </div>
      <div className="p-5 md:p-6">
        {showCategories && hasCategories && (
          <div className="mb-3 flex flex-wrap gap-2">
            {categories?.map((category, index) => {
              if (typeof category === 'object') {
                const { title: titleFromCategory } = category
                const categoryTitle = titleFromCategory || 'Untitled category'

                return (
                  <span
                    key={index}
                    className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {categoryTitle}
                  </span>
                )
              }

              return null
            })}
          </div>
        )}
        {titleToUse && (
          <h3 className="text-lg leading-snug font-semibold text-foreground">
            <Link className="transition-colors hover:text-primary" href={href} ref={link.ref}>
              {titleToUse}
            </Link>
          </h3>
        )}
        {description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {sanitizedDescription}
          </p>
        )}
      </div>
    </article>
  )
}
