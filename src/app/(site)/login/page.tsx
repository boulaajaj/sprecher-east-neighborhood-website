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

  const hasGoogle = true  // enabled in auth.ts when env vars are set
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
    } catch (err: any) {
      setStatus('error')
      setError(err.message ?? 'Something went wrong. Please try again.')
    }
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-white border border-border rounded-xl text-foreground text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors'
  const labelClass = 'block text-xs font-semibold text-foreground mb-1.5'

  return (
    <main className="min-h-screen bg-background flex items-center justify-center py-16 px-4">
      <Container>
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-2">
              Members
            </p>
            <h1 className="text-3xl font-bold text-foreground">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-muted text-sm mt-2 leading-relaxed">
              {mode === 'login'
                ? 'Sign in to access neighborhood updates and community features.'
                : 'Join the Sprecher East community.'}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
            {/* Error banner */}
            {status === 'error' && (
              <div className="flex gap-2 items-start bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Social buttons */}
            <div className="flex flex-col gap-3 mb-6">
              {hasGoogle && (
                <button
                  onClick={() => handleSocialLogin('google')}
                  disabled={status === 'loading'}
                  className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-white border border-border rounded-xl text-sm font-medium text-foreground hover:bg-surface transition-colors disabled:opacity-50"
                >
                  {/* Google SVG icon */}
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              )}

              {hasGithub && (
                <button
                  onClick={() => handleSocialLogin('github')}
                  disabled={status === 'loading'}
                  className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-foreground border border-foreground rounded-xl text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Github className="w-5 h-5" />
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
                  className="flex items-center justify-center gap-3 w-full py-2.5 px-4 bg-surface border border-border rounded-xl text-sm font-medium text-muted opacity-50 cursor-not-allowed"
                >
                  <span className="text-base">{p.icon}</span>
                  Continue with {p.name}
                  <span className="ml-auto text-xs font-normal bg-surface border border-border rounded-full px-2 py-0.5">
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
                <span className="px-3 bg-white text-muted">or use email</span>
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
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {status === 'loading' ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    {mode === 'login' ? 'Sign In with Email' : 'Create Account'}
                  </>
                )}
              </button>
            </form>

            {/* Toggle mode */}
            <p className="text-center text-sm text-muted mt-6">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setStatus('idle') }}
                className="text-primary font-semibold hover:underline"
              >
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-muted mt-4">
            Your information is stored locally and never shared with third parties.
          </p>
        </div>
      </Container>
    </main>
  )
}
