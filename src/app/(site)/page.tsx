import type { Metadata } from 'next'
import { getEvents, getPosts, isUpcoming } from '@/lib/data'
import { Hero } from '@/components/sections/hero'
import { FeatureStrip } from '@/components/sections/feature-strip'
import { AboutPreview } from '@/components/sections/about-preview'
import { EventsNews } from '@/components/sections/events-news'
import { CtaBanner } from '@/components/sections/cta-banner'

export const metadata: Metadata = {
  title: 'Home',
}

export const revalidate = 3600

export default async function HomePage() {
  const [allEvents, allPosts] = await Promise.all([getEvents(), getPosts()])

  const upcomingEvents = allEvents.filter((e) => isUpcoming(e.date)).slice(0, 4)
  const recentPosts = allPosts.slice(0, 4)

  return (
    <>
      <Hero />
      <FeatureStrip />
      <AboutPreview />
      <EventsNews upcomingEvents={upcomingEvents} recentPosts={recentPosts} />
      <CtaBanner />
    </>
  )
}
