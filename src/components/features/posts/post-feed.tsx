import type { Post } from '@/lib/types'
import { PostFeedItem } from './post-feed-item'
import { EmptyState } from '@/components/ui/empty-state'

interface PostFeedProps {
  posts: Post[]
}

export function PostFeed({ posts }: PostFeedProps) {
  if (posts.length === 0) {
    return (
      <EmptyState icon="📰" title="No posts yet" description="Check back for neighborhood news." />
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {posts.map((post) => (
        <PostFeedItem key={post.id ?? post._id} post={post} />
      ))}
    </div>
  )
}
