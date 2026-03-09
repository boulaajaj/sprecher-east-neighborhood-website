import type { RequiredDataFromCollectionSlug } from 'payload'
import type { Media } from '@/payload-types'
import { heading, paragraph, text, boldText, root, p } from './helpers/lexical'

type HomeArgs = {
  heroImage: Media
  metaImage: Media
}

export const home: (args: HomeArgs) => RequiredDataFromCollectionSlug<'pages'> = ({
  heroImage,
  metaImage,
}) => {
  return {
    slug: 'home',
    _status: 'published',
    hero: {
      type: 'highImpact',
      links: [
        {
          link: {
            type: 'custom',
            appearance: 'default',
            label: 'Upcoming Events',
            url: '/events',
          },
        },
        {
          link: {
            type: 'custom',
            appearance: 'outline',
            label: 'Get Involved',
            url: '/get-involved',
          },
        },
      ],
      media: heroImage.id,
      richText: root([
        heading('h1', 'Your Neighborhood, Your Community'),
        p(
          'Sprecher East is a grassroots neighborhood initiative on Madison\u2019s Far East Side \u2014 connecting residents of Meadowlands, Door Creek, and Reston Heights since 2006.',
        ),
      ]),
    },
    layout: [
      {
        blockName: 'About the Neighborhood',
        blockType: 'content',
        columns: [
          {
            richText: root([
              heading('h2', 'About the Neighborhood'),
              p(
                'Sprecher East covers the far east side of Madison, bounded by I-94 to the north, Door Creek Park to the east, Sprecher Road to the west, and Cottage Grove Road to the south. Our community includes the Meadowlands, Door Creek, and Reston Heights subdivisions.',
              ),
              p(
                'We\u2019re a free, voluntary neighborhood association \u2014 not an HOA. No dues, no fees, no mandatory rules. Just neighbors working together to make our corner of Madison a better place to live.',
              ),
            ]),
            size: 'twoThirds',
          },
          {
            richText: root([
              heading('h3', 'Quick Facts'),
              p('\u2713 Established 2006 \u2014 nearly 20 years serving our community'),
              p('\u2713 Far East Side \u2014 Madison\u2019s District 16'),
              p('\u2713 Three subdivisions \u2014 Meadowlands, Door Creek, Reston Heights'),
              p('\u2713 Free membership \u2014 open to all residents, no dues or fees'),
            ]),
            size: 'oneThird',
          },
        ],
      },
      {
        blockName: 'Recent News',
        blockType: 'archive',
        categories: [],
        introContent: root([
          heading('h3', 'Recent News'),
          p('Stay up to date with what\u2019s happening in the Sprecher East neighborhood.'),
        ]),
        populateBy: 'collection',
        relationTo: 'posts',
      },
      {
        blockName: 'Join Your Neighbors',
        blockType: 'cta',
        links: [
          {
            link: {
              type: 'custom',
              appearance: 'default',
              label: 'Get Involved',
              url: '/get-involved',
            },
          },
          {
            link: {
              type: 'custom',
              appearance: 'outline',
              label: 'Contact Us',
              url: '/contact',
            },
          },
        ],
        richText: root([
          heading('h3', 'Join Your Neighbors'),
          paragraph(
            text(
              'Whether you\u2019ve lived here for years or just moved in, there\u2019s a place for you. ',
            ),
            boldText('Membership is free and open to all residents.'),
          ),
        ]),
      },
    ],
    meta: {
      description:
        'Sprecher East is a grassroots neighborhood initiative on Madison\u2019s Far East Side \u2014 connecting residents of Meadowlands, Door Creek, and Reston Heights.',
      image: metaImage.id,
      title: 'Home',
    },
    title: 'Home',
  }
}
