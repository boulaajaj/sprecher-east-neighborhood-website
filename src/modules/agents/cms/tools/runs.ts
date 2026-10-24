import type { PayloadRequest } from 'payload'

import type { AgentRun } from '@/payload-types'

import { AGENT_RUNS } from '../agentRuns'

/**
 * The calling agent's own run, or an error: run access shows an agent only its own runs, so
 * another agent's run id is "not found".
 */
export const findOwnRun = (req: PayloadRequest, id: number): Promise<AgentRun> =>
  req.payload.findByID({
    collection: AGENT_RUNS,
    id,
    depth: 0,
    overrideAccess: false,
    user: req.user,
  })

/** Adds one to a count on the run, as the agent (it may update its own runs). */
export async function countOnRun(
  req: PayloadRequest,
  run: AgentRun,
  key: 'proposed' | 'duplicates',
): Promise<void> {
  await req.payload.update({
    collection: AGENT_RUNS,
    id: run.id,
    data: { counts: { ...run.counts, [key]: (run.counts?.[key] ?? 0) + 1 } },
    depth: 0,
    overrideAccess: false,
    user: req.user,
  })
}

/** A tool's answer: one line of JSON the agent can read. */
export const toToolAnswer = (result: Record<string, unknown>) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(result) }],
})
