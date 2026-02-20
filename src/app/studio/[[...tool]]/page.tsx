/**
 * Sanity Studio — embedded at /studio
 *
 * Log in with your Sanity account to manage events, news posts, and board members.
 * Requires NEXT_PUBLIC_SANITY_PROJECT_ID to be set in .env.local
 *
 * Architecture note:
 * - metadata/viewport exported here (Server Component context, required by Next.js 15)
 * - The actual Studio is lazy-loaded with ssr:false so Sanity's React.createContext
 *   calls never execute during server-side build/rendering
 */
// Server Component — can safely export metadata here
// The actual Studio is loaded through a client-side chain to avoid
// React.createContext errors during server-side build evaluation:
//   page.tsx (Server) → StudioClientWrapper.tsx ('use client', dynamic ssr:false) → StudioClient.tsx
import StudioClientWrapper from './StudioClientWrapper'

export { metadata, viewport } from 'next-sanity/studio'

export default function StudioPage() {
  return <StudioClientWrapper />
}
