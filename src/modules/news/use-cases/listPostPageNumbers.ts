import 'server-only'

import { toPageNumbers } from '@/platform/lib'

import * as queries from '../data/queries'

/** The numbers of the news listing's pages (`/posts/page/<n>`), for static pages. */
export async function listPostPageNumbers(): Promise<number[]> {
  return toPageNumbers(await queries.countPublishedPosts(), queries.POSTS_PAGE_SIZE)
}
