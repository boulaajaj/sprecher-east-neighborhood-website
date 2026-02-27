import type { Metadata } from 'next'
import Link from 'next/link'
import { getPosts } from '@/lib/data'
import { PageHeader } from '@/components/ui/page-header'
import { PostGrid } from '@/components/features/posts/post-grid'

export const metadata: Metadata = {
  title: 'News & Announcements',
  description:
    'Neighborhood news, announcements, and updates from the Sprecher East Neighborhood Association.',
}

export const revalidate = 3600

const CATEGORIES = [
  { value: 'announcement', label: 'Announcements' },
  { value: 'government', label: 'Government' },
  { value: 'community', label: 'Community' },
  { value: 'about-sena', label: 'About SENA' },
]

export default async function NewsPage() {
  const posts = await getPosts()

  return (
    <>
      <PageHeader
        eyebrow="Neighborhood Updates"
        title="News & Announcements"
        description="Stay informed about what's happening in Sprecher East — from neighborhood issues and city updates to community highlights and SENA announcements."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_280px] lg:gap-12">
          <PostGrid posts={posts} />

          <aside className="flex flex-col gap-5 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-4 font-bold text-foreground">Categories</h3>
              <ul className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => {
                  const count = posts.filter((p) => p.category === cat.value).length
                  return (
                    <li key={cat.value} className="flex items-center justify-between">
                      <span className="text-sm text-muted">{cat.label}</span>
                      {count > 0 && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {count}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="mb-2 font-bold text-foreground">Upcoming Events</h3>
              <p className="mb-4 text-sm text-muted">
                Check out what's coming up in the neighborhood.
              </p>
              <Link
                href="/events"
                className="flex w-full items-center justify-center rounded-xl border-2 border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                View Calendar
              </Link>
            </div>

            <div className="rounded-2xl bg-primary p-5 text-white">
              <h3 className="mb-2 font-bold text-white">Neighbor Forum</h3>
              <p className="mb-4 text-sm leading-relaxed text-white/70">
                Join real-time conversations with your neighbors on the Sprecher East community
                forum.
              </p>
              <a
                href="https://www.sprechereast.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-xl bg-white py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-surface"
              >
                Visit Forum
              </a>
            </div>
          </aside>
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-surface p-10 text-center">
          <div className="mb-4 text-4xl">✍️</div>
          <h2 className="mb-2 text-xl font-bold text-foreground">Have Something to Share?</h2>
          <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-muted">
            If you have neighborhood news, an announcement, or something worth sharing with the
            community, reach out and we can post it here.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-semibold text-white transition-colors hover:bg-primary-dark"
          >
            Send Us a Message
          </Link>
        </div>
      </div>
    </>
  )
}
