'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

export function ResetPassword() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  // Accept multiple possible query param names for the token
  const token = useMemo(() => {
    // Primary sources from search params
    const t =
      searchParams.get('resetToken') ||
      searchParams.get('token') ||
      searchParams.get('reset_token') ||
      ''
    if (t) return t

    // Fallback: parse from current URL (handles edge cases and path segment tokens)
    try {
      const url = new URL(window.location.href)
      const params = new URLSearchParams(url.search)
      const fromParams =
        params.get('resetToken') || params.get('token') || params.get('reset_token')
      if (fromParams) return fromParams

      // Some links may embed the token as the last path segment
      const parts = url.pathname.split('/').filter(Boolean)
      const last = parts[parts.length - 1]
      if (last && last.length > 20) return last
    } catch {}

    return ''
  }, [searchParams])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) {
      toast({
        title: 'Missing reset token',
        description: 'The reset link is invalid or expired. Please request a new one.',
        variant: 'destructive',
      })
    }
  }, [token, toast])

  const validatePassword = (pwd: string) => {
    const lengthOk = pwd.length >= 8
    const hasUpper = /[A-Z]/.test(pwd)
    const hasLower = /[a-z]/.test(pwd)
    const hasNumber = /[0-9]/.test(pwd)
    return lengthOk && hasUpper && hasLower && hasNumber
  }

  const handleSubmit = async () => {
    if (!token) return
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' })
      return
    }
    if (!validatePassword(password)) {
      toast({
        title: 'Weak password',
        description: 'Use at least 8 chars with upper, lower, and a number.',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/fstack/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken: token, password }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        toast({
          title: 'Reset failed',
          description: err?.message || `Error ${res.status}. Please try again.`,
          variant: 'destructive',
        })
        return
      }

      toast({ title: 'Password updated', description: 'You can now log in.' })
      router.push('/login')
    } catch (e) {
      toast({ title: 'Network error', description: 'Please retry.', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-0 bg-card rounded-none sm:rounded-2xl overflow-hidden shadow-2xl">
        {/* Left side - Image (desktop) */}
        <div className="hidden lg:block relative bg-linear-to-br from-primary/10 to-primary/5">
          <img
            src="/mobile-app-signup-screen-with-verification.jpg"
            alt="Reset your password"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />
        </div>

        {/* Right side - Content */}
        <div className="p-4 sm:p-8 lg:p-16 flex flex-col justify-center">
          <Card className="p-6 sm:p-8 space-y-6 border-0 shadow-none">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-semibold">Reset Password</h1>
              <p className="text-sm text-muted-foreground">
                Enter a new password to complete your reset.
              </p>
            </div>

            {!token && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                Reset token not found. Request a new reset link.
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 8 characters, include upper, lower, and a number.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={submitting || !token}
              >
                {submitting ? 'Updating…' : 'Reset Password'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}