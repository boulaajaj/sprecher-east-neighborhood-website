'use client'

import React, { useCallback, useState } from 'react'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ChangePasswordForm({ userId }: { userId: number }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError('')
      setSuccess(false)

      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters.')
        return
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }

      setLoading(true)

      try {
        const res = await fetch(`/api/users/${userId}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: newPassword }),
        })

        if (res.ok) {
          setSuccess(true)
          setNewPassword('')
          setConfirmPassword('')
        } else {
          const data = await res.json().catch(() => null)
          setError(data?.errors?.[0]?.message || 'Failed to update password. Please try again.')
        }
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [newPassword, confirmPassword, userId],
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">Password updated successfully.</Alert>}

      <div className="space-y-1">
        <Label htmlFor="new-password">New Password</Label>
        <Input
          id="new-password"
          type="password"
          required
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            if (error) setError('')
            if (success) setSuccess(false)
          }}
          placeholder="Minimum 8 characters"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirm-password">Confirm New Password</Label>
        <Input
          id="confirm-password"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            if (error) setError('')
            if (success) setSuccess(false)
          }}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </Button>
    </form>
  )
}
