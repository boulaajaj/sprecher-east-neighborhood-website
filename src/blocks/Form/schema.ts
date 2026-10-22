import type { FormFieldBlock } from '@payloadcms/plugin-form-builder/types'
import { z } from 'zod'

const REQUIRED = 'This field is required'
const CHOOSE = 'Choose an option'
const TICK = 'Tick this box to continue'
const EMAIL = 'Enter an email address, like name@example.com'
/** The check the email field has always made: text, an @, more text, and no spaces */
const EMAIL_PATTERN = /^\S[^\s@]*@\S+$/

/** The value fields this site renders. The plugin's types leave out `number`. */
export type ValueField =
  | Extract<
      FormFieldBlock,
      { blockType: 'text' | 'email' | 'textarea' | 'select' | 'state' | 'country' | 'checkbox' }
    >
  | {
      blockType: 'number'
      name: string
      label?: string
      required?: boolean
      width?: number
      defaultValue?: number | string
    }

/** A field block as the CMS sends it, `number` included */
export type FormField = FormFieldBlock | ValueField

const VALUE_FIELD_TYPES = new Set<string>([
  'text',
  'email',
  'number',
  'textarea',
  'select',
  'state',
  'country',
  'checkbox',
])

export const isValueField = (field: FormField): field is ValueField =>
  VALUE_FIELD_TYPES.has(field.blockType)

function toFieldSchema(field: ValueField): z.ZodType {
  if (field.blockType === 'checkbox') {
    return field.required ? z.boolean().refine((ticked) => ticked, TICK) : z.boolean()
  }
  const text = z.string().trim()
  const choice = ['select', 'state', 'country'].includes(field.blockType)
  const filled = field.required ? text.min(1, choice ? CHOOSE : REQUIRED) : text
  if (field.blockType !== 'email') return filled
  return filled.refine((value) => value === '' || EMAIL_PATTERN.test(value), EMAIL)
}

/**
 * The Zod schema for a form built in the CMS: one entry per value field, checked the way the
 * fields always were (required, and the email pattern). Values are trimmed; anything that isn't
 * one of the form's fields is dropped.
 */
export function toFormSchema(fields: readonly FormField[]) {
  const shape: Record<string, z.ZodType> = {}
  for (const field of fields) {
    if (isValueField(field)) shape[field.name] = toFieldSchema(field)
  }
  return z.object(shape)
}

/** Every field starts empty or unticked, unless the form gives it a default. */
export function toDefaultValues(fields: readonly FormField[]) {
  const values: Record<string, string | boolean> = {}
  for (const field of fields) {
    if (!isValueField(field)) continue
    // A number field's default is a number; its input holds text
    values[field.name] =
      field.blockType === 'checkbox'
        ? (field.defaultValue ?? false)
        : String(field.defaultValue ?? '')
  }
  return values
}
