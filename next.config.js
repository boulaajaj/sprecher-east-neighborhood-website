import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { withPayload } from '@payloadcms/next/withPayload'
import { PHASE_PRODUCTION_BUILD } from 'next/constants.js'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined) ||
  process.env.__NEXT_PRIVATE_ORIGIN ||
  'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // Pin the Turnstile site key at build time for server AND browser code. Next only inlines
    // NEXT_PUBLIC_* values that exist at build; when unset, server code would read a key added
    // later to .env.local (check on) while the browser bundle has none (no widget). `env`
    // entries are inlined even when empty, so both sides always agree.
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '',
  },
  images: {
    // Uploads are served by Payload under this path; getMediaUrl keeps them relative (local)
    localPatterns: [{ pathname: '/api/media/file/**' }],
    // ImageMedia asks for quality 100; Next 16 allows only 75 unless listed
    qualities: [100],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  // Next 16 writes a block into AGENTS.md when an AI agent runs `next dev`. AGENTS.md is a policy
  // file, so it stays off until the owner decides (#194).
  agentRules: false,
  reactStrictMode: true,
  redirects,
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
}

/**
 * Turnstile needs both keys or neither. Half-configured, either visitors are blocked (secret
 * only) or the page shows a check the server never enforces (site key only), so refuse to
 * build. Only at build time: `next start` loads this file too, and throwing there would take
 * the whole site down on a restart.
 */
function assertTurnstileKeysPaired() {
  const siteKey = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
  const secret = Boolean(process.env.TURNSTILE_SECRET_KEY)
  if (siteKey !== secret) {
    throw new Error(
      `[turnstile] Only ${siteKey ? 'NEXT_PUBLIC_TURNSTILE_SITE_KEY' : 'TURNSTILE_SECRET_KEY'} is set. ` +
        'Set both Turnstile keys, or neither, then build again (see .env.local.example).',
    )
  }
}

const config = withPayload(nextConfig, { devBundleServerPackages: false })

export default function nextConfigForPhase(phase) {
  if (phase === PHASE_PRODUCTION_BUILD) assertTurnstileKeysPaired()
  return config
}
