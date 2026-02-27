'use client'

import { useState } from 'react'
import { Github, Mail, AlertCircle } from 'lucide-react'
import { signIn, signUp } from '@/lib/auth-client'
import { Container } from '@/components/ui'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')

  const hasGoogle = true // enabled in auth.ts when env vars are set
  const hasGithub = true

  async function handleSocialLogin(provider: 'google' | 'github') {
    setStatus('loading')
    setError('')
    try {
      await signIn.social({ provider, callbackURL: '/' })
    } catch {
      setStatus('error')
      setError('Social login failed. Please try again.')
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setError('')
    try {
      if (mode === 'login') {
        const result = await signIn.email({ email, password, callbackURL: '/' })
        if (result?.error) throw new Error(result.error.message)
      } else {
        const result = await signUp.email({ email, password, name, callbackURL: '/' })
        if (result?.error) throw new Error(result.error.message)
      }
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-white border border-border rounded-xl text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
  const labelClass = 'block text-xs font-semibold text-foreground mb-1.5'

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Container>
        <div className="mx-auto max-w-md">
          {/* Header */}
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-semibold tracking-widest text-primary uppercase">
              Members
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {mode === 'login'
                ? 'Sign in to access neighborhood updates and community features.'
                : 'Join the Sprecher East community.'}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
            {/* Error banner */}
            {status === 'error' && (
              <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Social buttons */}
            <div className="mb-6 flex flex-col gap-3">
              {hasGoogle && (
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={status === 'loading'}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-surface disabled:opacity-50"
                >
                  {/* Google SVG icon */}
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              )}

              {hasGithub && (
                <button
                  onClick={() => handleSocialLogin('github')}
                  disabled={status === 'loading'}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-foreground bg-foreground px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Github className="h-5 w-5" />
                  Continue with GitHub
                </button>
              )}

              {/* Coming-soon providers (greyed out) */}
              {[
                { name: 'Apple', icon: '🍎' },
                { name: 'Facebook', icon: '📘' },
                { name: 'Twitter / X', icon: '𝕏' },
              ].map((p) => (
                <button
                  key={p.name}
                  disabled
                  title="Coming soon — requires additional setup"
                  className="flex w-full cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-2.5 text-sm font-medium text-muted opacity-50"
                >
                  <span className="text-base">{p.icon}</span>
                  Continue with {p.name}
                  <span className="ml-auto rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-normal">
                    Soon
                  </span>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-muted">or use email</span>
              </div>
            </div>

            {/* Email / password form */}
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              {mode === 'register' && (
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Smith"
                    autoComplete="name"
                    className={inputClass}
                  />
                </div>
              )}
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === 'loading' ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    {mode === 'login' ? 'Sign In with Email' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

            {/* Toggle mode */}
            <p className="mt-6 text-center text-sm text-muted">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login')
                  setError('')
                  setStatus('idle')
                }}
                className="font-semibold text-primary hover:underline"
              >
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            Your information is stored locally and never shared with third parties.
          </p>
        </div>
      </Container>
    </main>
  )
}
