import Image from 'next/image'
import type { Post } from '@/lib/types'
import { formatDateShort } from '@/lib/utils'
import { getSlug } from '@/lib/data'

const CATEGORY_LABELS: Record<string, string> = {
  announcement: 'Announcement',
  government:   'Government',
  community:    'Community',
  'about-sena': 'About SENA',
}

interface Props {
  post: Post
  variant?: 'feed' | 'card'
}

function getPostDate(post: Post): string {
  return post.publishedAt ?? post.date ?? ''
}

export default function PostCard({ post, variant = 'feed' }: Props) {
  const date = getPostDate(post)
  const slug = getSlug(post)
  const categoryLabel = CATEGORY_LABELS[post.category ?? ''] ?? post.category ?? ''

  if (variant === 'card') {
    // Large card used on /news page
    return (
      <article className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
        {post.image && typeof post.image === 'string' && (
          <div className="relative h-52 overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center gap-3 text-xs text-muted mb-3">
            {categoryLabel && (
              <span className="px-2 py-0.5 bg-primary/8 text-primary rounded-full font-medium">
                {categoryLabel}
              </span>
            )}
            {date && <time dateTime={date}>{formatDateShort(date)}</time>}
            {post.author && <span>· {post.author}</span>}
          </div>
          <h2 className="text-lg font-semibold text-foreground leading-snug mb-3 group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          <p className="text-sm text-muted leading-relaxed line-clamp-3">{post.excerpt}</p>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs px-2 py-0.5 bg-surface text-muted rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    )
  }

  // Feed item variant used on homepage sidebar
  return (
    <article className="flex gap-3 group">
      {/* Color accent bar */}
      <div className="w-1 rounded-full bg-accent flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted mb-1">
          {date && <time dateTime={date}>{formatDateShort(date)}</time>}
          {categoryLabel && (
            <span className="px-1.5 py-0.5 bg-surface rounded text-[10px] font-medium">{categoryLabel}</span>
          )}
        </div>
        <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">{post.excerpt}</p>
      </div>
    </article>
  )
}
