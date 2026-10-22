'use client'

import Link from 'next/link'
import React from 'react'

import { Media } from '@/components/Media'
import { formatDateShort } from '@/platform/lib/formatDateTime'
import { cn } from '@/platform/lib/cn'
import { categoryPillClassName } from '@/platform/ui/categoryPill'
import useClickableCard from './useClickableCard'

import type { PostSummary } from '../domain/types'

/** A post in a grid: share image or a branded placeholder, date, categories, title, summary. */
export const PostCard: React.FC<{
  post: PostSummary
  className?: string
}> = ({ post, className }) => {
  const { card, link } = useClickableCard({})
  const { slug, categories, description, image, publishedAt, title } = post

  const hasCategories = categories.length > 0
  const sanitizedDescription = description?.replace(/\u00A0/g, ' ') // non-breaking spaces to spaces

  return (
    <article
      className={cn(
        'group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:cursor-pointer hover:shadow-lg motion-safe:hover:-translate-y-1',
        className,
      )}
      ref={card.ref}
    >
      <div className="relative w-full overflow-hidden">
        {!image && (
          <div className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary-dark via-primary to-primary-light">
            <div className="flex flex-col items-center gap-1 opacity-20" aria-hidden="true">
              <span className="text-lg font-bold tracking-tight text-white italic">Sprecher</span>
              <span className="text-sm font-medium tracking-widest text-white/80 uppercase">
                East
              </span>
            </div>
          </div>
        )}
        {image && (
          <div className="aspect-video overflow-hidden">
            <Media
              resource={image}
              size="33vw"
              imgClassName="h-full w-full object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
            />
          </div>
        )}
      </div>
      <div className="p-5 md:p-6">
        {(publishedAt || hasCategories) && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {publishedAt && (
              <time className="text-xs font-medium text-muted-foreground" dateTime={publishedAt}>
                {formatDateShort(publishedAt)}
              </time>
            )}
            {hasCategories && publishedAt && (
              <span className="text-muted-foreground/40" aria-hidden="true">
                &middot;
              </span>
            )}
            {categories.map((category) => (
              <span key={category.id} className={categoryPillClassName}>
                {category.title}
              </span>
            ))}
          </div>
        )}
        {title && (
          <h3 className="text-lg leading-snug font-semibold text-foreground">
            <Link
              className="transition-colors hover:text-primary"
              href={`/posts/${slug}`}
              ref={link.ref}
            >
              {title}
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
