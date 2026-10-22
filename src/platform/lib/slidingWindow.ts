/**
 * Counts events per key in a sliding time window, in memory (the site runs as one PM2 process).
 * The rate limits of public forms and confirmation emails use it. Memory is bounded: past
 * `maxKeys` keys, the one used least recently is forgotten.
 */
export class SlidingWindowCounter {
  private readonly times = new Map<string, number[]>()

  constructor(
    private readonly windowMs: number,
    private readonly maxKeys = 2000,
  ) {}

  /** How many more events `key` may have now under `limit` (never below 0). */
  room(key: string, limit: number, now: number): number {
    return Math.max(0, limit - this.recent(key, now).length)
  }

  /** Records `count` events for `key` at `now`. */
  record(key: string, now: number, count = 1): void {
    const times = this.recent(key, now)
    for (let i = 0; i < count; i++) times.push(now)
    // Re-insert, so this key becomes the newest entry
    this.times.delete(key)
    this.times.set(key, times)
    if (this.times.size > this.maxKeys) {
      const oldest = this.times.keys().next().value
      if (oldest !== undefined) this.times.delete(oldest)
    }
  }

  /** Records one event and answers true if `key` had room under `limit`; otherwise false. */
  tryTake(key: string, limit: number, now: number): boolean {
    if (this.room(key, limit, now) === 0) return false
    this.record(key, now)
    return true
  }

  private recent(key: string, now: number): number[] {
    return (this.times.get(key) ?? []).filter((t) => now - t < this.windowMs)
  }
}
