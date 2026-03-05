import Link from 'next/link'
import React from 'react'
import { Home } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-28 text-center">
      <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
      <p className="mb-8 text-lg text-muted-foreground">This page could not be found.</p>
      <Button asChild variant="default">
        <Link href="/" className="gap-2">
          <Home className="h-4 w-4" />
          Go home
        </Link>
      </Button>
    </div>
  )
}
