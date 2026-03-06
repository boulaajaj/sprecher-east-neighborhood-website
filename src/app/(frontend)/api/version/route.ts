import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

let cachedBuildId: string | null = null

function getBuildId(): string {
  if (cachedBuildId) return cachedBuildId

  try {
    cachedBuildId = readFileSync(join(process.cwd(), '.next', 'BUILD_ID'), 'utf-8').trim()
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      // Surface the failure so the GET handler can return 500
      throw error
    }
    // In dev mode, use a stable fallback — dev doesn't need version polling
    cachedBuildId = 'development'
  }

  return cachedBuildId
}

export async function GET() {
  try {
    return NextResponse.json(
      { buildId: getBuildId() },
      {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    )
  } catch {
    return NextResponse.json(
      { error: 'Build ID unavailable' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      },
    )
  }
}
