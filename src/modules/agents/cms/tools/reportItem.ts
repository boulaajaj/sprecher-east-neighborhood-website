import type { PayloadRequest } from 'payload'

import { AGENT_RUNS, APPENDING_REVIEW_ITEM } from '../agentRuns'
import { findOwnRun, toToolAnswer } from './runs'
import { reportItemInput, reportItemShape, type ReportItemInput } from './schemas'

/**
 * Adds an item for an editor to the agent's own run: something to review, an update or a
 * cancellation to existing content, or a source item it rejected. It only writes to the run;
 * the content it points at is never changed.
 */
export async function reportItem(req: PayloadRequest, input: ReportItemInput) {
  const run = await findOwnRun(req, input.runId)
  const { runId, ...item } = input
  const reviewItems = [
    ...(run.reviewItems ?? []),
    { ...item, reportedAt: new Date().toISOString() },
  ]
  await req.payload.update({
    collection: AGENT_RUNS,
    id: run.id,
    data: { reviewItems },
    depth: 0,
    overrideAccess: false,
    user: req.user,
    context: { [APPENDING_REVIEW_ITEM]: true },
  })
  return { status: 'reported' as const, runId, items: reviewItems.length }
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
