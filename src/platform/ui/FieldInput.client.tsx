'use client'

import { cn } from '@/platform/lib/cn'
import type { VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'

import { controlVariants } from './controlVariants'
import { useFieldControl } from './fieldContext'

export type FieldInputProps = Omit<ComponentProps<'input'>, 'type' | 'size' | 'id'> &
  VariantProps<typeof controlVariants> & {
    type?: 'text' | 'email' | 'number' | 'password' | 'search'
    /** A decorative icon inside the box, before the text (the search box's magnifier) */
    leadingIcon?: ReactNode
  }

/**
 * A one-line text input; place it inside a `Field`, which gives it its id and ARIA links. Works
 * controlled (`value`, `onChange`) or with react-hook-form's `{...register(name)}`.
 */
export function FieldInput({
  type = 'text',
  size,
  leadingIcon,
  className,
  ...rest
}: FieldInputProps) {
  const field = useFieldControl('Field.Input')
  const input = (
    <input
      {...rest}
      {...field}
      type={type}
      className={cn(
        controlVariants({ size }),
        leadingIcon && (size === 'lg' ? 'pl-11' : 'pl-10'),
        className,
      )}
    />
  )
  if (!leadingIcon) return input

  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 text-muted-foreground [&_svg]:size-5"
      >
        {leadingIcon}
      </span>
      {input}
    </div>
  )
}
