'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

import type { FeedPage } from '@/utilities/feeds'
import { cn } from '@/utilities/ui'

/**
 * Pages loaded automatically while scrolling, counting the first page. After that the
 * reader clicks "Load more", so the footer stays reachable on long lists (the usual
 * failure of pure infinite scroll).
 */
const AUTO_LOAD_PAGES = 4

type Status = 'idle' | 'loading' | 'error'

export function useLoadMore<T extends { id: number | string }>(
  initial: FeedPage<T>,
  load: (page: number) => Promise<FeedPage<T>>,
) {
  const [items, setItems] = useState<T[]>(initial.docs)
  const [page, setPage] = useState(initial.page)
  const [totalPages, setTotalPages] = useState(initial.totalPages)
  const [totalDocs, setTotalDocs] = useState(initial.totalDocs)
  const [status, setStatus] = useState<Status>('idle')
  const [pagesLoaded, setPagesLoaded] = useState(1)
  const inFlight = useRef(false)

  const hasMore = page < totalPages

  const loadMore = useCallback(async () => {
    if (inFlight.current || !hasMore) return
    inFlight.current = true
    setStatus('loading')
    try {
      const next = await load(page + 1)
      setItems((prev) => {
        // Content can shift between requests (a new post is published); skip repeats.
        const seen = new Set(prev.map((item) => item.id))
        return [...prev, ...next.docs.filter((item) => !seen.has(item.id))]
      })
      setPage(next.page)
      setTotalPages(next.totalPages)
      setTotalDocs(next.totalDocs)
      setPagesLoaded((n) => n + 1)
      setStatus('idle')
    } catch {
      setStatus('error')
    } finally {
      inFlight.current = false
    }
  }, [hasMore, load, page])

  return {
    items,
    hasMore,
    status,
    loadMore,
    totalDocs,
    firstItemNumber: (initial.page - 1) * initial.limit + 1,
    autoLoad: pagesLoaded < AUTO_LOAD_PAGES,
  }
}

type LoadMoreFooterProps = {
  /** Plural noun for status text, e.g. "posts" or "upcoming events". */
  noun: string
  shownCount: number
  firstItemNumber: number
  totalDocs: number
  hasMore: boolean
  status: Status
  autoLoad: boolean
  onLoadMore: () => void
  /** Real URL of the next page, so "Load more" also works without JavaScript. */
  fallbackHref?: string
  className?: string
}

export const LoadMoreFooter: React.FC<LoadMoreFooterProps> = ({
  noun,
  shownCount,
  firstItemNumber,
  totalDocs,
  hasMore,
  status,
  autoLoad,
  onLoadMore,
  fallbackHref,
  className,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null)

  // Infinite scroll: load the next page shortly before the reader reaches the end.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore || !autoLoad || status !== 'idle') return
    if (typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore()
      },
      { rootMargin: '0px 0px 600px 0px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [autoLoad, hasMore, onLoadMore, status])

  if (totalDocs === 0) return null

  const lastItemNumber = firstItemNumber + shownCount - 1
  const range = firstItemNumber > 1 ? `${firstItemNumber}–${lastItemNumber}` : `${lastItemNumber}`
  const statusText = hasMore
    ? `Showing ${range} of ${totalDocs} ${noun}`
    : firstItemNumber > 1
      ? `Showing ${range} of ${totalDocs} ${noun} — that's the end of the list`
      : `That's all ${totalDocs} ${noun}`

  const buttonClassName =
    'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-primary px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60'

  return (
    <div className={cn('mt-10 flex flex-col items-center gap-4 text-center', className)}>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
        {status === 'loading' ? `Loading more ${noun}…` : statusText}
      </p>

      {status === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          Couldn&apos;t load more {noun}. Check your connection and try again.
        </p>
      )}

      {hasMore &&
        (fallbackHref ? (
          <a
            href={fallbackHref}
            aria-disabled={status === 'loading'}
            className={buttonClassName}
            onClick={(event) => {
              event.preventDefault()
              onLoadMore()
            }}
          >
            {status === 'loading' && (
              <Loader2 aria-hidden="true" className="h-4 w-4 motion-safe:animate-spin" />
            )}
            {status === 'error' ? 'Try again' : `Load more ${noun}`}
          </a>
        ) : (
          <button
            type="button"
            disabled={status === 'loading'}
            className={buttonClassName}
            onClick={onLoadMore}
          >
            {status === 'loading' && (
              <Loader2 aria-hidden="true" className="h-4 w-4 motion-safe:animate-spin" />
            )}
            {status === 'error' ? 'Try again' : `Load more ${noun}`}
          </button>
        ))}
    </div>
  )
}
