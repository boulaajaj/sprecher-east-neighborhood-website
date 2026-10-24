/**
 * How often one MCP API key may call `/api/mcp` (#336). Counted in memory, since the site runs as
 * one PM2 process. Generous for a run that looks up a few dozen items, small enough that a leaked
 * or runaway key can't flood the one-CPU server or the database.
 */
export const MCP_LIMITS = {
  windowMs: 60 * 1000,
  perKey: 60,
  /** Bounded memory: past this many keys, the oldest tracked one is forgotten. */
  trackedKeys: 200,
} as const
