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
    return <div className="w-8 h-8 rounded-full bg-surface animate-pulse" />
  }

  if (!session) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
      >
        <LogIn className="w-3.5 h-3.5" />
        Sign In
      </Link>
    )
  }

  const user = session.user
  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : user.email[0].toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 group"
        aria-label="User menu"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center select-none">
          {initials}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-lg py-1 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-foreground truncate">{user.name ?? 'Neighbor'}</p>
            <p className="text-xs text-muted truncate">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-surface transition-colors"
            >
              <User className="w-4 h-4 text-muted" />
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
              className="flex items-center gap-2.5 px-4 py-2 w-full text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
