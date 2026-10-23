import type { ArrayField, GroupField } from 'payload'
import { describe, expect, it } from 'vitest'

import { link } from './link'
import { linkGroup } from './linkGroup'

describe('link', () => {
  it('merges overrides into the defaults, keeping the functions they pass', () => {
    const condition = () => true
    const field = link({ overrides: { admin: { condition } } }) as GroupField

    expect(field.admin).toEqual({ hideGutter: true, condition })
    expect(field.admin?.condition).toBe(condition)
    // The default fields are untouched (compared without their per-call condition functions)
    expect(JSON.stringify(field.fields)).toBe(JSON.stringify((link() as GroupField).fields))
  })

  it('replaces an array instead of adding to it', () => {
    const field = link({ overrides: { fields: [] } }) as GroupField

    expect(field.fields).toEqual([])
  })
})

describe('linkGroup', () => {
  it('merges overrides into the list of links', () => {
    const field = linkGroup({ overrides: { maxRows: 2 } }) as ArrayField

    expect(field).toMatchObject({ name: 'links', type: 'array', maxRows: 2 })
    expect(field.admin).toEqual({ initCollapsed: true })
    expect(field.fields).toHaveLength(1)
  })
})
