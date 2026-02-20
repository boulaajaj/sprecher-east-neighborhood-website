import path from 'path'
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Silence the "multiple lockfiles" workspace root warning
  outputFileTracingRoot: path.resolve(__dirname),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/images/**',
      },
    ],
  },
}

export default config
