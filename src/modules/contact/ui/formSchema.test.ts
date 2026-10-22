import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { toDefaultValues, toFormSchema } from './formSchema'

const fields = [
  { blockType: 'text', name: 'name', label: 'Name', required: true },
  { blockType: 'email', name: 'email', label: 'Email', required: true },
  { blockType: 'email', name: 'altEmail', label: 'Other email' },
  { blockType: 'textarea', name: 'message', label: 'Message', defaultValue: 'Hi' },
  { blockType: 'checkbox', name: 'agree', label: 'I agree', required: true },
  { blockType: 'checkbox', name: 'news', label: 'Newsletter' },
  {
    blockType: 'select',
    name: 'subject',
    label: 'Subject',
    required: true,
    options: [{ label: 'General', value: 'general' }],
  },
  { blockType: 'message', message: {} },
] as FormFieldBlock[]

const valid = {
  name: 'Ada',
  email: 'ada@example.com',
  altEmail: '',
  message: 'Hello',
  agree: true,
  news: false,
  subject: 'general',
}

const errorsOf = (values: Record<string, unknown>) => {
  const result = toFormSchema(fields).safeParse(values)
  return result.success ? {} : z.flattenError(result.error).fieldErrors
}

describe('toFormSchema', () => {
  it('accepts a complete submission and keeps only the form’s fields', () => {
    const result = toFormSchema(fields).safeParse({ ...valid, extra: 'x' })

    expect(result.success && result.data).toEqual(valid)
  })

  it('asks for each required field, including a whitespace-only one', () => {
    expect(errorsOf({ ...valid, name: '  ', subject: '', agree: false })).toEqual({
      name: ['This field is required'],
      subject: ['Choose an option'],
      agree: ['Tick this box to continue'],
    })
  })

  it('checks an email address only when one is given', () => {
    expect(errorsOf({ ...valid, email: 'ada', altEmail: 'not an email' })).toEqual({
      email: ['Enter an email address, like name@example.com'],
      altEmail: ['Enter an email address, like name@example.com'],
    })
    expect(errorsOf({ ...valid, altEmail: '' })).toEqual({})
  })

  it('trims what visitors type', () => {
    const result = toFormSchema(fields).safeParse({ ...valid, name: '  Ada ' })

    expect(result.success && result.data.name).toBe('Ada')
  })
})

describe('toDefaultValues', () => {
  it('starts checkboxes unticked and selects empty, and text fields only with a set default', () => {
    // A text field left out keeps what was typed or autofilled before the page loaded
    expect(toDefaultValues(fields)).toEqual({
      message: 'Hi',
      agree: false,
      news: false,
      subject: '',
    })
  })
})
