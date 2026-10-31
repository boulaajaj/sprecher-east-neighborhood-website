import type { PayloadRequest } from 'payload'

import { AGENT_REVIEW_ITEMS } from '../agentRuns'
import { findOwnRun, toToolAnswer } from './runs'
import { reportItemInput, reportItemShape, type ReportItemInput } from './schemas'

/**
 * Adds an item for an editor to the agent's own run: something to review, an update or a
 * cancellation to existing content, or a source item it rejected. Each item is its own document,
 * so two reports at once both land. The content it points at is never changed.
 */
export async function reportItem(req: PayloadRequest, input: ReportItemInput) {
  const run = await findOwnRun(req, input.runId)
  const { runId, ...item } = input
  const stored = await req.payload.create({
    collection: AGENT_REVIEW_ITEMS,
    data: { ...item, run: run.id },
    depth: 0,
    overrideAccess: false,
    user: req.user,
  })
  return { status: 'reported' as const, runId, id: stored.id }
}

export const reportItemTool = {
  name: 'reportItem',
  description:
    'Report something for an editor on your current run: needs-review, update, cancel or ' +
    'rejected-invalid, with a summary, evidence and the source link. It never changes the ' +
    'content it points at.',
  parameters: reportItemShape,
  handler: async (args: Record<string, unknown>, req: PayloadRequest) =>
    toToolAnswer(await reportItem(req, reportItemInput.parse(args))),
}
