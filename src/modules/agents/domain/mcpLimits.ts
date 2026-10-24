/**
 * How often one MCP API key may call `/api/mcp` (#336). Counted in memory, since the site runs as
 * one PM2 process. Generous for a run that looks up a few dozen items, small enough that a leaked
 * or runaway key can't flood the one-CPU server or the database.
 */
export const MCP_LIMITS = {
  windowMs: 60 * 1000,
  perKey: 60,
  /**
   * Requests per window from one connection (client IP), counted before the key is looked up,
   * as the form limits count before the robot check: guessing keys costs a database lookup each.
   */
  perConnection: 120,
  /** Bounded memory: past this many keys or connections, the oldest tracked one is forgotten. */
  trackedKeys: 200,
  trackedConnections: 2000,
} as const
