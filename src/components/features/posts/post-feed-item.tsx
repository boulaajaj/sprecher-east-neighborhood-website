import type { Post } from '@/lib/types'
import { formatDateShort } from '@/lib/utils'

const CATEGORY_LABELS: Record<string, string> = {
  announcement: 'Announcement',
  government: 'Government',
  community: 'Community',
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
    <article className="group flex gap-3">
      <div className="w-1 flex-shrink-0 rounded-full bg-accent" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2 text-xs text-muted">
          {date && <time dateTime={date}>{formatDateShort(date)}</time>}
          {categoryLabel && (
            <span className="rounded bg-surface px-1.5 py-0.5 text-[10px] font-medium">
              {categoryLabel}
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{post.excerpt}</p>
      </div>
    </article>
  )
}
