import type { CollectionConfig } from 'payload'

import { ROLES } from '@/platform/lib'
import { getServerSideURL } from '@/platform/lib/getURL'
import {
  isAdmin,
  isAdminFieldAccess,
  isAdminOrEditorBoolean,
  isAdminOrSelf,
} from '@/platform/payload/roles'

import { toResetPasswordEmail, toResetPasswordLink } from '../domain/resetEmail'
import { USERS } from '../domain/usersCollection'
import { toVerifyAccountEmail, toVerifyAccountLink } from '../domain/verifyAccountEmail'
import { forgotPasswordFromSiteOnly } from './forgotPasswordFromSiteOnly'
import { noResetEmailWhileUnverified } from './noResetEmailWhileUnverified'
import { requireCurrentPassword } from './requireCurrentPassword'

/** The reset email for a token Payload just made: its link opens the site's reset page. */
const resetEmailFor = (token = '') =>
  toResetPasswordEmail(toResetPasswordLink(getServerSideURL(), token))

/** The verification email for a new account's token: its link opens the site's verify page. */
const verifyEmailFor = (token = '') =>
  toVerifyAccountEmail(toVerifyAccountLink(getServerSideURL(), token))

export const Users: CollectionConfig = {
  slug: USERS,
  access: {
    admin: isAdminOrEditorBoolean,
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelf,
    // Payload's default lets any account unlock any other, undoing the login lockout (#140)
    unlock: isAdmin,
    update: isAdminOrSelf,
  },
  admin: {
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: {
    cookies: {
      // Secure in production, so browsers send the sign-in cookie over HTTPS only (#234). Decided
      // by NODE_ENV rather than the server URL: a production build is secure even if the URL is
      // misconfigured as http, while `next dev` on http://localhost still signs in. Signing in
      // over plain http in production (the IP on port 80) stops working, on purpose.
      secure: process.env.NODE_ENV === 'production',
    },
    // Payload's forgot-password email, branded and linking to the site's /reset-password page
    // instead of /admin/reset, so residents never land in the admin (#269). The link uses the
    // configured site address, never the request's Host header.
    forgotPassword: {
      generateEmailHTML: (args) => resetEmailFor(args?.token).html,
      generateEmailSubject: (args) => resetEmailFor(args?.token).subject,
    },
    // A new account can't sign in until its email is verified through Payload's one-time link
    // (#187), branded and linking to the site's /verify-account page instead of the admin.
    // Accounts from before this are marked verified by the migration that turned it on.
    verify: {
      generateEmailHTML: (args) => verifyEmailFor(args?.token).html,
      generateEmailSubject: (args) => verifyEmailFor(args?.token).subject,
    },
  },
  hooks: {
    // Your own password changes only on /account, after your current one is checked (#233)
    beforeChange: [requireCurrentPassword],
    // Forgot password only from the site's page (#282), then no reset email to an account whose
    // email isn't verified yet (#187). The site-only check runs first, so a refused request never
    // reaches the account lookup.
    beforeOperation: [forgotPasswordFromSiteOnly, noResetEmailWhileUnverified],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: ROLES.resident,
      options: [
        { label: 'Admin', value: ROLES.admin },
        { label: 'Editor', value: ROLES.editor },
        { label: 'Resident', value: ROLES.resident },
      ],
      access: {
        create: isAdminFieldAccess,
        update: isAdminFieldAccess,
        read: () => true,
      },
      admin: {
        position: 'sidebar',
        description: 'Controls access level. Only admins can change roles.',
      },
    },
    // How often this account's verification email was sent again, and since when (#289). Only
    // the server reads and writes them: hidden from the API and the admin panel.
    { name: 'verificationResends', type: 'number', defaultValue: 0, hidden: true },
    { name: 'verificationResendsSince', type: 'date', hidden: true },
  ],
  timestamps: true,
}
