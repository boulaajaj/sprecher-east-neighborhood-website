import Image from 'next/image'
import type { Post } from '@/lib/types'
import { formatDateShort } from '@/lib/utils'
import { TagBadge } from '@/components/ui/badge'

const CATEGORY_LABELS: Record<string, string> = {
  announcement: 'Announcement',
  government: 'Government',
  community: 'Community',
  'about-sena': 'About Sprecher East',
}

function getPostDate(post: Post): string {
  return post.publishedAt ?? post.date ?? ''
}

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const date = getPostDate(post)
  const categoryLabel = CATEGORY_LABELS[post.category ?? ''] ?? post.category ?? ''

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      {post.image && typeof post.image === 'string' && (
        <div className="relative h-52 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-6">
        <div className="mb-3 flex items-center gap-3 text-xs text-muted">
          {categoryLabel && (
            <span className="rounded-full bg-primary/8 px-2 py-0.5 font-medium text-primary">
              {categoryLabel}
            </span>
          )}
          {date && <time dateTime={date}>{formatDateShort(date)}</time>}
          {post.author && <span>· {post.author}</span>}
        </div>
        <h2 className="mb-3 text-lg leading-snug font-semibold text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h2>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        {post.tags && post.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
