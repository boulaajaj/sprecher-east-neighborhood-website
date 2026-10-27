import { LogIn } from 'lucide-react'
import React from 'react'

import { Alert } from '@/platform/ui/Alert'
import { buttonVariants } from '@/platform/ui/Button'

import { SOCIAL_PROVIDER_NAMES, socialStartPath, type SocialProvider } from '../domain/socialSignIn'
import { parseSocialResult, SOCIAL_SIGN_IN_MESSAGES } from './socialSignInMessages'

type Props = {
  /** The providers that are on (`enabledProviders`); none shows nothing but the message */
  providers: SocialProvider[]
  /** The `?social=` value a provider sign-in came back with */
  result?: unknown
}

/**
 * "Continue with Google" and "Continue with Facebook" on `/login` and `/sign-up` (#188), shown
 * only for the providers whose keys are set, and the fixed message a provider sign-in came back
 * with. Each button is a plain link, so the browser leaves the site for the provider: a client
 * navigation or a prefetch would start a sign-in nobody asked for. No brand logos: the kit's
 * icons only (`lucide-react`).
 */
export function SocialSignIn({ providers, result }: Props) {
  const message = parseSocialResult(result)
  if (providers.length === 0 && !message) return null
  return (
    <div className="space-y-4">
      {message && (
        <Alert tone={message === 'check-email' ? 'info' : 'error'}>
          {SOCIAL_SIGN_IN_MESSAGES[message]}
        </Alert>
      )}
      {providers.length > 0 && (
        <div className="space-y-3">
          {providers.map((provider) => (
            <a
              key={provider}
              href={socialStartPath(provider)}
              className={buttonVariants({ variant: 'secondary', fullWidth: true })}
            >
              <LogIn aria-hidden />
              Continue with {SOCIAL_PROVIDER_NAMES[provider]}
            </a>
          ))}
          <p className="text-center text-sm text-muted-foreground">
            or use your email and password
          </p>
        </div>
      )}
    </div>
  )
}
