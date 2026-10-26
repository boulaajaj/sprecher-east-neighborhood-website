import type { RequiredDataFromCollectionSlug } from 'payload'
import { heading, paragraph, text, root } from './helpers/lexical'

// Used for pre-seeded content so that the homepage is not empty
export const homeStatic: RequiredDataFromCollectionSlug<'pages'> = {
  slug: 'home',
  _status: 'published',
  hero: {
    type: 'lowImpact',
    richText: root([
      heading('h1', 'Sprecher East'),
      paragraph(
        text(
          'Welcome to Sprecher East \u2014 a grassroots neighborhood initiative on Madison\u2019s Far East Side. The full site is on its way.',
        ),
      ),
    ]),
  },
  meta: {
    description:
      'Sprecher East is a grassroots neighborhood initiative on Madison\u2019s Far East Side \u2014 connecting residents of Meadowlands, Door Creek, and Reston Heights.',
    title: 'Home',
  },
  title: 'Home',
  layout: [],
}
