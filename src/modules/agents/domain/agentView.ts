/**
 * What an agent sees of a document over MCP (#336): an allowlist per collection, so nothing
 * personal reaches the model (no authors, no rich text, nothing from users or form submissions).
 * Related documents are reduced to their ids.
 */

const REVIEW_QUEUE = [
  '_status',
  'moderationStatus',
  'sourceName',
  'sourceUrl',
  'externalId',
  'contentHash',
  'audience',
  'createdAt',
  'updatedAt',
] as const

export const AGENT_VIEWS: Readonly<Record<string, readonly string[]>> = {
  events: [
    'id',
    'title',
    'slug',
    'date',
    'timeStart',
    'timeEnd',
    'cancelled',
    'category',
    'locationType',
    'locationName',
    'locationAddress',
    'mapsUrl',
    'registrationUrl',
    'description',
    ...REVIEW_QUEUE,
  ],
  posts: ['id', 'title', 'slug', 'categories', 'publishedAt', 'meta', ...REVIEW_QUEUE],
  categories: ['id', 'title', 'slug', 'parent'],
  'agent-runs': [
    'id',
    'agent',
    'agentName',
    'status',
    'startedAt',
    'finishedAt',
    'sources',
    'counts',
    'errorMessages',
    'cost',
    'createdAt',
    'updatedAt',
  ],
}

type Plain = null | boolean | number | string | Plain[] | { [key: string]: Plain }

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** A populated document (it has an id and timestamps), as opposed to an array row or a group. */
const isDocument = (value: Record<string, unknown>): boolean =>
  'id' in value && 'createdAt' in value

/** Keeps a value as plain data, with every populated document replaced by its id. */
function toPlain(value: unknown): Plain {
  if (Array.isArray(value)) return value.map(toPlain)
  if (isRecord(value)) {
    if (isDocument(value)) return toPlain(value.id)
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toPlain(v)]))
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  return null
}

/** The fields of one document an agent may see; a collection with no view shows nothing. */
export function toAgentView(collection: string, doc: Record<string, unknown>): Plain {
  const allowed = AGENT_VIEWS[collection] ?? []
  const view: Record<string, Plain> = {}
  for (const key of allowed) {
    if (key in doc) view[key] = toPlain(doc[key])
  }
  // `meta` is the SEO group: only its title and description
  if (isRecord(view.meta)) {
    const { title = null, description = null } = view.meta
    view.meta = { title, description }
  }
  return view
}

/**
 * The text an MCP tool answers with, rebuilt from the allowlisted view: `heading` is the first
 * line of the plugin's own answer ("Resource created…", "Collection: …"). Null when there is no
 * document (an error answer, which carries no document data and is kept as it is).
 */
export function toAgentAnswer(
  collection: string,
  heading: string,
  result: Record<string, unknown>,
): string | null {
  if (Array.isArray(result.docs)) {
    const docs = result.docs.filter(isRecord).map((doc) => toAgentView(collection, doc))
    const total = `Total: ${String(result.totalDocs ?? docs.length)} documents`
    const page = `Page: ${String(result.page ?? 1)} of ${String(result.totalPages ?? 1)}`
    return [heading, total, page, ...docs.map((doc) => JSON.stringify(doc))].join('\n')
  }
  if ('id' in result) return `${heading}\n${JSON.stringify(toAgentView(collection, result))}`
  return null
}
