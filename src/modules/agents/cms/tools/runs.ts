import { NotFound, type PayloadRequest } from 'payload'

import type { AgentRun } from '@/payload-types'

import { AGENT_RUNS } from '../agentRuns'

/**
 * The calling agent's own run with this `runId`, or "not found": run access shows an agent only
 * its own runs, so another agent's run is not found either.
 */
export async function findOwnRun(req: PayloadRequest, runId: string): Promise<AgentRun> {
  const { docs } = await req.payload.find({
    collection: AGENT_RUNS,
    where: { runId: { equals: runId } },
    limit: 1,
    depth: 0,
    overrideAccess: false,
    user: req.user,
  })
  if (!docs[0]) throw new NotFound(req.t)
  return docs[0]
}

/** A tool's answer: one line of JSON the agent can read. */
export const toToolAnswer = (result: Record<string, unknown>) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(result) }],
})
