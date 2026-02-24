import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  outputFileTracingRoot: new URL('.', import.meta.url).pathname,
  images: {
    remotePatterns: [],
  },
}

export default withPayload(nextConfig)
