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
  { value: 'government',   label: 'Government' },
  { value: 'community',    label: 'Community' },
  { value: 'about-sena',   label: 'About SENA' },
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid lg:grid-cols-[1fr_280px] gap-10 lg:gap-12 items-start">

          <PostGrid posts={posts} />

          <aside className="lg:sticky lg:top-20 flex flex-col gap-5">
            <div className="bg-surface rounded-2xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-4">Categories</h3>
              <ul className="flex flex-col gap-2">
                {CATEGORIES.map((cat) => {
                  const count = posts.filter((p) => p.category === cat.value).length
                  return (
                    <li key={cat.value} className="flex items-center justify-between">
                      <span className="text-sm text-muted">{cat.label}</span>
                      {count > 0 && (
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {count}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="bg-surface rounded-2xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-2">Upcoming Events</h3>
              <p className="text-sm text-muted mb-4">
                Check out what's coming up in the neighborhood.
              </p>
              <Link
                href="/events"
                className="flex justify-center items-center w-full py-2.5 border-2 border-border text-foreground text-sm font-medium rounded-xl hover:border-primary hover:text-primary transition-colors"
              >
                View Calendar
              </Link>
            </div>

            <div className="bg-primary rounded-2xl p-5 text-white">
              <h3 className="font-bold text-white mb-2">Neighbor Forum</h3>
              <p className="text-white/70 text-sm mb-4 leading-relaxed">
                Join real-time conversations with your neighbors on the Sprecher East community forum.
              </p>
              <a
                href="https://www.sprechereast.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex justify-center items-center w-full py-2.5 bg-white text-primary text-sm font-semibold rounded-xl hover:bg-surface transition-colors"
              >
                Visit Forum
              </a>
            </div>
          </aside>
        </div>

        <div className="mt-16 bg-surface rounded-2xl border border-border p-10 text-center">
          <div className="text-4xl mb-4">✍️</div>
          <h2 className="text-xl font-bold text-foreground mb-2">Have Something to Share?</h2>
          <p className="text-muted text-sm max-w-md mx-auto mb-6 leading-relaxed">
            If you have neighborhood news, an announcement, or something worth sharing with the
            community, reach out and we can post it here.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            Send Us a Message
          </Link>
        </div>
      </div>
    </>
  )
}
