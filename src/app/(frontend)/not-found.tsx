import React from 'react'
import { Home } from 'lucide-react'

import { Button } from '@/platform/ui'

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-28 text-center">
      <h1 className="mb-2 text-6xl font-bold text-foreground">404</h1>
      <p className="mb-8 text-lg text-muted-foreground">This page could not be found.</p>
      <Button href="/" iconStart={<Home aria-hidden="true" />}>
        Go home
      </Button>
    </div>
  )
}
