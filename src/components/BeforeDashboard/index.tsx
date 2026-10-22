import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { isSeedEnabled } from '@/platform/payload/isSeedEnabled'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

/** Short orientation for editors at the top of the admin dashboard. */
const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Welcome to the Sprecher East admin</h4>
      </Banner>
      A few things to know:
      <ul className={`${baseClass}__instructions`}>
        {/* The seed deletes nearly all content, so it is offered in local development only (#147) */}
        {isSeedEnabled() && (
          <li>
            <SeedButton />
            {
              ' with demo pages, posts and events (local development only; it replaces the content), then '
            }
            <a href="/" rel="noopener noreferrer" target="_blank">
              open the site
            </a>
            {' to see the results.'}
          </li>
        )}
        <li>
          Pages, posts, events, FAQs and resources stay drafts until you press{' '}
          <strong>Publish</strong>. Use <strong>Preview</strong> to check a page or post before it
          goes live.
        </li>
        <li>
          Messages sent through the contact form are under <strong>Form Submissions</strong> (admins
          only).
        </li>
        <li>
          {'Published changes usually show on '}
          <a href="/" rel="noopener noreferrer" target="_blank">
            the public site
          </a>
          {' right away; lists can take up to 10 minutes to catch up.'}
        </li>
      </ul>
    </div>
  )
}

export default BeforeDashboard
