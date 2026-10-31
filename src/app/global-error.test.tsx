import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import GlobalError from './global-error'

describe('the global error page', () => {
  it('brings its own document and says what happened without the error’s text', () => {
    const html = renderToStaticMarkup(
      <GlobalError error={new Error('Failed query: params ada@example.com')} retry={() => {}} />,
    )

    expect(html).toContain('<html lang="en"><head></head><body>')
    expect(html).toContain('Something went wrong on our side')
    expect(html).toContain('Try again')
    expect(html).not.toContain('ada@example.com')
  })
})
