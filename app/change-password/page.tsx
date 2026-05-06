'use client'

import { useState, type FormEvent } from 'react'
import { changePasswordAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TLP } from '@/lib/theme/tokens'

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const formData = new FormData()
    formData.set('password', password)
    formData.set('confirm', confirm)

    const result = await changePasswordAction(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // On success the action redirects
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${TLP.navy} 0%, ${TLP.navyLight} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          background: TLP.white,
          borderRadius: 18,
          padding: '44px 40px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.35)',
        }}
      >
        <h1
          style={{
            margin: '0 0 6px',
            fontSize: 24,
            fontWeight: 800,
            color: TLP.navy,
            letterSpacing: '-0.4px',
          }}
        >
          Set your password
        </h1>
        <p style={{ margin: '0 0 24px', color: TLP.gray500, fontSize: 14 }}>
          You must set a password before continuing.
        </p>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Input
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Input
            label="Confirm password"
            type="password"
            placeholder="Repeat your new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {error && (
            <div
              style={{
                background: TLP.redLight,
                color: TLP.red,
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            style={{ marginTop: 6, justifyContent: 'center' }}
          >
            {loading ? 'Saving…' : 'Set password'}
          </Button>
        </form>
      </div>
    </div>
  )
}
