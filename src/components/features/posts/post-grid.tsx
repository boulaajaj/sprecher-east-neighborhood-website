import type { Post } from '@/lib/types'
import { PostCard } from './post-card'
import { EmptyState } from '@/components/ui/empty-state'

interface PostGridProps {
  posts: Post[]
}

export function PostGrid({ posts }: PostGridProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        icon="📰"
        title="No posts yet"
        description="Neighborhood news and updates will appear here."
        className="p-12"
      />
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {posts.map((post) => (
        <PostCard key={post.id ?? post._id} post={post} />
      ))}
    </div>
  )
}
