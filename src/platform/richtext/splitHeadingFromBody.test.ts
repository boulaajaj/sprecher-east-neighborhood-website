import { describe, expect, it } from 'vitest'

import { splitHeadingFromBody } from './splitHeadingFromBody'

const node = (type: string, label: string) => ({ type, label })
const doc = (...children: { type: string; label: string }[]) => ({
  root: { type: 'root', children },
})

describe('splitHeadingFromBody', () => {
  it('takes the first heading as the title and keeps the rest, in order, as the body', () => {
    const { heading, body } = splitHeadingFromBody(
      doc(node('paragraph', 'intro'), node('heading', 'Title'), node('heading', 'Sub')),
    )

    expect(heading?.root.children).toEqual([node('heading', 'Title')])
    expect(body?.root.children).toEqual([node('paragraph', 'intro'), node('heading', 'Sub')])
  })

  it('keeps the rest of the document around the split parts', () => {
    const { heading, body } = splitHeadingFromBody(doc(node('heading', 'Title'), node('p', 'x')))

    expect(heading?.root.type).toBe('root')
    expect(body?.root.type).toBe('root')
  })

  it('has no title when there is no heading', () => {
    const { heading, body } = splitHeadingFromBody(doc(node('paragraph', 'only text')))

    expect(heading).toBeNull()
    expect(body?.root.children).toEqual([node('paragraph', 'only text')])
  })

  it('has no body when the heading is all there is', () => {
    const { heading, body } = splitHeadingFromBody(doc(node('heading', 'Title')))

    expect(heading?.root.children).toEqual([node('heading', 'Title')])
    expect(body).toBeNull()
  })

  it('gives neither part for a missing document', () => {
    expect(splitHeadingFromBody(null)).toEqual({ heading: null, body: null })
    expect(splitHeadingFromBody(undefined)).toEqual({ heading: null, body: null })
  })
})
