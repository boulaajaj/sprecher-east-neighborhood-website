import type { Post } from '@/lib/types'
import { formatDateShort } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  announcement: 'Announcement',
  government:   'Government',
  community:    'Community',
  'about-sena': 'About SENA',
}

function getPostDate(post: Post): string {
  return post.publishedAt ?? post.date ?? ''
}

interface PostFeedItemProps {
  post: Post
}

export function PostFeedItem({ post }: PostFeedItemProps) {
  const date = getPostDate(post)
  const categoryLabel = CATEGORY_LABELS[post.category ?? ''] ?? post.category ?? ''

  return (
    <article className="flex gap-3 group">
      <div className="w-1 rounded-full bg-accent flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs text-muted mb-1">
          {date && <time dateTime={date}>{formatDateShort(date)}</time>}
          {categoryLabel && (
            <span className="px-1.5 py-0.5 bg-surface rounded text-[10px] font-medium">
              {categoryLabel}
            </span>
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
