import type { MCPAccessSettings, MCPPluginConfig } from '@payloadcms/plugin-mcp'
import { APIError, type PayloadRequest, UnauthorizedError } from 'payload'

import { SlidingWindowCounter } from '@/platform/lib'
import { hasAgent } from '@/platform/payload/roles'

import { toAgentAnswer } from '../domain/agentView'
import { MCP_LIMITS } from '../domain/mcpLimits'
import { AGENT_RUNS } from './agentRuns'
import { adminOnlyApiKeys } from './apiKeys'
import { reportItemTool } from './tools/reportItem'
import { submitSuggestionTool } from './tools/submitSuggestion'

type Answer = { content: Array<{ text: string; type: string }> }

/** Every MCP answer is rebuilt from the allowlisted view, so no personal data reaches the model. */
const answerFor =
  (collection: string) =>
  (response: Answer, doc: Record<string, unknown>): Answer => {
    const heading = response.content[0]?.text.split('\n')[0] ?? ''
    const text = toAgentAnswer(collection, heading, doc)
    return text === null ? response : { content: [{ type: 'text', text }] }
  }

// In memory: the site runs as one PM2 process
const requests = new SlidingWindowCounter(MCP_LIMITS.windowMs, MCP_LIMITS.trackedKeys)

/**
 * The plugin's own key check, then two of ours: the key's account must still be an agent (a key
 * never acts as staff, even if the account's role changed), and each key gets a few requests a
 * minute, then 429.
 */
const checkAgentKey = async (
  _req: PayloadRequest,
  defaultSettings: (apiKey?: null | string) => Promise<MCPAccessSettings>,
): Promise<MCPAccessSettings> => {
  const settings = await defaultSettings()
  if (!hasAgent(settings.user)) throw new UnauthorizedError()
  if (!requests.tryTake(String(settings.id), MCP_LIMITS.perKey, Date.now())) {
    throw new APIError('Too many requests for this key. Try again in a minute.', 429, null, true)
  }
  return settings
}

/**
 * Agent access through Payload's official MCP plugin at `/api/mcp` (#336). Each request carries
 * an API key that acts as an agent account, so collection access decides what it may do: find
 * published events, posts and categories, suggest drafts and report items with its two tools,
 * and keep its own run history.
 * The per-key checkboxes in Admin can only narrow that.
 */
export const mcpOptions: MCPPluginConfig = {
  collections: {
    // Agents suggest through `submitSuggestion`, not the plugin's raw create
    events: {
      enabled: { find: true },
      description: 'Published neighborhood events. Suggest new ones with submitSuggestion.',
      overrideResponse: answerFor('events'),
    },
    posts: {
      enabled: { find: true },
      description: 'Published neighborhood news posts. Suggest new ones with submitSuggestion.',
      overrideResponse: answerFor('posts'),
    },
    categories: {
      enabled: { find: true },
      description: 'Post categories, to file a suggested post under.',
      overrideResponse: answerFor('categories'),
    },
    [AGENT_RUNS]: {
      enabled: { find: true, create: true, update: true },
      description:
        'Your run history: create one run per run (its id goes to submitSuggestion and ' +
        'reportItem), update it as you go, and find your last runs to resume from their ' +
        'source cursors. You see only your own runs.',
      overrideResponse: answerFor(AGENT_RUNS),
    },
  },
  overrideApiKeyCollection: adminOnlyApiKeys,
  overrideAuth: checkAgentKey,
  mcp: {
    tools: [submitSuggestionTool, reportItemTool],
    serverOptions: {
      serverInfo: { name: 'Sprecher East', version: '1.0.0' },
      instructions:
        'Sprecher East neighborhood website (Madison, WI). Read published events and posts, and ' +
        'suggest new ones for staff to review. Nothing you create is published.',
    },
  },
}
