import type { RequiredDataFromCollectionSlug } from 'payload'
import { heading, paragraph, text, linkNode, root, p } from './helpers/lexical'

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
          'Welcome to Sprecher East \u2014 a grassroots neighborhood initiative on Madison\u2019s Far East Side. ',
        ),
        linkNode('Visit the admin dashboard', '/admin'),
        text(' to set up your account and seed the full site content.'),
      ),
    ]),
  },
  meta: {
    description:
      'Sprecher East is a grassroots neighborhood initiative on Madison\u2019s Far East Side \u2014 connecting residents of Meadowlands, Door Creek, and Reston Heights.',
    title: 'Sprecher East',
  },
  title: 'Home',
  layout: [],
}
