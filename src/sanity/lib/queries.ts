import { groq } from 'next-sanity'

export const eventsQuery = groq`
  *[_type == "event"] | order(date desc) {
    _id, title, slug, date, timeStart, timeEnd, category,
    locationType, locationName, locationAddress, locationCity,
    mapsUrl, registrationUrl, description, featured, image
  }
`

export const upcomingEventsQuery = groq`
  *[_type == "event" && date >= $today] | order(date asc) {
    _id, title, slug, date, timeStart, timeEnd, category,
    locationType, locationName, locationAddress, locationCity,
    mapsUrl, registrationUrl, description, featured, image
  }
`

export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc) {
    _id, title, slug, publishedAt, author, category, tags, featured, image, excerpt
  }
`

export const boardQuery = groq`
  *[_type == "boardMember"] | order(order asc) {
    _id, name, role, bio, email, order, photo
  }
`
