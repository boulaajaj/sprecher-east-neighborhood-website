import { betterAuth } from 'better-auth'
import Database from 'better-sqlite3'
import { nextCookies } from 'better-auth/next-js'
import path from 'path'
import fs from 'fs'

// Ensure the data directory exists
const dataDir = path.resolve('./data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

export const auth = betterAuth({
  database: new Database(path.join(dataDir, 'auth.db')),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      enabled: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET),
    },
    // Uncomment when dev accounts are ready:
    // apple: {
    //   clientId: process.env.APPLE_CLIENT_ID!,
    //   clientSecret: process.env.APPLE_CLIENT_SECRET!,
    // },
    // facebook: {
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    // },
    // twitter: {
    //   clientId: process.env.TWITTER_CLIENT_ID!,
    //   clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    // },
  },
  plugins: [nextCookies()],
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'resident',
        input: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  secret: process.env.BETTER_AUTH_SECRET ?? 'local-dev-secret-change-me-in-production',
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
})

export type Session = typeof auth.$Infer.Session
export type AuthUser = typeof auth.$Infer.Session.user
