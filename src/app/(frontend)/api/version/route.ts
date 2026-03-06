import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

let cachedBuildId: string | null = null

function getBuildId(): string {
  if (cachedBuildId) return cachedBuildId

  try {
    cachedBuildId = readFileSync(join(process.cwd(), '.next', 'BUILD_ID'), 'utf-8').trim()
  } catch {
    // In dev mode, use a stable fallback — dev doesn't need version polling
    cachedBuildId = 'development'
  }

  return cachedBuildId
}

export async function GET() {
  return NextResponse.json(
    { buildId: getBuildId() },
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  )
}
