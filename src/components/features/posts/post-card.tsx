import Image from 'next/image'
import type { Post } from '@/lib/types'
import { formatDateShort } from '@/lib/utils'
import { TagBadge } from '@/components/ui/badge'

const CATEGORY_LABELS: Record<string, string> = {
  announcement: 'Announcement',
  government:   'Government',
  community:    'Community',
  'about-sena': 'About SENA',
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
    <article className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {post.image && typeof post.image === 'string' && (
        <div className="relative h-52 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
