// Shared types used by both the JSON fallback and Sanity data sources.
// When migrating to Sanity, extend these with Sanity-specific fields (_id, _type, etc.)

export interface EventLocation {
  type: 'virtual' | 'in-person' | 'hybrid'
  name?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  maps_url?: string
}

export interface Event {
  id?: string
  _id?: string
  title: string
  slug: string | { current: string }
  date: string
  timeStart?: string
  time_start?: string
  timeEnd?: string
  time_end?: string
  category: 'government' | 'community' | 'social' | 'other'
  status?: 'upcoming' | 'past' | 'cancelled'
  // JSON format uses nested location, Sanity uses flat fields
  location?: EventLocation
  locationType?: 'virtual' | 'in-person' | 'hybrid'
  locationName?: string
  locationAddress?: string
  locationCity?: string
  mapsUrl?: string
  registrationUrl?: string
  description: string
  featured?: boolean
  image?: string | { asset: { url: string } }
}

export interface Post {
  id?: string
  _id?: string
  title: string
  slug: string | { current: string }
  date?: string
  publishedAt?: string
  author?: string
  category?: string
  tags?: string[]
  featured?: boolean
  image?: string | { asset: { url: string } }
  excerpt: string
  content?: string
}

export interface BoardMember {
  id?: string
  _id?: string
  name: string
  role: string
  bio?: string
  email?: string
  initials?: string
  order?: number
  photo?: { asset: { url: string } }
}
