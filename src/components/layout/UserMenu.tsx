'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { LogIn, LogOut, User, ChevronDown } from 'lucide-react'
import { useSession, signOut } from '@/lib/auth-client'

export function UserMenu() {
  const { data: session, isPending } = useSession()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  if (isPending) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-surface" />
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
      >
        <LogIn className="h-3.5 w-3.5" />
        Sign In
      </Link>
    )
  }

  const user = session.user
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex items-center gap-1.5"
        aria-label="User menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white select-none">
          {initials}
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-white py-1 shadow-lg">
          {/* User info */}
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {user.name ?? 'Neighbor'}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground transition-colors hover:bg-surface"
            >
              <User className="h-4 w-4 text-muted" />
              My Profile
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-border py-1">
            <button
              onClick={async () => {
                setOpen(false)
                await signOut()
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
