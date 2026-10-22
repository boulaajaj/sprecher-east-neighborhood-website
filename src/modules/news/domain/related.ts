/**
 * The posts "You May Also Like" leaves out: the post being read, and its related posts, which
 * the sidebar already lists above it.
 */
export function recentPostExclusions(post: {
  id: number
  relatedPosts: readonly { id: number }[]
}): number[] {
  return [post.id, ...post.relatedPosts.map(({ id }) => id)]
}
