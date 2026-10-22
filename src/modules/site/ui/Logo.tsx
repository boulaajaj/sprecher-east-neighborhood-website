import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span className={clsx('inline-flex items-baseline gap-1.5 text-xl tracking-tight', className)}>
      <span className="font-bold text-primary">Sprecher</span>
      <span className="font-light text-foreground">East</span>
    </span>
  )
}
